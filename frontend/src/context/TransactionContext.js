import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [sentTransactions, setSentTransactions] = useState([]);
  const [receivedTransactions, setReceivedTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token') || '';

  // Function to fetch sent transactions
  async function fetchSentTransactions() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/transactions/sent', {
        headers: { Authorization: `Bearer ${JSON.parse(token)}` },
      });
      setSentTransactions(response.data.transactions);
    } catch (err) {
      console.error('Error fetching sent transactions:', err);
      setError('Failed to load sent transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  // Function to fetch received transactions
  async function fetchReceivedTransactions() {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/transactions/received', {
        headers: { Authorization: `Bearer ${JSON.parse(token)}` },
      });
      setReceivedTransactions(response.data.transactions);
    } catch (err) {
      console.error('Error fetching received transactions:', err);
      setError('Failed to load received transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        sentTransactions,
        receivedTransactions,
        loading,
        error,
        fetchReceivedTransactions,
        fetchSentTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => useContext(TransactionContext);
