import { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import '../styles/Home.module.css';

interface CastMember {
  id: string;
  name: string;
  character: string;
}

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  cast: CastMember[];
}

interface MovieDetailProps {
  movie: Movie | null;
  onClose: () => void;
}

const MovieDetail: React.FC<MovieDetailProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const isLogin = localStorage.getItem('isLogin');
    setIsUserLoggedIn(isLogin === 'true');
  }, []);

  const handleAddToList = () => {
    console.log('Pelicula agregada a la lista:', movie.title);
  };

  return (
    <Dialog open onClose={onClose} aria-labelledby="movie-detail-dialog">
      <DialogTitle>{movie.title}</DialogTitle>
      <DialogContent>
      <Grid container spacing={2}>
  <Grid item xs={12} sm={6}>
    <img
      src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
      alt={movie.title}
      style={{ width: '100%', height: 'auto' }}
    />
  </Grid>
  <Grid item xs={12} sm={6}>
    <Typography variant="body1" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
      {movie.overview}
    </Typography>
  </Grid>
  <Grid item xs={12}>
    <Typography variant="h6" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
      Cast:
    </Typography>
    <TableContainer component={Paper} style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Actor name</TableCell>
            <TableCell>Character</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movie.cast.map((actor) => (
            <TableRow key={actor.id}>
              <TableCell>{actor.name}</TableCell>
              <TableCell>{actor.character}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Grid>
</Grid>
       
      </DialogContent>
      <DialogActions>
      {isUserLoggedIn && (
          <Button onClick={handleAddToList} color="primary">
            Add to List
          </Button>
        )}
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MoviesComponent: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const moviesPerPage = 18;
  const visiblePageNumbers = 5; // Number of visible page numbers

  useEffect(() => {
    async function fetchMoviesData() {
      const client = new ApolloClient({
        uri: 'http://localhost:4000/graphql',
        cache: new InMemoryCache(),
      });

      const query = gql`
        query {
          Movies {
            id
            original_title
          }
        }
      `;

      try {
        const response = await client.query({
          query: query,
        });

        const movieIds = response.data.Movies.map((movie: { id: string }) => movie.id);
        const totalPagesCount = Math.ceil(movieIds.length / moviesPerPage);
        setTotalPages(totalPagesCount);

        const startIndex = (currentPage - 1) * moviesPerPage;
        const endIndex = startIndex + moviesPerPage;
        const visibleIds = movieIds.slice(startIndex, endIndex);

        const moviesData = await Promise.all(
          visibleIds.map(async (id: string) => {
            const movieDetailsResponse = await axios.get(
              `https://api.themoviedb.org/3/movie/${id}?api_key=ae050d333acebfc9feca36ee007931ce`
            );
            const creditsResponse = await axios.get(
              `https://api.themoviedb.org/3/movie/${id}/credits?api_key=ae050d333acebfc9feca36ee007931ce`
            );
            return {
              ...movieDetailsResponse.data,
              cast: creditsResponse.data.cast,
            };
          })
        );

        setMovies(moviesData);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setMovies([]);
      }
    }
    fetchMoviesData();
  }, [currentPage]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  const handleDialogClose = () => {
    setSelectedMovie(null);
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
    const startPage = Math.max(1, currentPage - Math.floor(visiblePageNumbers / 2));
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

    return (
      <Box display="flex" justifyContent="center" marginTop={2} marginBottom={2}>
        <Paper elevation={3} sx={{ borderRadius: '10px' }}>
          <Box display="flex" alignItems="center" p={1}>
            <Button onClick={handlePrevPageClick} disabled={currentPage === 1}>
              Previous
            </Button>
            {pageNumbers}
            <Button onClick={handleNextPageClick} disabled={currentPage === totalPages}>
              Next
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <div className="mainContainer">
      <Navbar />
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          {movies.map((movie) => (
            <Grid item key={movie.id} xs={12} sm={6} md={4} lg={3} xl={2}>
              <div className="movie-box" onClick={() => handleMovieClick(movie)}>
                <img
                  src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                  alt={movie.title}
                  style={{ width: '100%', height: 'auto', cursor: 'pointer' }}
                />
                <Typography variant="subtitle1" align="center" gutterBottom>
                  {movie.title}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Container maxWidth="xl">
        {renderPageNumbers()}
      </Container>
      <MovieDetail movie={selectedMovie} onClose={handleDialogClose} />
    </div>
  );
};

export default MoviesComponent;
