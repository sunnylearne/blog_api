const mongoose = require("mongoose");

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION!, shutting down...');
    process.exit(1);

});

const app = require('./index');


mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(console.log("connected to MongoDB")).catch((err) => console.log(err));

const port = 3000;
const server = app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION!, shutting down...');
    server.close(() => {
        process.exit(1);
    });

});



