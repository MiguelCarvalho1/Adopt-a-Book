import { useState, useEffect } from "react";
import api from "../../utils/api";
import styles from "../layout/Home.module.css";
import { Link } from "react-router-dom";

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get("/books")
      .then((response) => {
        setBooks(response.data.books);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading books...</p>;
  }

  if (error) {
    return <p className={styles.error_message}>{error}</p>;
  }

  // Organize os livros por gênero
  const booksByGenre = books.reduce((acc, book) => {
    const genre = book.genre || "Uncategorized";
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(book);
    return acc;
  }, {});

  return (
    <section className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.hero_content}>
          <h1>Discover Your Next Favorite Book</h1>
          <p>
            Browse through our collection of amazing books. From timeless
            classics to hidden gems, find a book you'll love!
          </p>
        </div>
      </section>

      {/* Categorias de Livros */}
      <section className={styles.categories}>
        <h2>Books by Genre</h2>
        {Object.keys(booksByGenre).map((genre) => (
          <div key={genre} className={styles.category}>
            <h3>{genre}</h3>
            <div className={styles.books}>
              {booksByGenre[genre].map((book) => (
                <div key={book._id} className={styles.book_card}>
                  <img
                    src={`${process.env.REACT_APP_API}/images/books/${book.images[0]}`}
                    alt={book.title}
                  />
                  <h4>{book.title}</h4>
                  <p>
                    {book.description
                      ? book.description.substring(0, 100)
                      : "No description available"}
                    {book.description && book.description.length > 100 && "..."}
                  </p>
                  <Link
                    to={`/books/details/${book._id}`}
                    className={styles.details_btn}
                  >
                    View Details
                  </Link>
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
