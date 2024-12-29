import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import styles from "./feedback.module.css";


function FeedbackPage() {
  const [userReviews, setUserReviews] = useState([]);
  const [bookReviews, setBookReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [bookError, setBookError] = useState(null);
  const token = localStorage.getItem("token") || "";

  const getStars = (rating) => {
    let stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span className={styles.star} key={`full-${rating}-${i}`}>
          &#9733;
        </span>
      );
    }

    if (halfStar) {
      stars.push(
        <span className={styles.half} key={`half-${rating}`}>
          &#9733;
        </span>
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span className={styles.empty} key={`empty-${rating}-${i}`}>
          &#9734;
        </span>
      );
    }

    return stars;
  };


  
  
  useEffect(() => {
    if (!token) {
      setUserError("User not logged in.");
      setBookError("User not logged in.");
      setLoading(false);
      return;
    }

    const fetchUserReviews = async () => {
      try {
        const response = await api.get("/reviews/user", {
          headers: { Authorization: `Bearer ${JSON.parse(token)}` },
        });
        setUserReviews(response.data || []);
      } catch (err) {
        setUserError("Error loading user reviews. Please try again later.");
      }
    };

    const fetchBookReviews = async () => {
      try {
        const response = await api.get("/reviews/books", {
          headers: { Authorization: `Bearer ${JSON.parse(token)}` },
        });
        setBookReviews(response.data || []);
      } catch (err) {
        setBookError("Error loading book reviews. Please try again later.");
      }
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUserReviews(), fetchBookReviews()]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (userError || bookError) return <p>{userError || bookError}</p>;

  return (
    <div className={styles.feedback_page}>
      <section>
        <h2>Your Reviews</h2>
        {userReviews.length === 0 ? (
          <p>You haven't left any reviews yet.</p>
        ) : (
          <table className={styles.reviews_table}>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {userReviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.bookTitle || "Unknown"}</td>
                  <td>{getStars(review.rating)}</td>
                  <td>{review.comment}</td>
                  <td>{review.createdAt || "Unknown Date"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Reviews for Your Books</h2>
        {bookReviews.length === 0 ? (
          <p>No one has reviewed your books yet.</p>
        ) : (
          <table className={styles.reviews_table}>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Reviewer</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookReviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.bookTitle || "Unknown"}</td>
                  <td>{getStars(review.rating)}</td>
                  <td>{review.comment}</td>
                  <td>{review.reviewerName || "Anonymous"}</td>
                  <td>{review.createdAt || "Unknown Date"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default FeedbackPage;
