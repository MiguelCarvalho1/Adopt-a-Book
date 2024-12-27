const Review = require('../models/Review');
const getUserByToken = require('../helpers/get-user-by-token');
const getToken = require('../helpers/get-token');
const Book = require('../models/Book');

module.exports = class ReviewController {
    static async createReview(req, res) {
        try {
            const { bookId } = req.params;
            const { comment, rating } = req.body;
    
            if (!bookId || !comment || !rating) {
                return res.status(400).json({ message: 'Missing required fields.' });
            }
    
            const book = await Book.findById(bookId);
            if (!book) {
                return res.status(404).json({ message: 'Book not found.' });
            }
    
            const token = getToken(req);
            const user = await getUserByToken(token);
            if (!user) {
                return res.status(401).json({ message: 'User not found or invalid token.' });
            }
    
            const review = new Review({
                bookId: book._id,
                reviewedUserId: user._id,
                comment,
                rating,
            });
    
            await review.save();
            res.status(201).json({ message: 'Review created successfully.', review });
        } catch (error) {
            console.error('Error creating review:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
    
    
    

    // Função para obter as avaliações feitas pelo usuário
    static async getUserReviews(req, res) { 
        const token = getToken(req);
          
          // Verifica se o token é válido e se o usuário existe
          const user = await getUserByToken(token);
          if (!user) {
            return res.status(401).json({ message: 'User not found or invalid token.' });
          }
      
        try {
          // Obtém o token da requisição
         
          // Buscar as avaliações feitas pelo usuário
          const reviews = await Review.find({ reviewedUserId: user._id })
          .populate('bookId', 'title user') // Popula o título do livro e o dono do livro
          .populate('reviewedUserId', 'name') // Popula o nome do usuário que foi avaliado
          .select('comment rating bookId reviewedUserId createdAt'); // Seleciona os campos necessários
      
      // Se não houver avaliações, retorna uma resposta apropriada
      if (!reviews || reviews.length === 0) {
          return res.status(204).json({ message: 'No reviews found for this user.' }); // Usando código 204 para "sem conteúdo"
      }
      
          // Formatar as avaliações para a resposta
          const formattedReviews = reviews.map(review => ({
            bookTitle: review.bookId?.title || 'Unknown', // Se não houver título, retorna 'Unknown'
            reviewerName: review.reviewedUserId?.name || 'Anonymous', // Nome do revisor
            ownerName: review.bookId?.user?.name || '', // Nome do dono do livro
            comment: review.comment,
            rating: review.rating,
            createdAt: new Date(review.createdAt).toLocaleDateString() || 'Unknown', // Formatação da data
        }));
      
          // Envia a resposta com as avaliações formatadas
          res.status(200).json(formattedReviews);
        } catch (error) {
          console.error('Error fetching user reviews:', error);
          res.status(500).json({ message: 'Error fetching user reviews.', error });
        }
      }
      

    

      static async getReviewsByUserBooks(req, res) {
        try {
          const token = getToken(req); // Obtém o token da requisição
          const user = await getUserByToken(token); // Obtém o usuário associado ao token
          
          if (!user) {
            return res.status(401).json({ message: 'User not found or invalid token.' });
          }
      
          // Buscar livros do usuário
          const userBooks = await Book.find({ user: user._id });  // Presumindo que o modelo 'Book' tem um campo 'owner' que é o usuário que o adicionou
          
          if (!userBooks || userBooks.length === 0) {
            return res.status(404).json({ message: 'No books found for this user.' });
          }
      
          // Buscar as reviews associadas aos livros do usuário
          const reviews = await Review.find({ bookId: { $in: userBooks.map(book => book._id) } })
            .populate('reviewedUserId', 'name')  // Popula o nome do revisor
            .populate('bookId', 'title')  // Popula o título do livro
            .select('comment rating reviewedUserId bookId createdAt');
      
          // Formatar as respostas
          res.status(200).json(reviews.map(review => ({
            bookTitle: review.bookId?.title || 'Unknown',
            reviewerName: review.reviewedUserId?.name || 'Anonymous',
            comment: review.comment,
            rating: review.rating,
            createdAt: new Date(review.createdAt).toLocaleDateString() || 'Unknown', // Data formatada
          })));
        } catch (error) {
            console.error("Error fetching reviews for user books:", error); 
          res.status(500).json({ message: 'Error fetching reviews for user books.', error });
        }
      }
      
    
    
    
    

    static async updateReview(req, res) {
        const { id } = req.params;
        const { rating, comment } = req.body;

        try {
            const review = await Review.findById(id);
            if (!review) {
                return res.status(404).json({ message: 'Review not found.' });
            }

            review.rating = rating || review.rating;
            review.comment = comment || review.comment;
            await review.save();

            res.status(200).json({ message: 'Review updated successfully.', review });
        } catch (error) {
            res.status(500).json({ message: 'Error updating review.', error });
        }
    }

    static async deleteReview(req, res) {
        const { id } = req.params;

        try {
            const review = await Review.findByIdAndDelete(id);
            if (!review) {
                return res.status(404).json({ message: 'Review not found.' });
            }
            res.status(200).json({ message: 'Review deleted successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting review.', error });
        }
    }
};
const getStars = (rating) => {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
  
    // Adiciona estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      stars += '<span class="star"></span>';
    }
  
    // Adiciona estrelas meia
    if (halfStar) {
      stars += '<span class="half"></span>';
    }
  
    // Adiciona estrelas vazias
    for (let i = 0; i < emptyStars; i++) {
      stars += '<span class="empty"></span>';
    }
  
    return stars;
  };