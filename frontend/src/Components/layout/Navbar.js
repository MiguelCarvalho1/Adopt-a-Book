import { Link } from 'react-router-dom';

import styles from './Navbar.module.css';

import Logo from '../../assets/img/logo.png';

/* contexts */
import { Context } from '../../context/UserContext';
import { useContext } from 'react';

/* hooks */

function Navbar() {
  const { authenticated, logout, loading } = useContext(Context);

  if (loading) return <div>Loading...</div>;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_logo}>
        <Link to="/">
          <img src={Logo} alt="Adopt a Book" className={styles.logo} />
        </Link>
      </div>
      <ul>
        <li>
          <Link to="/">Adopt</Link>
        </li>
        <li>
          <Link to="/books/home">Books List From Google</Link>
        </li>
        {authenticated ? (
          <>
            <li>
              <Link to="/books/mybooks">My Books</Link>
            </li>
            <li>
              <Link to="/transactions/mytransaction">List of Transactions</Link>
            </li>
            <li>
              <Link to="/transactions/received">Requests Received</Link>
            </li>
            <li>
              <Link to="/transactions/sent">Requests Sent</Link>
            </li>
            <li>
              <Link to="/reviews">Reviews</Link>
            </li>
            <li>
              <Link to="/user/profile">Profile</Link>
            </li>
            <li onClick={logout} className={styles.logout_button}>
              Logout
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
