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
  const navigate = useNavigate(); // Navegação entre páginas
  const [reviews, setReviews] = useState([]); // Estado para os reviews
  const [newReview, setNewReview] = useState(''); 

  useEffect(() => {
    setLoading(false); // Inicia o carregamento
    api
      .get(`/books/${id}`)
      .then((response) => {
        setBook(response.data.book);
        setReviews(response.data.reviews || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching book details:', error);
        setLoading(false);
        setFlashMessage(
          'Error fetching book details. Please try again later.',
          'error'
        );
      });
  }, [id, setFlashMessage]);

  async function requestBook() {
    if (!token) {
      setFlashMessage('You need to log in to request a book.', 'error');
      navigate('/login');
      return;
    }

    setIsRequesting(true);
    let msgType = 'success';

    try {
      const requestData = {
        bookId: book._id,  // ID do livro
        // Não precisamos passar receiverId, o backend vai pegar do token
      };

      const response = await api.post(
        '/transactions/start',
        requestData,  // Dados da transação
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,  // Envio do token para autenticação
          },
        }
      );

      setFlashMessage(response.data.message, msgType);
      navigate('/transactions/sent');  // Redireciona para a página de transações enviadas
    } catch (err) {
      console.error('Request error:', err.response ? err.response.data : err.message);
      msgType = 'error';
      setFlashMessage(err?.response?.data?.message || 'Failed to request the book.', msgType);
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

    if (!newReview.trim()) {
      setFlashMessage('Review cannot be empty.', 'error');
      return;
    }

    try {
      const response = await api.post(
        `/books/${id}/reviews`,
        { review: newReview },
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );

      setReviews((prevReviews) => [...prevReviews, response.data.review]); // Atualiza a lista de reviews
      setNewReview('');
      setFlashMessage('Review added successfully!', 'success');
    } catch (err) {
      console.error('Error submitting review:', err);
      setFlashMessage(
        err?.response?.data?.message || 'Failed to submit review.',
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
          
          {/* Seção de Reviews */}
          <div className={styles.reviews_section}>
            <h2>Reviews</h2>
            {reviews.length > 0 ? (
              <ul className={styles.reviews_list}>
                {reviews.map((review, index) => (
                  <li key={index} className={styles.review_item}>
                    <p>{review.text}</p>
                    <small>By {review.user}</small>
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
