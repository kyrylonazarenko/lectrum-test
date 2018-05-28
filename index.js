const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

const app = express();
const port = 4000;

app.listen(port);
console.log(`App started at port:${port} ENV:${process.env.NODE_ENV}`);

app.use(bodyParser.json({ type: 'application/json'}));
app.use(expressValidator());

require('./controllers/user')(app);

exports.app = app;
