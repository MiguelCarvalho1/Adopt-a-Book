import React from 'react';

function ReviewCard({ reviewer, rating, comment, date }) {
  return (
    <div className="review-card">
      <h3>{reviewer}</h3>
      <p>Rating: {'⭐'.repeat(rating)}</p>
      <p>{comment}</p>
      <small>{date}</small>
    </div>
  );
}

export default ReviewCard;
