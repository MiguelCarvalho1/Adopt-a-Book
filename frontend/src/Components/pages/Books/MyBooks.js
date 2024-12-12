import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Link } from "react-router-dom";
import RoundedImage from '../../layout/RoundImage';
import useFlashMessage from "../../../hooks/useFlashMessage";
import styles from './DashBoard.module.css';

function MyBooks() {
  const [books, setBooks] = useState([]);
  const { setFlashMessage } = useFlashMessage();
  const [token] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 


  useEffect(() => {
    if (!token) {
      setError("Token missing or invalid");
      setLoading(false);
      return;
    }

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
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const response = await api.delete(`/books/${id}`, {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        });

        // Atualiza a lista de livros após remoção
        setBooks(prevBooks => prevBooks.filter((book) => book._id !== id));
        setFlashMessage(response.data.message, 'success');
      } catch (err) {
        console.error('Error removing book:', err);
        setFlashMessage('Failed to remove book. Please try again.', 'error');
      }
    }
  }

  // Função para concluir a transação do livro
  async function concludeTransaction(id) {
    try {
      const response = await api.patch(`/books/conclude/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      });
      setFlashMessage(response.data.message, 'success');
    } catch (err) {
      console.error('Error concluding transaction:', err);
      setFlashMessage('Failed to conclude transaction. Please try again.', 'error');
    }
  }

  if (loading) {
    return <p>Loading your books...</p>;
  }

  return (
    <section>
      <h1>My Books</h1>
      <Link to="/books/create" className={styles.modern_button}>Register Book</Link>

      <div className={styles.bookslist_container}>
        {error && <p className={styles.error_message}>{error}</p>}

        {books.length > 0 ? (
          books.map((book) => (
            <div
              key={book._id}
              className={`${styles.booklist_row} ${!book.available ? styles.adopted : ''}`}
            >
              <RoundedImage
                src={`${process.env.REACT_APP_API}/images/books/${book.images[0]}`}
                alt={book.title}
                width="px75"
              />
              <span className="bold">{book.title}</span>

              {/* Display adopted or transaction status */}
              {!book.available && (
                <span className={styles.adopted_label}>Adopted</span>
              )}

              <div className={styles.actions}>
                {book.available ? (
                  <>
                    {book.adopter && (
                      <button
                        className={styles.conclude_btn}
                        onClick={() => concludeTransaction(book._id)}
                      >
                        Conclude Transaction
                      </button>
                    )}
                    <Link to={`/book/edit/${book._id}`}>Edit</Link>
                    <button
                      onClick={() => removeBook(book._id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <p>Book already adopted</p>
                )}
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
