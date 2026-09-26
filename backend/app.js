var express = require('express');
var fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var morgan = require('morgan');
var pool = require('./mysql.config');
var app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static('public'));

// Routes
var indexRouter = require('./routes/index');
app.use("/api/v1", indexRouter);

var adminRouter = require('./routes/admin');
app.use("/api/v1/admin", adminRouter);

var userRouter = require('./routes/user');
app.use("/api/v1/user", userRouter);

var sellerRouter = require('./routes/seller');
app.use('/api/v1/seller', sellerRouter);

// Verify MySQL connection and Start Server
pool.getConnection()
    .then(connection => {
        const dbName = connection.config.database;
        console.log(`Database connected successfully: ${dbName}`);
        connection.release();

        var port = 5000;
        app.listen(port, (error) => {
            if (error) {
                console.log(error.message);
            } else {
                console.log("Server is running. http://localhost:" + port);
            }
        });
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    });
