import React, { useState } from "react";
import { NextPage } from "next";
import Alert from "../../components/Alert";

const login: NextPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    fetch("/admin/login", {
      method: "post",
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((res) => {
        if (res.ok) {
          location.replace("/admin/dashboard");
        } else {
          setError(true);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="container" style={{ marginTop: 100 }}>
      {error && <Alert error="Username or Password Incorrect" />}
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Vehservoir Admin Login</legend>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              name="username"
              type="text"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            id="submit"
            className="btn btn-default"
            type="submit"
            role="button"
            name="submit"
          >
            Login
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default login;
