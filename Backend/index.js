const express = require('express');
const cors = require('cors');

const app = express();

//config JSON response

app.use(express.json);

app.use(cors({credentials : true, origin:'http//localhost:3001'}));

//public folder for images 
app.use(express.static('public'));

//routes
const UserRoutes = require('./routes/UserRoutes');
app.use('/users', UserRoutes);

const BookRoutes = require('./routes/BookRoutes');
app.use('/books', BookRoutes);

app.listen(5001); 