import React, { useEffect, useState } from 'react';
import { useTransactionContext } from '../../../context/TransactionContext';
import styles from './Transactions.module.css';

const ReceivedRequests = () => {
  const { fetchReceivedTransactions } = useTransactionContext();
  const [transactions, setTransactions] = useState([]); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchReceivedTransactions();
        setTransactions(data || []); 
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false); 
      }
    };
    loadTransactions();
  }, [fetchReceivedTransactions]);

  return (
    <div className={styles.page_container}>
      <h1>Received Requests</h1>
      <div className={styles.table_container}>
        {loading ? (
          <p>Loading...</p> 
        ) : transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div key={transaction._id} className={styles.transaction_card}>
              <p><strong>Book:</strong> {transaction.bookId?.title}</p>
              <p><strong>From:</strong> {transaction.senderId?.name}</p>
              <p><strong>Status:</strong> {transaction.status}</p>
            </div>
          ))
        ) : (
          <p>No received requests found.</p>
        )}
      </div>
    </div>
  );
};

export default ReceivedRequests;
