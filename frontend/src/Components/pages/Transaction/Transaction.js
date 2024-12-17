import React, { useEffect, useState } from 'react';
import api from '../../../utils/api'; // Import the api instance

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions'); // Use the API instance
      setTransactions(response.data.transactions);
      setLoading(false);
    } catch (error) {
      setError('Error fetching transactions');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>My Transactions</h2>
      <div>
        {transactions.length > 0 ? (
          <ul>
            {transactions.map((transaction) => (
              <li key={transaction._id}>
                <h3>Book: {transaction.bookId.title}</h3>
                <p>Status: {transaction.status}</p>
                <p>Transaction Type: {transaction.transactionType}</p>
                <p>Sender: {transaction.senderId.name}</p>
                <p>Receiver: {transaction.receiverId ? transaction.receiverId.name : 'Awaiting receiver'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default Transactions;
