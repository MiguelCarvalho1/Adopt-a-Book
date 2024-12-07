import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchHomeBooks = async () => {
    try {
      const response = await axios.get('/books/home'); 
      setBooks(response.data);
    } catch (error) {
      console.error('Erro ao carregar os livros da home', error);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchHomeBooks();
  }, []);

  if (loading) {
    return <div>Carregando livros...</div>;
  }

  return (
    <div>
      <h1>Livros em Destaque</h1>
      <div className="books-container">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="book-card">
              <h3>{book.title}</h3>
              <p>{book.authors?.join(', ')}</p>
              {book.thumbnail && <img src={book.thumbnail} alt={book.title} />}
            </div>
          ))
        ) : (
          <p>Nenhum livro encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
