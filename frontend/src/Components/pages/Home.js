import { useState, useEffect } from "react";
import api from "../../utils/api";
import styles from "../layout/Home.module.css";
import { Link } from "react-router-dom";

import Book from '../../assets/img/book.png';

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

  // Organize the books by genre and sort genres alphabetically
  const booksByGenre = books.reduce((acc, book) => {
    const genre = book.genre || "Uncategorized";
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(book);
    return acc;
  }, {});

  const sortedGenres = Object.keys(booksByGenre).sort(); // Sorting genres alphabetically

  return (
    <section className={styles.home}>
{/* Hero Section */}
<section className={styles.hero}>
  <div className={styles.hero_content}>
    <h1>Explore Our Exclusive Book Collection</h1>
    <p>
      Dive into a world of unique and captivating stories, carefully selected 
      just for you. Whether you want to buy, sell, donate, or exchange books, 
      this is the perfect place to find your next treasure. Discover your next 
      favorite book and turn every page into a new adventure!
    </p>
  </div>
  <div className={styles.hero_image}>
    <img src={Book} alt="Books Collection" />
  </div>
</section>

      {/* Categorias de Livros */}
      <section className={styles.categories}>
        <h2>Books by Genre</h2>
        {sortedGenres.map((genre) => (
          <div key={genre} className={styles.category}>
            <div className={styles.categoryname}>
            <h3>{genre}</h3>
            </div>
            <div className={styles.books}>
              {booksByGenre[genre].map((book) => (
                <div key={book._id} className={styles.book_card}>
                  <img
                    src={`${process.env.REACT_APP_API}/images/books/${book.images[0]}`}
                    alt={book.title}
                    className={styles.book_image}
                  />
                  <h4>{book.title}</h4>
                  <p>
                    {book.description
                      ? book.description.length > 100
                        ? book.description.substring(0, 100) + "..."
                        : book.description
                      : "No description available"}
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
