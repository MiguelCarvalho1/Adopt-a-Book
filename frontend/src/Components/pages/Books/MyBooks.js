import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Link } from 'react-router-dom';
import useFlashMessage from '../../../hooks/useFlashMessage';
import styles from './Dashboard.module.css';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

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
        {error && <p className="error_message">{error}</p>}

        {books.length > 0 ? (
          <table className={styles.books_table}>
            <thead>
              <tr>
                <th>Book Image</th>
                <th>Book Title</th>
                <th>Transaction</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id}>
                  <td>
                    <img
                      src={`${process.env.REACT_APP_API}/images/books/${book.images[0]}`}
                      alt={book.title}
                    />
                  </td>
                  <td>{book.title}</td>
                  <td>{book.transactionType}</td>
                  <td>
                    {book.transactionStatus
                      ? book.transactionStatus
                      : 'No transactions at the moment'}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {/* Exibe apenas o estado da transação, sem botões de ação */}
                      <Link
                        to={`/books/details/${book._id}`}
                        className={styles.details_btn}
                      >
                        <FaEye />
                      </Link>
                      <Link
                        to={`/books/edit/${book._id}`}
                        className={styles.edit_btn}
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => removeBook(book._id)}
                        className={styles.delete_btn}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No books registered yet!</p>
        )}
      </div>
    </section>
  );
}

export default MyBooks;
