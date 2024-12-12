import styles from '../layout/Home.module.css';

function Home() {
  return (
    <section className={styles.home}>
      <section className={styles.hero}>
        <h1>Welcome to Adopt a Book</h1>
        <p>Your place to find books that deserve a second chance.</p>
        <button>Explore Now</button>
      </section>

      <section className={styles.categories}>
        <div className={styles.category}>
          <img src="fiction.jpg" alt="Fiction" />
          <h3>Fiction</h3>
          <p>Discover the best fiction books to spark your imagination.</p>
        </div>
        <div className={styles.category}>
          <img src="non-fiction.jpg" alt="Non-fiction" />
          <h3>Non-fiction</h3>
          <p>Learn from a wide range of non-fiction genres.</p>
        </div>
        <div className={styles.category}>
          <img src="kids.jpg" alt="Kids" />
          <h3>Kids</h3>
          <p>Fun and educational books for children of all ages.</p>
        </div>
      </section>
    </section>
  );
}

export default Home;
