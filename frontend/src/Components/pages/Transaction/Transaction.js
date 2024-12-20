import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import styles from './Transactions.module.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token] = useState(localStorage.getItem('token') || ''); // Token direto do localStorage

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    api
      .get('/transactions/mytransaction', {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      })
      .then((response) => {
        setTransactions(response.data.transactions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again later.');
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.page_container}>
      <h2>My Transactions</h2>
      {transactions.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Book</th>
              <th>Status</th>
              <th>Type</th>
              <th>Receiver</th>
              <th>Sender</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              // Determinar a classe de status dentro do mapeamento de transações
              const statusClass = styles[transaction.status.toLowerCase()] || styles.inprogress;

              return (
                <tr key={transaction._id}>
                  <td>{transaction.bookId?.title || 'Unknown'}</td>
                  <td className={`${styles.status} ${statusClass}`}>
                    {transaction.status}
                  </td>
                  <td>{transaction.bookId?.transactionType || 'Unknown'}</td>
                  <td>{transaction.senderId?.name || 'Unknown'}</td>
                  <td>{transaction.receiverId?.name || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
};

export default Transactions;
