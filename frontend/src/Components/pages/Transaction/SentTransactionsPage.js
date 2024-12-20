import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import styles from './Transactions.module.css'; // Adicione estilos se necessário

const SentTransactions = () => {
  const [sentTransactions, setSentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    const fetchSentTransactions = async () => {
      try {
        const response = await api.get('/transactions/sent', {
          headers: { Authorization: `Bearer ${JSON.parse(token)}` },
        });
        setSentTransactions(response.data.transactions || []);
      } catch (err) {
        setError('Error fetching sent transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchSentTransactions();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.page_container}>
      <h2>My Sent Transactions</h2>
      {sentTransactions.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Book</th>
              <th>Status</th>
              <th>Transaction Type</th>
              <th>Receiver</th>
            </tr>
          </thead>
          <tbody>
            {sentTransactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction.bookId?.title || 'Unknown'}</td>
                <td>{transaction.status}</td>
                <td>{transaction.bookId?.transactionType || 'Unknown'}</td>
                <td>{transaction.senderId?.name || 'Awaiting receiver'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No sent transactions found.</p>
      )}
    </div>
  );
};

export default SentTransactions;
