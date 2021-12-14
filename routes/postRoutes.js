const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.protect, postController.getAllPosts).post(postController.createPost);
router.route('/:id').get(postController.getPost).patch(postController.updatePost).delete(authController.protect, authController.restrictTo('admin'), postController.deletePost);

module.exports = router;