import { useState } from "react";
import Input from "../../form/Input";
import styles from "../../form/Form.module.css";
import { Link } from "react-router-dom";

function Login() {
  const [user, setUser] = useState({});

  function handleChange(e) {
    setUser({ ...user, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Login data:", user);
  }

  return (
    <section className={styles.form_container}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <Input
          text="Email"
          type="email"
          name="email"
          placeholder="Type your email"
          handleOnChange={handleChange}
        />
        <Input
          text="Password"
          type="password"
          name="password"
          placeholder="Type your password"
          handleOnChange={handleChange}
        />
        <input type="submit" value="Login" />
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </section>
  );
}

export default Login;
