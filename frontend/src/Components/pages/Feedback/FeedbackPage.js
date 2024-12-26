import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import styles from './feedback.module.css';

function FeedbackPage() {
  const [userReviews, setUserReviews] = useState([]); // Avaliações feitas pelo usuário
  const [bookReviews, setBookReviews] = useState([]); // Avaliações feitas sobre livros do usuário
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [token] = useState(localStorage.getItem('token') || '');  // Recupera o token do localStorage

  useEffect(() => {
    if (!token) {
      setError('User not logged in.');
      setLoading(false);
      return;
    }

    // Função para buscar avaliações feitas pelo usuário
    const fetchUserReviews = async () => {
      try {
        const response = await api.get(`/reviews/user/${token}`, {
          headers: { Authorization: `Bearer ${JSON.parse(token)}` }, // Usando JSON.parse como você mencionou
        });
        setUserReviews(response.data);
      } catch (err) {
        setError('Error loading user reviews. Please try again later.');
      }
    };

    // Função para buscar avaliações feitas sobre os livros do usuário
    const fetchBookReviews = async () => {
      try {
        const response = await api.get(`/reviews/${token}`, {
          headers: { Authorization: `Bearer ${JSON.parse(token)}` }, // Usando JSON.parse como você mencionou
        });
        setBookReviews(response.data);
      } catch (err) {
        setError('Error loading book reviews. Please try again later.');
      }
    };

    // Inicia as requisições
    const fetchData = async () => {
      await fetchUserReviews();
      await fetchBookReviews();
      setLoading(false); // Finaliza o estado de loading após as requisições
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.feedback_page}>
      <h1>Evaluations and Feedback</h1>

      {/* Avaliações feitas pelo usuário */}
      <section>
        <h2>Your Reviews</h2>
        {userReviews.length === 0 ? (
          <p>You haven't left any reviews yet.</p>
        ) : (
          <table className={styles.reviews_table}>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {userReviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.bookId?.title || 'Unknown'}</td>
                  <td>{review.rating}</td>
                  <td>{review.comment}</td>
                  <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Avaliações feitas sobre os livros do usuário */}
      <section>
        <h2>Reviews for Your Books</h2>
        {bookReviews.length === 0 ? (
          <p>No one has reviewed your books yet.</p>
        ) : (
          <table className={styles.reviews_table}>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookReviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.bookId?.title || 'Unknown'}</td>
                  <td>{review.reviewerUserId?.name || 'Anonymous'}</td>
                  <td>{review.rating}</td>
                  <td>{review.comment}</td>
                  <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default FeedbackPage;