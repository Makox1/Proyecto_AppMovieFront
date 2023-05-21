import { useState } from 'react';
import styles from '../styles/Login.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, useQuery, gql } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // Reemplaza con la URL correcta de tu servidor GraphQL
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const USER_QUERY = gql`
  query User($email: String!, $password: String!) {
    user(email: $email, password: $password) {
      id
      email
      name
      password
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLog, setIsLogin] = useState(false);
  const router = useRouter();
  const { loading, error, data } = useQuery(USER_QUERY, {
    variables: { email, password },
    client, // Pasamos la instancia de ApolloClient a useQuery
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (data && data.user) {
        console.log('Usuario autenticado:', data.user);
        var isLogin: boolean = true;
        var nameUser = data.user.name;
        localStorage.setItem("isLogin", String(isLogin));
        localStorage.setItem("nameUser", nameUser);
        window.location.href = 'http://localhost:3000'
      } else {
        console.log('Error de autenticación: No se encontró el usuario');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const storedValue = localStorage.getItem("isLogin");
    setIsLogin(storedValue === "true");
  }, []);

  useEffect(() => {
    if (isLog) {
      router.push("/");
    }
  }, [isLog]);

  return (
    <ApolloProvider client={client}>
      <div className={styles.mainContainer}>
        <div className={styles.container}>
          <h1 className={styles.title}>Iniciar sesión</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Contraseña:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.button}>
              Iniciar sesión
            </button>
          </form>
          <div className={styles.buttonContainer}>
            <Link className={styles.link} href="/" passHref>
              Volver al inicio
            </Link>
            <button className={styles.registerButton}>
              <Link className={styles.link} href="/register" passHref>
                Registrarme
              </Link>
            </button>
          </div>
        </div>
      </div>
    </ApolloProvider>
  );
};

export default Login;
