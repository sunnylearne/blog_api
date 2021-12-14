const express = require("express");
const dotenv = require("dotenv");
const AppError = require('./utils/appError');
const golbalErrorHandler = require('./controllers/errorController');
const postRouter = require('./routes/postRoutes');
const userRouter = require('./routes/userRoutes');
const categoryRouter = require('./routes/categoryRoutes');

const app = express();
dotenv.config();
app.use(express.json());
app.use((req, res, next) => {
    req.requestTime = new date().toISOString();
    console.log(req.headers);

    next();
});




app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);

app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));


    // res.status(404).json({
    //     status:'fail',
    //     message:`Can't find ${req.originalUrl} on this server`
    // });
});

app.use(golbalErrorHandler);

module.exports = app;