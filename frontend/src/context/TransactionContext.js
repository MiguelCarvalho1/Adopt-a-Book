import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReceivedTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions/received');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching received transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions/sent');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching sent transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        fetchReceivedTransactions,
        fetchSentTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => useContext(TransactionContext);
