# Adopt a Book

## Description

**Adopt a Book** is a platform that connects readers interested in donating or exchanging books, promoting knowledge sharing and sustainability. With a simple and gamified system, it provides a platform where users can interact to swap and donate books. The platform utilizes the Google Books API to enrich the book data, such as covers, descriptions, and authors.

## Key Features

1. **Book Registration**  
   - **Description**: Users can add books for exchange or donation.
   - **Required Fields**:
     - Title (with an option for automatic search via the Google Books API).
     - Author.
     - Literary genre.
     - Language.
     - Book condition (new, used, etc.).
     - Image (either user-uploaded or cover provided by the Google Books API).
     - Transaction type: Exchange or Donation.
   - **Actions**: Edit or remove registered books.

2. **Advanced Filters**  
   - **Description**: Allows users to easily find books.
   - **Included Filters**:
     - Literary genre.
     - Language.
     - Availability (Exchange, Donation).
     - Keywords (by title or author).

3. **Points System**  
   - **Description**: In your code, you are searching for books of different genres (such as fiction, nonfiction, etc.).
   -  To reflect this, the q=subject:{genre} endpoint is used, which allows books to be retrieved by genre.
   - **How it Works**:
     -Genre Menu and Top 3 by Genre: Your code returns books in ‘cards’ and organises the books by genre.
     - The Google Books API doesn't have a direct endpoint for returning ‘top 3’ by genre, but you can apply this logic on the frontend by taking the first three books from the results for each genre.
   - **Rewards**:
     - Exchange points for special books or discounts with partners (optional).
     - Ranking of the most active users.

4. **Google Books API Integration**  
   - **Description**: Fetch additional information for book registration and display.
   - **Benefits**:
     - Automatically fetch covers and descriptions.
     - Avoid duplicate or incorrect information.
   - **Useful Endpoints**:
     - Volumes API: Search for books by title, author, or ISBN.
     - Book Details: For additional information like categories and publishers.

5. **User Profile**  
   - **Description**: Each user will have a profile where they can:
     - View registered books.
     - Track transactions.
     - Check accumulated points.

6. **Exchange/Donation System**  
   - **Description**: Manages the exchange or donation process.
   - **Flow**:
     - Interested user sends a request.
     - The book owner accepts or rejects.
     - After the transaction, both users can rate the experience.

## Recommended Technologies

### Frontend
- **React.js** or **Vue.js**: For a responsive and modern interface.
- **CSS Framework**: Tailwind CSS or Bootstrap.

### Backend
- **Node.js (Express)**: To handle application logic.
- **Database**: MongoDB (NoSQL).

### Integrations
- **Google Books API**: To fetch book information.
- **Firebase (optional)**: For user authentication and notifications.

### Other Tools
- **JWT (JSON Web Tokens)**: For authentication and security.
- **Docker**: For simplifying deployment.

## Next Steps

### Planning
- Create wireframes to visualize the project screens.
- Design the database (Books, Users, Transactions, Points).

### Prototyping
- Set up the Google Books API and test book searches.
- Develop the backend with basic endpoints (CRUD for books, users, etc.).

### Iterative Development
- Start with basic features (registration and filters).
- Add the points system and gamification.

### Testing
- Perform unit and integration tests.
- Validate the exchange/donation flow.

## Project Structure

```plaintext
/adopt-a-book
  ├── /backend
  │   ├── /controllers           # API request handlers
  │   ├── /models                # Mongoose models (Books, Users, etc.)
  │   ├── /routes                # API route definitions
  │   ├── /middleware            # Custom middleware for auth, validation, etc.
  │   ├── /utils                 # Utility functions
  │   └── index.js              # Main server setup (Express app)
  │
  ├── /frontend
  │   ├── /public                # Public files like index.html, favicon, etc.
  │   ├── /src
  │   │   ├── /components        # React components (BookCard, UserProfile, etc.)
  │   │   │   ├── /pages        # React pages (Home, BookDetails, etc.)
  │   │   ├── /context          # React Context API for global state (AuthContext, BookContext)
  │   │   ├── /hooks            # Custom React hooks
  │   │   ├── /services         # API call functions
  │   │   ├── App.js             # Main React app setup
  │   │   ├── index.js           # React entry point
  │   │   └── /utils             # Utility functions (validation, formatting, etc.)
  │
  ├── /config                    # Configuration files (MongoDB setup, Google Books API keys)
  ├── /tests                     # Unit and integration tests
  ├── .env                        # Environment variables (API keys, DB URI)
  ├── package.json                # Frontend dependencies and scripts
  ├── package-lock.json           # Locked frontend dependencies
  ├── Dockerfile                  # Docker configuration for backend and frontend
  └── README.md                   # Project documentation
