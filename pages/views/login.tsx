import React, { useState } from "react";
import { useAuthContext } from "../../components/providers/AuthContext";
import { NextPage, NextPageContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Alert from "../../components/Alert";

type Props = {
  title: string;
};

type PageContext = NextPageContext & {
  query: Props;
};

const Login: NextPage<Props> = ({ title }): JSX.Element => {
  const { setAuthToken } = useAuthContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const router = useRouter();

  const handleSubmit = (e: React.SyntheticEvent): void => {
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
      .then((res) => res.json())
      .then((data) => {
        setAuthToken(data.access_token);
        router.replace("/admin/dashboard");
      });
  };

  return (
    <>
      <Head>
        <title>Vehservoir • {title}</title>
        <meta name="description" content="The admin login for vehsevoir." />
      </Head>

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
    </>
  );
};

Login.getInitialProps = (context: PageContext) => {
  return {
    title: context.query.title,
  };
};

export default Login;
