import {
  BrowserRouter as Router,
  Routes,
  Route,
  //Navigate,
} from 'react-router-dom';

import Home from './Components/pages/Auth/Home';
import Login from './Components/pages/Auth/Login';
import Register from './Components/pages/Auth/Register';
import BooksHome from './Components/pages/Books/Home'

import Footer from './Components/layout/Footer';
import Navbar from './Components/layout/Navbar';
import Container from './Components/layout/Container'

function App() {
  return (
    <Router>
      <Navbar />
      <Container>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/books/home" element={<BooksHome />} />
      </Routes>
      </Container>
      <Footer />
    </Router>
  );
}

export default App;
