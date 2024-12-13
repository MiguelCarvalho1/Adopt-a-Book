import { useState, useEffect } from 'react';
import api from '../../utils/api';
import styles from '../layout/Home.module.css';

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get('/books') // Presume-se que esta rota retorna todos os livros
      .then((response) => {
        setBooks(response.data.books); // Supondo que `books` seja o campo retornado
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading books...</p>;
  }

  if (error) {
    return <p className={styles.error_message}>{error}</p>;
  }

  // Agrupa os livros por gênero usando o campo `genre`
  const booksByGenre = books.reduce((acc, book) => {
    const genre = book.genre || 'Uncategorized'; // Garantir fallback para livros sem gênero
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(book);
    return acc;
  }, {});

  return (
    <section className={styles.home}>
      <section className={styles.hero}>
        <h1>Welcome to Adopt a Book</h1>
        <p>Your place to find books that deserve a second chance.</p>
      </section>

      <section className={styles.categories}>
        {Object.keys(booksByGenre).map((genre) => (
          <div key={genre} className={styles.category}>
            <h3>{genre}</h3>
            <div className={styles.books}>
              {booksByGenre[genre].map((book) => (
                <div key={book._id} className={styles.book}>
                  <img
                     src={`${process.env.REACT_APP_API}/images/books/${book.images[0]}`}
                    alt={book.title}
                  />
                  <h4>{book.title}</h4>
                  <p>{book.description || 'No description available'}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}

export default Home;
