const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    createSendToken(newUser, 201, res);
    // const token = signToken(newUser._id);


    // res.status(201).json({
    //     status: 'success',
    //     token,
    //     data: {
    //         user: newUser
    //     }
    // });
});

exports.login = catchAsync(async (req, res, next) => {
    //const email = req.body.email;
    const { email, password } = req.body;

    //check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    // check if user exist and password is correct
    const user = await User.findOne({ email }).select('+password  ');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // check if everything is ok
    createSendToken(user, 200, res);
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token
    // });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Get token and check if it exist
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWidth('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    //console.log(token);

    if (!token) {
        return next(new AppError('You are not logged in! please log in to gain access', 401));
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //console.log(decoded);

    // 3) Check if user still exist
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('The user belonging to this token no longer exist', 401));
    }
    // 4) check if user changed password after the token has been issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again', 401)
        );
    }

    // Grant acess to protected routes
    req.user = freshUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles['admin', 'user']
        if (!roles.includes(req.user.role)) {
            return next(new AppError('you do not have permission to perform this action', 403));
        }
        next();
    }
}

exports.forgotpassword = catchAsync(async (req, res, next) => {
    //get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address', 404));
    }
    // generate the random reset token

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // send it to users email
    const resetURL = `${req.protocol}://${req.get('host')}/api/vi/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to:${resetURL}.\n If you didnt forget your password, please ignore this email`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token valid for 10 minutes',
            message: 'Token sent to email'
        });
        res.status(200).json({
            status: 'success',
            messsage: 'Token sent to email!'
        });
    } catch (err) {
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending email,try again later', 500));
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    // get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    // if token has not expired and there is a user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // update the changedPasswordAt property for the user

    // log the user in, send JWT
    createSendToken(user, 200, res);
    // const token = signToken(user._id);

    // res.status(200).json({
    //     status: 'success',
    //     token
    // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if posted current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    // 3) if so, update password 
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) lon in the user, send JWT
    createSendToken(user, 200, res);
});