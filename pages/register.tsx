import { useState } from 'react';
import styles from '../styles/Login.module.css';
import Link from 'next/link';
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router'; 
import Navbar from '../components/Navbar';
import React, { useEffect } from 'react';

// Permite la conexion por un enlace a GraphQL
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
// Query para crear un nuevo usuario.
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

      

      // Mostrar el mensaje de registro exitoso
      setRegistrationSuccess(true);

      // Borrar el contenido de las casillas y los estados correspondientes
      setEmail('');
      setName('');
      setPassword('');

    } catch (error) {
      console.error('Error al crear el usuario:', error);
    
    }
  };

  // Si el usuario ya esta logeado, no deberia porque poder registrar uno nuevo y es redirigido a la pagina principal.
  useEffect(() => {
    const storedValue = localStorage.getItem("isLogin");
    setIsLogin(storedValue === "true");
    setIsInitialized(true);
  }, []);
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (isInitialized && isLog) {
      router.push("/");
    }
  }, [isInitialized, isLog]);

  // Si el registro fue exitoso, mostrara este mensaje.
  if (registrationSuccess) {
    return (
      <div> <Navbar />
      <ApolloProvider client={client}>
        <div className={styles.mainContainer}>
          <div className={styles.container}>
          <div className={styles.successMessage}>Successful registration!</div>

            <div className={styles.buttonContainer}>
              <Link className={styles.link} href="/" passHref>
                Back to home
              </Link>
              <button className={styles.registerButton}>
                <Link className={styles.link} href="/login" passHref>
                  Log in
                </Link>
              </button>
            </div>
          </div>
        </div>
      </ApolloProvider>
      </div>
    );
  }
  // Retorna el contenido de la pagina.
  return (
    <div> <Navbar />
    <ApolloProvider client={client}>
      <div className={styles.mainContainer}>
        <div className={styles.container}>
          <h1 className={styles.title}>Sign Up</h1>
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
                Password:
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
              Sign Up
            </button>
          </form>
          <div className={styles.buttonContainer}>
              <Link className={styles.link} href="/" passHref>
                Back to home
              </Link>
              <button className={styles.registerButton}>
                <Link className={styles.link} href="/login" passHref>
                  Log in
                </Link>
              </button>
            </div>
        </div>
      </div>
    </ApolloProvider>
    </div>
  );
};

export default Register;
