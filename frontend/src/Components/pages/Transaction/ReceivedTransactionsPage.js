import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import styles from './Transactions.module.css';

import useFlashMessage from '../../../hooks/useFlashMessage'; // Adicione estilos se necessário

const ReceivedTransactions = () => {
  const [receivedTransactions, setReceivedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setFlashMessage } = useFlashMessage();
  const [error, setError] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false); // Correção aqui
  const token = localStorage.getItem('token') || '';

  // Fetching received transactions
  useEffect(() => {
    if (!token) {
      setError('No token found');
      setLoading(false);
      return;
    }

    const fetchReceivedTransactions = async () => {
      try {
        const response = await api.get('/transactions/received', {
          headers: { Authorization: `Bearer ${JSON.parse(token)}` },
        });
        setReceivedTransactions(response.data.transactions || []);
      } catch (err) {
        setError('Error fetching received transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchReceivedTransactions();
  }, [token]);

  // Função para aceitar transação
  const handleAcceptTransaction = async (transactionId) => {
    if (isRequesting) return; // Evita múltiplos cliques
    setIsRequesting(true);
    try {
       await api.patch(
        `/transactions/${transactionId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${JSON.parse(token)}` } }
      );
      setFlashMessage('Transaction accepted successfully', 'success');
      setReceivedTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === transactionId
            ? { ...transaction, status: 'Accepted' }
            : transaction
        )
      );
    } catch (err) {
      setFlashMessage('Error accepting transaction', 'error');
    } finally {
      setIsRequesting(false);
    }
  };

  // Função para rejeitar transação
  const handleRejectTransaction = async (transactionId) => {
    if (isRequesting) return; // Evita múltiplos cliques
    setIsRequesting(true);
    try {
       await api.patch(
        `/transactions/${transactionId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${JSON.parse(token)}` } }
      );
      setFlashMessage('Transaction rejected successfully', 'success');
      setReceivedTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction._id === transactionId
            ? { ...transaction, status: 'Rejected' }
            : transaction
        )
      );
    } catch (err) {
      setFlashMessage('Error rejecting transaction', 'error');
    } finally {
      setIsRequesting(false);
    }
  };

  // Se a requisição estiver em andamento, mostramos o carregamento
  if (loading) return <div>Loading...</div>;

  // Se houver um erro, mostramos a mensagem de erro
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.page_container}>
      <h2>My Received Transactions</h2>
      {receivedTransactions.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Book</th>
              <th>Status</th>
              <th>Type</th>
              <th>Sender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {receivedTransactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction.bookId?.title || 'Unknown'}</td>
                <td>{transaction.status}</td>
                <td>{transaction.bookId?.transactionType || 'Unknown'}</td>
                <td>{transaction.receiverId?.name || ''}</td>
                <td>
                  {transaction.status === 'In Progress' ? (
                    <>
                      <button
                        onClick={() => handleAcceptTransaction(transaction._id)}
                        className={styles.acceptButton}
                        disabled={isRequesting} // Desabilita o botão se a requisição estiver em andamento
                      >
                        <i className="fas fa-check-circle"></i>
                      </button>
                      <button
                        onClick={() => handleRejectTransaction(transaction._id)}
                        className={styles.rejectButton}
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No received transactions found.</p>
      )}
    </div>
  );
};

export default ReceivedTransactions;
