import React, { useState } from "react";
import Alert from "../../components/Alert";

const register: React.FC = (): JSX.Element => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.SyntheticEvent): void => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = formData;

    fetch("/admin/register", {
      method: "post",
      headers: new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
      body: JSON.stringify({
        rest,
      }),
    })
      .then((res) => {
        if (res.ok) {
          location.replace("/admin/dashboard");
        } else {
          setErrorMessage(
            "There was a problem completing your request, please try again."
          );
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="container" style={{ marginTop: 100 }}>
      {errorMessage.length === 0 && <Alert error={errorMessage} />}
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Vehservoir Admin Login</legend>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              name="username"
              type="text"
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password:</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>
          <button
            id="submit"
            className="btn btn-default"
            type="submit"
            role="button"
            name="submit"
          >
            Register Admin
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default register;
