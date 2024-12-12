import api from '../../../utils/api';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './BookDetails.module.css';
import useFlashMessage from '../../../hooks/useFlashMessage';

function BookDetails() {
  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { setFlashMessage } = useFlashMessage();
  const [token] = useState(localStorage.getItem('token') || '');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/books/${id}`)
      .then((response) => {
        setBook(response.data.book);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching book details:', error);
        setLoading(false);
        setFlashMessage('Error fetching book details. Please try again later.', 'error');
      });
  }, [id]);

  async function requestBook() {
    setIsRequesting(true);
    let msgType = 'success';

    const data = await api
      .patch(`/books/schedule/${book._id}`, {
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
    <>
      {book.title && (
        <section className={styles.book_details_container}>
          <div className={styles.bookdetails_header}>
            <h1>Getting to know the Book: {book.title}</h1>
            <p>If you're interested, request it now!</p>
          </div>
          <div className={styles.book_images}>
            {book.images.map((image, index) => (
              <img
                key={index}
                src={`${process.env.REACT_APP_API}/images/books/${image}`}
                alt={book.title}
                loading="lazy"
              />
            ))}
          </div>
          <p>
            <span className="bold">Author:</span> {book.author}
          </p>
          <p>
            <span className="bold">Genre:</span> {book.genre}
          </p>
          <p>
            <span className="bold">Condition:</span> {book.condition}
          </p>
          <p>
            <span className="bold">Description:</span> {book.description}
          </p>
          {token ? (
            <button onClick={requestBook} disabled={isRequesting}>
              {isRequesting ? 'Requesting...' : 'Request the Book'}
            </button>
          ) : (
            <p>
              You need <Link to="/register">create an account</Link> to request the book.
            </p>
          )}
        </section>
      )}
    </>
  );
}

export default BookDetails;
