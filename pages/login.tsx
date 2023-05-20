import { useState } from 'react';
import styles from '../styles/Login.module.css';
import Link from 'next/link';
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
    // Aquí puedes realizar la lógica de autenticación con el email y la contraseña ingresados
    try {
      if (data && data.user) {
        console.log('Usuario autenticado:', data.user);
        // Si la consulta fue exitosa y se obtuvo un usuario, puedes manejarlo aquí.
        // Por ejemplo, podrías guardar el usuario en el estado de tu aplicación, o redirigir a otra página.
      } else {
        console.log('Error de autenticación: No se encontró el usuario');
        // Si no se obtuvo un usuario, puedes manejarlo aquí.
        // Por ejemplo, podrías mostrar un mensaje de error.
      }
    } catch (error) {
      console.error(error);
      // Aquí puedes manejar los errores de autenticación
    }
  };

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
