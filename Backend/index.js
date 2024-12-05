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

const TransactionRoutes = require('./routes/transactionRoutes');
app.use('/transactions', TransactionRoutes);

const ReviewRoutes = require('./routes/reviewRoutes');
app.use('/reviews', ReviewRoutes);

const UserBadgeRoutes = require('./routes/userBadgeRoutes');
app.use('/user-badges', UserBadgeRoutes);

const BadgeRoutes = require('./routes/badgeRoutes');
app.use('/badges', BadgeRoutes);

app.listen(5001); 