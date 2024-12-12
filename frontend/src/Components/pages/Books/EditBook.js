import styles from "./AddBook.module.css";
import api from "../../../utils/api";
import { useState, useEffect } from "react";
import useFlashMessage from "../../../hooks/useFlashMessage";
import { useParams, useNavigate } from 'react-router-dom';

import BookForm from "../../form/BookForm";

function EditBook() {
  const [book, setBook] = useState({});
  const [token] = useState(localStorage.getItem('token') || '');
  const { id } = useParams();
  const { setFlashMessage } = useFlashMessage();
  const navigate = useNavigate(); 

  useEffect(() => {
    api
      .get(`/books/${id}`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      })
      .then((response) => {
        setBook(response.data.book);
      })
      .catch((error) => {
        setFlashMessage('Error fetching book details. Please try again later.', 'error');
      });
  }, [token, id]);

  async function updateBook(book) {
    let msgType = 'success';
    const formData = new FormData();

    Object.keys(book).forEach((key) => {
      if (key === 'images') {
        for (let i = 0; i < book[key].length; i++) {
          formData.append('images', book[key][i]);
        }
      } else {
        formData.append(key, book[key]);
      }
    });

    try {
      const data = await api.patch(`/books/${book._id}`, formData, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setFlashMessage(data.message, msgType);
      navigate('/book/mybooks');
    } catch (err) {
      console.error(err);
      msgType = 'error';
      setFlashMessage(err.response.data.message || "Failed to update book", msgType);
    }
  }

  return (
    <section>
      <div className={styles.addbook_header}>
        <h1>Edit Book: {book.title}</h1>
      </div>
      {book.title && (
        <BookForm handleSubmit={updateBook} bookData={book} btnText="Edit" />
      )}
    </section>
  );
}

export default EditBook;
