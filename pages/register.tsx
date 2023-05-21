import { useState } from 'react';
import styles from '../styles/Login.module.css';
import Link from 'next/link';
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router'; 
import React, { useEffect } from 'react';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // Reemplaza con la URL correcta de tu servidor GraphQL
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($userInput: CreateUserInput!) {
    createUser(userInput: $userInput) {
      email
      name
      password
    }
  }
`;

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLog, setIsLogin] = useState(false);
  const router = useRouter();
  const [createUser] = useMutation(CREATE_USER_MUTATION, {
    client, // Pasamos la instancia de ApolloClient a useMutation
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evita la recarga de la página
    try {
      const userInput = {
        email,
        name,
        password,
      };

      const { data } = await createUser({
        variables: { userInput },
      });

      console.log('Usuario creado:', data.createUser);

      // Mostrar el mensaje de registro exitoso
      setRegistrationSuccess(true);

      // Borrar el contenido de las casillas y los estados correspondientes
      setEmail('');
      setName('');
      setPassword('');

      // Puedes realizar acciones adicionales después de crear el usuario, como mostrar un mensaje de éxito o redirigir a otra página.
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      // Puedes manejar los errores de creación del usuario aquí, como mostrar un mensaje de error.
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

  if (registrationSuccess) {
    return (
      <ApolloProvider client={client}>
        <div className={styles.mainContainer}>
          <div className={styles.container}>
          <div className={styles.successMessage}>¡Registro exitoso!</div>

            <div className={styles.buttonContainer}>
              <Link className={styles.link} href="/" passHref>
                Volver al inicio
              </Link>
              <button className={styles.registerButton}>
                <Link className={styles.link} href="/login" passHref>
                  Iniciar Sesión
                </Link>
              </button>
            </div>
          </div>
        </div>
      </ApolloProvider>
    );
  }

  return (
    <ApolloProvider client={client}>
      <div className={styles.mainContainer}>
        <div className={styles.container}>
          <h1 className={styles.title}>Registro</h1>
          <form onSubmit={handleRegister} className={styles.form}>
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
              <label htmlFor="username" className={styles.label}>
                Username:
              </label>
              <input
                type="username"
                id="name"
                value={name}
                onChange={handleNameChange}
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
              Registrarme
            </button>
          </form>
          <div className={styles.buttonContainer}>
              <Link className={styles.link} href="/" passHref>
                Volver al inicio
              </Link>
              <button className={styles.registerButton}>
                <Link className={styles.link} href="/login" passHref>
                  Iniciar Sesión
                </Link>
              </button>
            </div>
        </div>
      </div>
    </ApolloProvider>
  );
};

export default Register;
