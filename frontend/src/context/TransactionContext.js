import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch received transactions
  const fetchReceivedTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions/received');
      setTransactions(response.data);
      return response.data; // Ensure data is returned
    } catch (error) {
      console.error('Error fetching received transactions:', error);
      return []; // Return an empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch sent transactions
  const fetchSentTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions/sent');
      setTransactions(response.data);
      return response.data; // Ensure data is returned
    } catch (error) {
      console.error('Error fetching sent transactions:', error);
      return []; // Return an empty array in case of error
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
