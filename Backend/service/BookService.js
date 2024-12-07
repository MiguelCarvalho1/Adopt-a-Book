const axios = require('axios');

const API_KEY = 'AIzaSyDIUjeFDiZHKWOxsA-zu2q8hs8Yvw40rl4';


const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

class BookService {
  
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
      console.error('Erro ao buscar livros:', error.message);
      throw new Error('Erro ao conectar com a Google Books API');
    }
  }
}

module.exports = BookService;
