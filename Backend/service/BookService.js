const axios = require('axios');

const API_KEY = 'AIzaSyBpHmqIT6nP6hKQs1NdGCp0HJPkg4K97iE';
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

class BookService {

  // Função para buscar livros por consulta de pesquisa
  static async searchBooks(query) {
    try {
      const response = await axios.get(`${BASE_URL}?q=${query}&key=${API_KEY}`);
      if (response.data.items) {
        return response.data.items.map((item) => ({
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors,
          description: item.volumeInfo.description,
          thumbnail: item.volumeInfo.imageLinks?.thumbnail,
          publishedDate: item.volumeInfo.publishedDate,
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error when searching for books in the genre', error.message);
      throw new Error('Error connecting to Google Books API');
    }
  }

  // Função para buscar livros por gênero
  static async getBooksByGenre(genre, limit = 10) {
    try {
      const response = await axios.get(`${BASE_URL}?q=subject:${genre}&maxResults=${limit}&key=${API_KEY}`);
      if (response.data.items) {
        return response.data.items.map((item) => ({
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors,
          description: item.volumeInfo.description,
          thumbnail: item.volumeInfo.imageLinks?.thumbnail,
          publishedDate: item.volumeInfo.publishedDate,
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Error when searching for books in the genre ${genre}:`, error.message);
      throw new Error(`Error when searching for books in the genre ${genre}`);
    }
  }

  // Função para buscar o top livros de um gênero
  static async getTopBooksByGenre(genre, limit = 5) {
    try {
      const books = await BookService.getBooksByGenre(genre, limit);
      return books.slice(0, limit); // Limitar aos primeiros 'limit' livros
    } catch (error) {
      console.error(`Error when searching for books in the genre ${genre}:`, error.message);
      throw new Error(`Error when searching for books in the genre ${genre}`);
    }
  }
}

module.exports = BookService;
