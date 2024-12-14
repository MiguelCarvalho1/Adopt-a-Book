import { useEffect, useState } from 'react';
import { useTransactionContext } from '../../../context/TransactionContext';
import styles from './Transactions.module.css';

const SentTransactionsPage = () => {
  const { fetchSentTransactions } = useTransactionContext();
  const [transactions, setTransactions] = useState([]); 

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchSentTransactions();
        setTransactions(data || []); 
      }catch (error) {
        console.error('Error fetching transactions:', error);
      }
    }
    loadTransactions();
  }, [fetchSentTransactions]); 

  return (
    <div className={styles.page_container}>
      <h1>Sent Transactions</h1>
      <div className={styles.table_container}>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div key={transaction._id}>
              <p><strong>Book:</strong> {transaction.bookId?.title}</p>
              <p><strong>To:</strong> {transaction.receiverId?.name}</p>
              <p><strong>Status:</strong> {transaction.status}</p>
            </div>
          ))
        ) : (
          <p>No sent transactions found.</p> // Caso não haja transações
        )}
      </div>
    </div>
  );
};

export default SentTransactionsPage;
