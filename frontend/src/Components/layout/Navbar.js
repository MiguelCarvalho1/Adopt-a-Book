import { Link } from 'react-router-dom'
//import React, { useContext } from 'react'

import styles from './Navbar.module.css'

import Logo from '../../assets/img/logo.png'

/* contexts */
//import { Context } from '../../context/UserContext'

/* hooks */

function Navbar() {
 // const { authenticated, logout } = useContext(Context)

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
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/books/home">Books List</Link>
            </li>
    
  
      </ul>
    </nav>
  )
}

export default Navbar