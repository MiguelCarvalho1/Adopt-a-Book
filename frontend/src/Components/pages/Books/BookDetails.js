import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './BookDetails.module.css';
import useFlashMessage from '../../../hooks/useFlashMessage';

function BookDetails() {
  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { setFlashMessage } = useFlashMessage();
  const [token] = useState(localStorage.getItem('token') || '');
  const [isRequesting, setIsRequesting] = useState(false);
  const navigate = useNavigate(); // Navegação entre páginas

  useEffect(() => {
    setLoading(false); // Inicia o carregamento
    api
      .get(`/books/${id}`)
      .then((response) => {
        setBook(response.data.book);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching book details:', error);
        setLoading(false);
        setFlashMessage(
          'Error fetching book details. Please try again later.',
          'error'
        );
      });
  }, [id, setFlashMessage]);

  async function requestBook() {
    if (!token) {
      setFlashMessage('You need to log in to request a book.', 'error');
      navigate('/login');
      return;
    }

    setIsRequesting(true);  // Desabilita o botão assim que o usuário clicar
    let msgType = 'success';

    try {
      const response = await api.post('/transactions/create', {
        bookId: book._id,   // ID do livro
        userId: JSON.parse(token).userId, // ID do usuário que está fazendo a solicitação
      }, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
      });

      // Atualiza o status da transação
      setFlashMessage(response.data.message, msgType);

      // Redireciona para a página de transações após a solicitação
      navigate('/transactions/sent'); // Redirecionamento para transações

    } catch (err) {
      console.error(err);
      msgType = 'error';
      setFlashMessage(err.response?.data?.message || 'Failed to request the book.', msgType);
    } finally {
      setIsRequesting(false);  // Reabilita o botão após a requisição
    }
  }

  if (loading) {
    return <p>Loading book details...</p>;
  }

  return (
    <div className={styles.book_details_page}>
      {book.title ? (
        <section className={styles.book_details_container}>
          <div className={styles.bookdetails_header}>
            <h1>{book.title}</h1>
            {book.subtitle && <p>{book.subtitle}</p>}
          </div>
          <div className={styles.book_info_section}>
            <div className={styles.book_images}>
              {book.images?.length > 0 ? (
                book.images.map((image, index) => (
                  <img
                    key={index}
                    src={`${process.env.REACT_APP_API}/images/books/${image}`}
                    alt={book.title}
                    loading="lazy"
                  />
                ))
              ) : (
                <p>No images available</p>
              )}
            </div>
            <div className={styles.book_meta}>
              <p>
                <span className="bold">Author:</span> {book.author || 'Unknown'}
              </p>
              <p>
                <span className="bold">Genre:</span> {book.genre || 'Uncategorized'}
              </p>
              <p>
                <span className="bold">Condition:</span> {book.condition || 'Not specified'}
              </p>
            </div>
          </div>
          <div className={styles.book_description}>
            <h2>Description</h2>
            <p>{book.description || 'No description available.'}</p>
          </div>
          {token ? (
            <button
              onClick={requestBook}
              disabled={isRequesting}
              className={styles.request_button}
            >
              {isRequesting ? 'Requesting...' : 'Request the Book'}
            </button>
          ) : (
            <p>
              You need <Link to="/register">create an account</Link> to request the book.
            </p>
          )}
        </section>
      ) : (
        <p>Book details not available.</p>
      )}
    </div>
  );
}

export default BookDetails;
