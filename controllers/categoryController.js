const Category = require('../models/categoryModel');

exports.createCategory = async(req, res) => {
    try {
        const newCategory = await Category.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                category: newCategory
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
};


exports.getCategory = async(req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                category
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};
  
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            status:'success',
            result: categories.length,
            data:{
                categories
            }
        })
    } catch (err) {
        res.status(404).json({
            status:'fail',
            message: err
        })
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        return res.status('200').json({
            status: 'success',
            data: {
                category
            }
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id)
        return res.status('204').json({
            status: 'success',
            data: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}