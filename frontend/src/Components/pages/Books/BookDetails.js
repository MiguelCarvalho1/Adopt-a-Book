import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './BookDetails.module.css';
import useFlashMessage from '../../../hooks/useFlashMessage';

function BookDetails() {
  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { setFlashMessage } = useFlashMessage();
  const [token] = useState(localStorage.getItem('token') || '');
  const [isRequesting, setIsRequesting] = useState(false);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  useEffect(() => {
    async function fetchBookDetails() {
      setLoading(false);
      try {
        
       
        const response = await api.get(`/books/${id}`);
        setBook(response.data.book);
        setReviews(response.data.reviews || []);
      } catch (error) {
        console.error('Error fetching book details:', error);
        setFlashMessage(
          'Error fetching book details. Please try again later.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
    fetchBookDetails();
  }, [id, setFlashMessage]);

  async function requestBook() {
    if (!token) {
      setFlashMessage('You need to log in to request a book.', 'error');
      navigate('/login');
      return;
    }

    setIsRequesting(true);
    try {
      const response = await api.post(
        '/transactions/start',
        { bookId: book._id },
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );
      setFlashMessage(response.data.message, 'success');
      navigate('/transactions/sent');
    } catch (error) {
      console.error('Request error:', error.response ? error.response.data : error.message);
      setFlashMessage(
        error?.response?.data?.message || 'Failed to request the book.',
        'error'
      );
    } finally {
      setIsRequesting(false);
    }
  }

  async function submitReview() {
    if (!token) {
      setFlashMessage('You need to log in to leave a review.', 'error');
      navigate('/login');
      return;
    }

    if (!newReview.trim() || !selectedRating) {
      setFlashMessage('Review and rating cannot be empty.', 'error');
      return;
    }

    try {
      const response = await api.post(
        `/reviews/${id}`,
        { comment: newReview, rating: selectedRating },
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );

      setReviews((prevReviews) => [...prevReviews, response.data.review]);
      setNewReview('');
      setSelectedRating('');
      setFlashMessage('Review added successfully!', 'success');
    } catch (error) {
      console.error('Error submitting review:', error);
      setFlashMessage(
        error?.response?.data?.message || 'Failed to submit review.',
        'error'
      );
    }
  }

  if (loading) {
    return <p>Loading book details...</p>;
  }

  return (
    <div className={styles.book_details_page}>
      {book.title ? (
        <section className={styles.book_details_container}>
          <div className={styles.bookdetails_header}>
            <h1>{book.title}</h1>
            {book.subtitle && <p>{book.subtitle}</p>}
          </div>
          <div className={styles.book_info_section}>
            <div className={styles.book_images}>
              {book.images?.length > 0 ? (
                book.images.map((image, index) => (
                  <img
                    key={index}
                    src={`${process.env.REACT_APP_API}/images/books/${image}`}
                    alt={book.title}
                    loading="lazy"
                  />
                ))
              ) : (
                <p>No images available</p>
              )}
            </div>
            <div className={styles.book_meta}>
              <p>
                <span className="bold">Author:</span> {book.author || 'Unknown'}
              </p>
              <p>
                <span className="bold">Genre:</span> {book.genre || 'Uncategorized'}
              </p>
              <p>
                <span className="bold">Condition:</span> {book.condition || 'Not specified'}
              </p>
            </div>
          </div>
          <div className={styles.book_description}>
            <h2>Description</h2>
            <p>{book.description || 'No description available.'}</p>
          </div>
          {token ? (
            <button
              onClick={requestBook}
              disabled={isRequesting}
              className={styles.request_button}
            >
              {isRequesting ? 'Requesting...' : 'Request the Book'}
            </button>
          ) : (
            <p>
              You need <Link to="/register">create an account</Link> to request the book.
            </p>
          )}

          {/* Reviews Section */}
          <div className={styles.reviews_section}>
            <h2>Reviews</h2>
            {reviews.length > 0 ? (
              <ul className={styles.reviews_list}>
                {reviews.map((review, index) => (
                  <li key={index} className={styles.review_item}>
                    <p><strong>Rating:</strong> {review.rating}/5</p>
                    <p>{review.comment}</p>
                    <small>By {review.reviewer?.name || 'Anonymous'}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviews yet. Be the first to leave one!</p>
            )}
            {token ? (
              <div className={styles.add_review}>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Leave your review here..."
                />
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                >
                  <option value="">Select Rating</option>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
                <button onClick={submitReview}>Submit Review</button>
              </div>
            ) : (
              <p>
                <Link to="/login">Log in</Link> to leave a review.
              </p>
            )}
          </div>
        </section>
      ) : (
        <p>Book details not available.</p>
      )}
    </div>
  );
}

export default BookDetails;
