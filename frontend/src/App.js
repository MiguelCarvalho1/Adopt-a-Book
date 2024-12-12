import {
  BrowserRouter as Router,
  Routes,
  Route,
  //Navigate,
} from 'react-router-dom';

import Home from './Components/pages/Home';
import Login from './Components/pages/Auth/Login';
import Register from './Components/pages/Auth/Register';
import BooksHome from './Components/pages/Books/Home'

import Footer from './Components/layout/Footer';
import Navbar from './Components/layout/Navbar';
import Container from './Components/layout/Container'

/*context*/ 
import { UserProvider } from './context/UserContext';


function App() {
  return (
    <Router>
         <UserProvider>
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
      </UserProvider>
    </Router>
  );
}

export default App;
