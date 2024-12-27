import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';
import styles from './feedback.module.css';

function FeedbackPage() {
  const [userReviews, setUserReviews] = useState([]); // Avaliações feitas pelo usuário
  const [bookReviews, setBookReviews] = useState([]); // Avaliações feitas sobre livros do usuário
  const [loading, setLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [bookError, setBookError] = useState(null);

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    if (!token) {
      setUserError('User not logged in.');
      setBookError('User not logged in.');
      setLoading(false);
      return;
    }

    // Função para buscar as avaliações feitas pelo usuário
    const fetchUserReviews = async () => {
      try {
        const response = await api.get('/reviews/user', {
          headers: { Authorization: `Bearer ${JSON.parse(token)}` },
        });
        setUserReviews(response.data || []);
      } catch (err) {
        setUserError('Error loading user reviews. Please try again later.');
      }
    };

    // Função para buscar as avaliações feitas sobre os livros do usuário
    const fetchBookReviews = async () => {
      try {
        const response = await api.get('/reviews/books', {
          headers: { Authorization: `Bearer ${JSON.parse(token)}` },
        });
        setBookReviews(response.data || []);
      } catch (err) {
        setBookError('Error loading book reviews. Please try again later.');
        console.error('Error fetching book reviews:', err);
      }
    };

    // Inicia as requisições simultâneas
    

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUserReviews(), fetchBookReviews()]);
      } catch (err) {
        // Se algo der errado, você pode tratar o erro aqui, se necessário
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (userError || bookError) return <p>{userError || bookError}</p>;

  return (
    <div className={styles.feedback_page}>


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
                <th>Name</th>
                <th>Date</th>
                
              </tr>
            </thead>
            <tbody>
              {userReviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.bookTitle || 'Unknown'}</td>
                  <td>{review.rating}</td>
                  <td>{review.comment}</td>
                  <td>{review.reviewerName}</td>
                  <td>{review.createdAt || 'Unknown Date'}</td>
                
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
               
              </tr>
            </thead>
            <tbody>
              {bookReviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.bookTitle || 'Unknown'}</td>
                  <td>{review.reviewerName || 'Anonymous'}</td>
                  <td>{review.rating}</td>
                  <td>{review.comment}</td>
                  
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
