import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import styles from './Home.module.css';  // Importa o CSS Module

const Home = () => {
  const [booksByGenre, setBooksByGenre] = useState({});
  const [loading, setLoading] = useState(true);

  // Lista de gêneros para buscar
  const genres = [
    'fiction', 'nonfiction', 'mystery', 'romance', 'fantasy', 'biography', 
    'history', 'science', 'police', 'thrillers',  'children', 
    'self-help', 'cookbooks', 'art', 'travel', 'poetry', 'comics', 'horror', 
    'health', 'philosophy', 'politics', 'economics', 'spirituality', 'religion', 
    'business',  'classic', 'literature', 'humor', 'adventure', 
    'graphic novels', 'drama',  'dystopian', 'paranormal', 
    'memoir', 'law', 'mathematics', 'psychology', 'psychic', 'medical', 'technology'
  ];
  

  const fetchTopBooksByGenres = async () => {
    setLoading(true);
    try {
      const booksData = {};
      for (const genre of genres) {
        const response = await api.get(`/books/genre/${genre}`);
        booksData[genre] = response.data.slice(0, 6);  // Limita para os 3 primeiros livros
      }
      setBooksByGenre(booksData);
    } catch (error) {
      console.error('Error loading books by genre', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopBooksByGenres();
  }, []);

  if (loading) {
    return <div className={styles.loader}>Loading books...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Google's top books by Genre</h1>
      {Object.keys(booksByGenre).map((genre) => (
        <div key={genre}>
          <h2 className={styles.genreHeader}>{genre.charAt(0).toUpperCase() + genre.slice(1)}</h2>
          <div className={styles.booksContainer}>
            {booksByGenre[genre].length > 0 ? (
              booksByGenre[genre].map((book) => (
                <div key={book.id} className={styles.bookCard}>
                  <img src={book.thumbnail} alt={book.title} className={styles.bookThumbnail} />
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  <p className={styles.bookAuthors}>{book.authors?.join(', ')}</p>
                  <p className={styles.bookDescription}>{book.description?.substring(0, 100)}...</p>
                </div>
              ))
            ) : (
              <p>No books found in this genre.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
