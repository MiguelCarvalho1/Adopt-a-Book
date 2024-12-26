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
        try {
            const token = getToken(req);
            const user = await getUserByToken(token);
            
            if (!user) {
                return res.status(401).json({ message: 'User not found or invalid token.' });
            }
    
            // Buscar as avaliações feitas pelo usuário
            const reviews = await Review.find({ reviewerUserId: user._id })
                .populate('bookId', 'title')  // Popula o título do livro
                .populate('reviewerUserId', 'name')  // Popula o nome do revisor
                .select('comment rating bookId reviewerUserId');
            
            res.status(200).json(
                reviews.map(review => ({
                    bookTitle: review.bookId?.title || 'Unknown',
                    reviewerName: review.reviewerUserId?.name || 'Anonymous',
                    comment: review.comment,
                    rating: review.rating,
                }))
            );
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user reviews.', error });
        }
    }
    

    

    static async getReviewsByBook(req, res) {
        try {
            const { bookId } = req.params;  // bookId da URL
            const token = getToken(req);
            const user = await getUserByToken(token);
            
            if (!user) {
                return res.status(401).json({ message: 'User not found or invalid token.' });
            }
    
            // Buscar reviews associadas ao livro
            const reviews = await Review.find({ bookId: bookId })
                .populate('reviewerUserId', 'name')  // Popula o nome do revisor
                .populate('bookId', 'title')  // Popula o título do livro
                .select('comment rating reviewerUserId bookId');
        
            res.status(200).json(reviews.map(review => ({
                bookTitle: review.bookId?.title || 'Unknown',
                reviewerName: review.reviewerUserId?.name || 'Anonymous',
                comment: review.comment,
                rating: review.rating
            })));
        } catch (error) {
            res.status(500).json({ message: 'Error fetching reviews by book.', error });
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
