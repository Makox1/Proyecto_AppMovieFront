import React, { useEffect, useState } from 'react';
import styles from '../styles/Navbar.module.css';

const Navbar: React.FC = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedValue = localStorage.getItem("isLogin");
    const storedUserName = localStorage.getItem("nameUser");
    if (storedValue === "true" && storedUserName) {
      setIsUserLoggedIn(true);
      setUserName(storedUserName || "");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("nameUser");
    setIsUserLoggedIn(false);
    setUserName("");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        <ul className={styles.navList}>
          <li>
            <a href="/">Home</a>
          </li>
        </ul>
      </div>
      <div className={styles.navbarRight}>
        <ul className={styles.navList}>
          {isUserLoggedIn ? (
            <>
              <li className={styles.username}>
                <a href="/perfil">{userName}</a>
              </li>
              <li className={styles.logout} onClick={logout}>
                <a href="/">Cerrar sesión</a>
              </li>
            </>
          ) : (
            <li className={styles.login}>
              <a href="/login">Login</a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
