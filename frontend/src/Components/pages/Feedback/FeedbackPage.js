import React, { useEffect, useState } from 'react';
import api from '../../../utils/api'
import ReviewCard from './ReviewCard';
import styles from './feedback.module.css'

function FeedbackPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const userId = localStorage.getItem('userId'); 
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/reviews/${userId}`);
        setReviews(response.data);
      } catch (err) {
        setError('Error loading reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]); 

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.feedback_page }>
      <h1>Evaluations and Feedback</h1>
      {reviews.length === 0 ? (
        <p>This user hasn't received any reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <ReviewCard
            key={review._id}
            reviewer={review.reviewerId.name} 
            rating={review.rating}
            comment={review.comment}
            date={new Date(review.createdAt).toLocaleDateString()}
          />
        ))
      )}
    </div>
  );
}

export default FeedbackPage;
