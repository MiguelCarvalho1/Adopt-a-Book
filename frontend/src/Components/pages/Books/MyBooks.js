import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Link } from "react-router-dom";
import RoundedImage from '../../layout/RoundImage';
import useFlashMessage from "../../../hooks/useFlashMessage";
import styles from './Dashboard.module.css';

function MyBooks() {
  const [books, setBooks] = useState([]);
  const { setFlashMessage } = useFlashMessage();
  const [token] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get('/books/mybooks', {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      })
      .then((response) => {
        setBooks(response.data.books);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        setError('Failed to load your books. Please try again later.');
        setLoading(false);
      });
  }, [token]);

  async function removeBook(id) {
    if (window.confirm('Are you sure you want to delete this book?')) {
      let msgType = 'success';

      const data = await api
        .delete(`/books/${id}`, {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        })
        .then((response) => {
          const updatedBooks = books.filter((book) => book._id !== id);
          setBooks(updatedBooks);
          return response.data;
        })
        .catch((err) => {
          console.error(err);
          msgType = 'error';
          return err.response.data;
        });

      setFlashMessage(data.message, msgType);
    }
  }

  async function concludeTransaction(id) {
    let msgType = 'success';

    const data = await api
      .patch(`/books/conclude/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      })
      .then((response) => response.data)
      .catch((err) => {
        console.error(err);
        msgType = 'error';
        return err.response.data;
      });

    setFlashMessage(data.message, msgType);
  }

  if (loading) {
    return <p>Loading your books...</p>;
  }

  return (
    <section>
      <h1>My Books</h1>
      <Link to="/books/create" className={styles.modern_button}>
        Register Book
      </Link>

      <div className={styles.bookslist_container}>
        {error && <p className={styles.error_message}>{error}</p>}

        {books.length > 0 ? (
          books.map((book) => (
            <div key={book._id} className={styles.book_card}>
              <img
                src={`${process.env.REACT_APP_API}/images/books/${book.images[0]}`}
                alt={book.title}
              />
              <h3>{book.title}</h3>

              {!book.available && (
                <span className={styles.adopted_label}>Transaction Complete</span>
              )}

              <div className={styles.actions}>
                {book.available ? (
                  <>
                    {book.adopter && (
                      <button
                        className={styles.conclude_btn}
                        onClick={() => {
                          concludeTransaction(book._id);
                        }}
                      >
                        Conclude
                      </button>
                    )}
                    <Link to={`/books/edit/${book._id}`}>Edit</Link>
                    <Link to={`/books/details/${book._id}`} className={styles.details_btn}>
                      Details
                    </Link>
                    <button
                      onClick={() => {
                        removeBook(book._id);
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <p>Book already processed</p>
                )}
                 <Link to={`/books/details/${book._id}`} className={styles.details_btn}></Link>
              </div>
              
            </div>
          ))
        ) : (
          <p>No books registered yet!</p>
        )}
      </div>
    </section>
  );
}

export default MyBooks;
