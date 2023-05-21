import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const Home = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [nameUser, setNameUser] = useState('');

  useEffect(() => {
    const storedValue = localStorage.getItem('isLogin');
    const storedName = localStorage.getItem('nameUser');
    if (storedValue === 'true') {
      setIsLogin(true);
      setNameUser(storedName ?? '');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLogin');
    localStorage.removeItem('nameUser');
    setIsLogin(false);
    setNameUser('');
  };

  if (isLogin) {
    const movies = [
      { id: 1, title: 'Pelicula 1' },
      { id: 2, title: nameUser },
      { id: 3, title: <a href="/">Cerrar Sesión</a>, onClick: handleLogout },
      // Agrega más películas aquí...
    ];
    return (
      <div className={styles.mainContainer}>
        <div className={styles.container}>
          <Head>
            <title>Películas</title>
          </Head>

          <h1 className={styles.title}>Bienvenido a la página de películas</h1>

          <div className={styles.movieList}>
            {movies.map((movie) => (
              <div key={movie.id} className={styles.movieItem} onClick={movie.onClick}>
                {movie.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    const movies = [
      { id: 1, title: <a href="/login">Iniciar sesión</a> },
    ];
    return (
      <div className={styles.mainContainer}>
        <div className={styles.container}>
          <Head>
            <title>Películas</title>
          </Head>

          <h1 className={styles.title}>Bienvenido a la página de películas</h1>

          <div className={styles.movieList}>
            {movies.map((movie) => (
              <div key={movie.id} className={styles.movieItem}>
                {movie.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

export default Home;