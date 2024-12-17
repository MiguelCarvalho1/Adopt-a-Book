import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';

const ReceivedTransactions = () => {
  const [receivedTransactions, setReceivedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch received transactions
  const fetchReceivedTransactions = async () => {
    try {
      const response = await api.get('/transactions/received'); // Adjust the URL according to your API
      setReceivedTransactions(response.data.transactions);
      setLoading(false);
    } catch (error) {
      setError('Error fetching received transactions');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedTransactions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>My Received Transactions</h2>
      <div>
        {receivedTransactions.length > 0 ? (
          <ul>
            {receivedTransactions.map((transaction) => (
              <li key={transaction._id}>
                <h3>Book: {transaction.bookId.title}</h3>
                <p>Status: {transaction.status}</p>
                <p>Transaction Type: {transaction.transactionType}</p>
                <p>Sender: {transaction.senderId.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No received transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default ReceivedTransactions;