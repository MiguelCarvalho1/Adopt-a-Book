import {
  BrowserRouter as Router,
  Routes,
  Route,
  //Navigate,
} from 'react-router-dom';

import Home from './Components/pages/Home';
import Login from './Components/pages/Auth/Login';
import Register from './Components/pages/Auth/Register';
import Profile from './Components/pages/User/Profile';
import BooksHome from './Components/pages/Books/Home'
import BooksDetails from './Components/pages/Books/BookDetails'
import BooksCreate from './Components/pages/Books/Add'
import BooksEdit from './Components/pages/Books/EditBook'
import MyBooks from './Components/pages/Books/MyBooks';

import Footer from './Components/layout/Footer';
import Navbar from './Components/layout/Navbar';
import Container from './Components/layout/Container';
import Message from './Components/layout/Message';

/*context*/ 
import { UserProvider } from './context/UserContext';


function App() {
  return (
    <Router>
      <UserProvider>
      <Navbar />
      <Message/>
      <Container>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/books/home" element={<BooksHome />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/books/details/:id" element={<BooksDetails />} />
        <Route path="/books/create" element={<BooksCreate />} />
        <Route path="/books/edit/:id" element={<BooksEdit />} />
        <Route path="/books/mybooks" element={<MyBooks />} />
      </Routes>
      </Container>
      <Footer />
      </UserProvider>
    </Router>
  );
}

export default App;
