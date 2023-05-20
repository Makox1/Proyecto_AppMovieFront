import React from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const Home = () => {
  const movies = [
    { id: 1, title: <a href="/login">Iniciar sesión</a> },
    { id: 2, title: 'Pelicula 1' },
    { id: 3, title: 'Pelicula 2' },
    // Agrega más películas aquí...
  ];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.container}>
        <Head>
          <title>Películas</title>
        </Head>

        <h1 className={styles.title}>
          Bienvenido a la página de películas{' '}
        </h1>

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
};

export default Home;
