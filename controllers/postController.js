const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createPost = catchAsync(async (req, res, next) => {

    const newPost = await Post.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            post: newPost
        }
    });
});


exports.getPost = catchAsync(async (req, res, next) => {

    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new AppError('No post found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            post
        }
    });

});

exports.getAllPosts = catchAsync(async (req, res, next) => {

    const posts = await Post.find();
    res.status(200).json({
        status: 'success',
        result: posts.length,
        data: {
            posts
        }
    });

});

exports.updatePost = catchAsync(async (req, res, next) => {

    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!post) {
        return next(new AppError('No post found with that ID', 404));
    }

    return res.status('200').json({
        status: 'success',
        data: {
            post
        }
    });
});

exports.deletePost = catchAsync(async (req, res, next) => {

    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
        return next(new AppError('No post found with that ID', 404));
    }

    return res.status('204').json({
        status: 'success',
        data: null
    });
});

