const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj(el);
    });
    return newObj;
}

exports.createUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                user: newUser
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};


exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

exports.getAllUsers = catchAsync(async (req, res, next) => {

    const users = await User.find();
    res.status(200).json({
        status: 'success',
        result: users.length,
        data: users
    });
});

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        return res.status('200').json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        console.log('user deleted');
    } catch (err) {

    }
}

exports.updateMe = catchAsync(async (req, res, next) => {

    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'this route is not for password update. Please use /updateMyPassword',
                400
            )
        );
    }

    // 2) Filtered out unwanted fields names that are not allowed tobe updated
    const filteredBody = filterObj(req.body, 'name', 'email', 'username');

    // 2) Update User document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'succes',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await user.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    });
});