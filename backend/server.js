require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

const port = process.env.PORT || 5555;
const url = process.env.DATABASE_URL;

mongoose.connect(url, () => {
    console.log('Database connected');
});

app.use(express.json());
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(cookieParser());
app.use('/api', routes);

app.listen(port, () => {
    console.log(`server is listening on ${port}`);
});