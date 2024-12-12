
import { useState, useContext } from 'react';
import Input from '../../form/Input';
import { Link } from 'react-router-dom';
import styles from '../../form/Form.module.css';

/* contexts */
import { Context } from '../../../context/UserContext';

function Register() {
  const [user, setUser] = useState({});
  const { register } = useContext(Context);

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log(user);
    register(user);
  }

  return (
    <section className={styles.form_container}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <Input
          text="Name"
          type="text"
          name="name"
          placeholder="Type your name"
          handleOnChange={handleChange}
          autocomplete="name"
        />
        <Input
          text="Email"
          type="email"
          name="email"
          placeholder="Type your email"
          handleOnChange={handleChange}
          autocomplete="email"
        />
        <Input
          text="Password"
          type="password"
          name="password"
          placeholder="Type your password"
          handleOnChange={handleChange}
          autocomplete="new-password"
        />
        <Input
          text="Confirm Password"
          type="password"
          name="confirmpassword"
          placeholder="Confirm password"
          handleOnChange={handleChange}
          autocomplete="new-password"
        />
        <Input
          text="Location"
          type="text"
          name="location"
          placeholder="Type your location"
          handleOnChange={handleChange}
        />
        <input
          type="submit"
          value="Register"
          disabled={!user.name || !user.email || !user.password || !user.confirmpassword || !user.location}
        />
      </form>
      <p>
        Already have an account? <Link to="/login">Click here</Link>
      </p>
    </section>
  );
}

export default Register;
