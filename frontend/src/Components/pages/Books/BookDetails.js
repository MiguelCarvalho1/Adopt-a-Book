import api from '../../../utils/api';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    setLoading(false);
    api
      .get(`/books/${id}`)
      .then((response) => {
        setBook(response.data.book);
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

    const data = await api
      .patch(`/books/schedule/${book._id}`, {}, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        console.error(err);
        msgType = 'error';
        return err.response.data;
      });

    setFlashMessage(data.message, msgType);
    setIsRequesting(false);
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
        </section>
      ) : (
        <p>Book details not available.</p>
      )}
    </div>
  );
}

export default BookDetails;
