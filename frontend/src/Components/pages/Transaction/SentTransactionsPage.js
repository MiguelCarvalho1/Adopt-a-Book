import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';

const SentTransactions = () => {
  const [sentTransactions, setSentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token] = useState(localStorage.getItem('token') || ''); // Get the token from localStorage

  // Function to fetch sent transactions
  const fetchSentTransactions = async () => {
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/transactions/sent', {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,  // Use token directly from localStorage
        },
      });

      console.log(response.data); // Log the response data to check the structure
      if (response.data && response.data.transactions) {
        setSentTransactions(response.data.transactions);  // Set the transactions data to state
      } else {
        setError('No transactions data found');
      }
      setLoading(false);
    } catch (error) {
      console.error(error); // Log the error for better debugging
      setError('Error fetching sent transactions');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentTransactions();  // Call the fetch function to get sent transactions
  }, [token,]);  // Trigger the effect when token changes (or initially)

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>My Sent Transactions</h2>
      <div>
        {sentTransactions.length > 0 ? (
          <ul>
            {sentTransactions.map((transaction) => (
              <li key={transaction._id}>
                <h3>Book: {transaction.bookId.title}</h3>
                <p>Status: {transaction.status}</p>
                <p>Transaction Type: {transaction.transactionType}</p>
                <p>Receiver: {transaction.receiverId ? transaction.receiverId.name : 'Awaiting receiver'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No sent transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default SentTransactions;
