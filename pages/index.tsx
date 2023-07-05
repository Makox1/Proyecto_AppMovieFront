import { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import Navbar from "../components/Navbar";
import {Container, Typography, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, FormControl, Select, MenuItem, InputLabel} from "@mui/material";
import "../styles/Home.module.css";

// Interfaces, clases creadas para ser usadas en el codigo.
interface Movie {
  id: string;
  title: string;
  overview: string;
  poster_path: string;
}

interface Cast {
  idCast: string;
  nameActor: string;
  character: string;
}

interface MovieDetailProps {
  movie: Movie | null;
  onClose: () => void;
}

interface Playlist {
  idPlaylist: string;
  name: string;
  movies: Movie[];
}

//Contiene la informacion una vez abierto el popup.
const MovieDetail: React.FC<MovieDetailProps> = ({ movie, onClose }) => {
  if (!movie) return null;
  //Componentes y su set, son usadas para almacenar datos.
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isAddedToList, setIsAddedToList] = useState(false);
  const [movieCast, setMovieCast] = useState<Cast[]>([]);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [existingPlaylists, setExistingPlaylists] = useState<Playlist[]>([]);
  const [addedToListMessage, setAddedToListMessage] = useState("");

  //Si el usuario esta logeado, se permite ver opciones para añadir peliculas a lista.
  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");
    setIsUserLoggedIn(isLogin === "true");
  }, []);

  //Se hace uso de una query que permite saber si el usuario logeado, tiene o no playlist creadas.
  const fetchExistingPlaylists = async () => {
    const userId = localStorage.getItem("idUser");

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              Playlist(userId: ${userId}) {
                idPlaylist
                name
                movies {
                  id
                  title
                  poster_path
                }
              }
            }
          `,
        }),
      });

      const { data } = await response.json();
      setExistingPlaylists(data.Playlist);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setExistingPlaylists([]);
    }
  };

  useEffect(() => {
    fetchExistingPlaylists();
  }, []);

  useEffect(() => {
    const storedPlaylists = localStorage.getItem("playlists");
    if (storedPlaylists) {
      setPlaylists(JSON.parse(storedPlaylists));
    }
  }, []);

  // Permite al usuario añadir una pelicula a una playlist existente.
  const handleAddToExistingPlaylist = async (playlistId: string) => {
    const playlist = existingPlaylists.find((p) => p.idPlaylist === playlistId);
    if (playlist && movie) {
      try {
        const response = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation {
                addMoviePlaylist(playlistInput: {
                  idPlaylist: ${playlistId},
                  id: ${movie.id}
                }) {
                  idPlaylist
                  name
                  movies {
                    id
                    title
                  }
                }
              }
            `,
          }),
        });

        const { data } = await response.json();
        const updatedPlaylist = data.addMoviePlaylist;
        playlist.movies = updatedPlaylist.movies;
        setExistingPlaylists([...existingPlaylists]);
        localStorage.setItem("playlists", JSON.stringify(existingPlaylists));
        console.log(`Movie added to playlist ${playlistId}:`, movie.title);
        setIsAddedToList(true);
        setAddedToListMessage("Added to list");
      } catch (error) {
        console.error("Error updating playlist:", error);
      }
    }
  };

  // Permite crear al usuario una nueva playlist y añade una pelicula a esta.
  const handleCreatePlaylist = async () => {
    if (playlistName && movie) {
      try {
        const response = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation {
                createPlaylist(playlistInput: {
                  usersId: ${localStorage.getItem("idUser")},
                  name: "${playlistName}"
                }) {
                  idPlaylist
                  name
                  usersId
                }
              }
            `,
          }),
        });

        const { data } = await response.json();
        const newPlaylist = data.createPlaylist;

        setExistingPlaylists([...existingPlaylists, newPlaylist]);
        console.log("New playlist created:", newPlaylist.name);

        const responseAddMovie = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation {
                addMoviePlaylist(playlistInput: {
                  idPlaylist: ${newPlaylist.idPlaylist},
                  id: ${movie.id}
                }) {
                  idPlaylist
                  name
                  movies {
                    id
                    title
                  }
                }
              }
            `,
          }),
        });
        const { data: dataAddMovie } = await responseAddMovie.json();
        const updatedPlaylist = dataAddMovie.addMoviePlaylist;
        newPlaylist.movies = updatedPlaylist.movies;
        setExistingPlaylists([...existingPlaylists]);
        localStorage.setItem("playlists", JSON.stringify(existingPlaylists));
        console.log(
          `Movie added to new playlist ${newPlaylist.idPlaylist}:`,
          movie.title
        );
        setIsAddedToList(true);
        setAddedToListMessage("Added to list");
        setShowCreatePlaylist(false);
      } catch (error) {
        console.error("Error creating playlist:", error);
      }
    }
  };

  const handleCloseCreatePlaylist = () => {
    setShowCreatePlaylist(false);
  };

  // Permite mostrar los datos del Reparto en las peliculas.
  const fetchMovieCast = async () => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              Cast(idMovie: ${movie.id}) {
                nameActor
                character
              }
            }
          `,
        }),
      });

      const { data } = await response.json();
      const castData = data.Cast;
      setMovieCast(castData);
    } catch (error) {
      console.error("Error fetching movie cast:", error);
      setMovieCast([]);
    }
  };

  useEffect(() => {
    fetchMovieCast();
  }, []);

  //Retorna la informacion en el Popup
  return (
    <Dialog open onClose={onClose} aria-labelledby="movie-detail-dialog">
      <DialogTitle>{movie.title}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                alt={movie.title}
                style={{ width: "100%", height: "auto" }}
              />
            ) : (
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png"
                alt="No Image"
                style={{ width: "100%", height: "auto" }}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="body1"
              style={{ fontSize: "1.2rem", marginBottom: "1rem" }}
            >
              {movie.overview}
            </Typography>
          </Grid>
        </Grid>
        {movieCast.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name Actor</TableCell>
                  <TableCell>Character</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movieCast.map((cast) => (
                  <TableRow key={cast.idCast}>
                    <TableCell>{cast.nameActor}</TableCell>
                    <TableCell>{cast.character}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        {isUserLoggedIn && !isAddedToList && (
          <>
            {showCreatePlaylist ? (
              <>
                <FormControl>
                  <TextField
                    label="Playlist Name"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    required
                  />
                </FormControl>
                <Button onClick={handleCreatePlaylist} color="primary">
                  Create Playlist
                </Button>
                <Button onClick={handleCloseCreatePlaylist} color="secondary">
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {existingPlaylists.length > 0 && (
                  <FormControl>
                    <InputLabel>Select Playlist</InputLabel>
                    <Select
                      value=""
                      onChange={(e) =>
                        handleAddToExistingPlaylist(e.target.value as string)
                      }
                      style={{ minWidth: "200px" }}
                    >
                      <MenuItem value="" disabled>
                        Select Playlist
                      </MenuItem>
                      {existingPlaylists.map((playlist) => (
                        <MenuItem
                          key={playlist.idPlaylist}
                          value={playlist.idPlaylist}
                        >
                          {playlist.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {!showCreatePlaylist && (
                  <Button
                    onClick={() => setShowCreatePlaylist(true)}
                    color="primary"
                  >
                    Create New Playlist
                  </Button>
                )}
              </>
            )}
          </>
        )}
        <div>
          {isAddedToList && (
            <Typography
              variant="body2"
              color="textSecondary"
              style={{ textTransform: "uppercase" }}
            >
              {addedToListMessage}
            </Typography>
          )}
        </div>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Contiene la informacion de las peliculas como portada y titulo. Estas son mostradas en la pagina principal.
const MoviesComponent: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchedMovies, setSearchedMovies] = useState<Movie[]>([]); // Estado para almacenar las películas filtradas por la búsqueda
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // Estado para almacenar el valor de búsqueda
  const moviesPerPage = 12;
  const visiblePageNumbers = 5;

  // Con esta query, se obtienen los datos de las peliculas.
  useEffect(() => {
    async function fetchMoviesData() {
      const client = new ApolloClient({
        uri: "http://localhost:4000/graphql",
        cache: new InMemoryCache(),
      });

      const query = gql`
        query {
          Movies {
            id
            title
            overview
            poster_path
          }
        }
      `;

      try {
        const response = await client.query({
          query: query,
        });

        const movieData = response.data.Movies;
        setMovies(movieData);
        setSearchedMovies(movieData);

        const totalPagesCount = Math.ceil(movieData.length / moviesPerPage);
        setTotalPages(totalPagesCount);
      } catch (error) {
        console.error("Error fetching movie data:", error);
        setMovies([]);
        setSearchedMovies([]);
      }
    }

    fetchMoviesData();
  }, []);

  const handleMovieClick = async (movie: Movie) => {
    setSelectedMovie({ ...movie });
  };

  const handleDialogClose = () => {
    setSelectedMovie(null);
  };

  const handleSearch = () => {
    // Filtrar las películas por el valor de búsqueda en la lista completa de películas
    const filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Actualizar las películas filtradas y el número total de páginas
    setSearchedMovies(filteredMovies);
    setTotalPages(Math.ceil(filteredMovies.length / moviesPerPage));
    setCurrentPage(1);
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value);
  };

  const handleFirstPageClick = () => {
    setCurrentPage(1);
  };

  const handleLastPageClick = () => {
    setCurrentPage(totalPages);
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPageClick = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleNextPageClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const startPage = Math.max(
      1,
      currentPage - Math.floor(visiblePageNumbers / 2)
    );
    const endPage = Math.min(totalPages, startPage + visiblePageNumbers - 1);

    for (let page = startPage; page <= endPage; page++) {
      pageNumbers.push(
        <Button
          key={page}
          onClick={() => handlePageClick(page)}
          disabled={page === currentPage}
        >
          {page}
        </Button>
      );
    }
    // Botonera que permite el cambio de pagina entre las peliculas.
    return (
      <Box
        display="flex"
        justifyContent="center"
        marginTop={2}
        marginBottom={2}
      >
        <Paper elevation={3} sx={{ borderRadius: "10px" }}>
          <Box display="flex" alignItems="center" p={1}>
            <Button onClick={handleFirstPageClick} disabled={currentPage === 1}>
              First
            </Button>
            <Button onClick={handlePrevPageClick} disabled={currentPage === 1}>
              Previous
            </Button>
            {pageNumbers}
            <Button
              onClick={handleNextPageClick}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              onClick={handleLastPageClick}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  };

  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const visibleMovies = searchedMovies.slice(startIndex, endIndex);

  // Retorna el container de las peliculas.
  return (
    <div className="mainContainer">
      <Navbar />
      <Container maxWidth="xl">
        <Box
          display="inline-flex"
          alignItems="center"
          my={2}
          bgcolor="white"
          p={1}
          borderRadius="10px"
          fontSize={14}
        >
          <TextField
            label="Search Movie"
            value={searchQuery}
            onKeyUp={handleSearch}
            onChange={handleSearchInputChange}
          />
        </Box>
        <Grid container spacing={2}>
          {visibleMovies.map((movie) => (
            <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3} xl={2}>
              <div
                className="movie-box"
                onClick={() => handleMovieClick(movie)}
              >
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={movie.title}
                    style={{ width: "100%", height: "auto" }}
                  />
                ) : (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png"
                    alt="No Image"
                    style={{ width: "100%", height: "auto" }}
                  />
                )}
              </div>
              <Typography variant="subtitle1" align="center" gutterBottom>
                {movie.title}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Container maxWidth="xl">{renderPageNumbers()}</Container>
      <MovieDetail movie={selectedMovie} onClose={handleDialogClose} />
    </div>
  );
};

export default MoviesComponent;
