import React, { useEffect, useState } from "react";
import {Container,Typography,List,ListItem,ListItemText,Box,Button,Dialog,DialogTitle,DialogContent,DialogActions,TextField, Grid,Table,TableHead,TableRow,TableCell,TableBody,TableContainer,Paper,} from "@mui/material";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

type Playlist = {
  idPlaylist: number;
  name: string;
  movies: {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
  }[];
};

type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
};

const MyPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLog, setIsLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedValue = localStorage.getItem("isLogin");
    setIsLogin(storedValue === "true");
    setIsInitialized(true);
  }, []);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized && !isLog) {
      router.push("/");
    }
  }, [isInitialized, isLog]);

  useEffect(() => {
    const userId = localStorage.getItem("idUser");

    fetch("http://localhost:4000/graphql", {
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
                overview
                poster_path
              }
            }
          }
        `,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setPlaylists(data.data.Playlist);
      })
      .catch((error) => {
        console.error("Error fetching playlists:", error);
      });
  }, []);

  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState("");

  const handleCreatePlaylist = async () => {
    if (playlistName) {
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

        setPlaylists([...playlists, newPlaylist]);
        console.log("New playlist created:", newPlaylist.name);

        setPlaylistName("");
        setShowCreatePlaylist(false);
      } catch (error) {
        console.error("Error creating playlist:", error);
      }
    }
  };

  const handleCancelCreatePlaylist = () => {
    setShowCreatePlaylist(false);
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    const userId = localStorage.getItem("idUser");

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation {
              deletePlaylist(playlistInput: {
                idPlaylist: ${playlistId},
                idUser: ${userId}
              })
            }
          `,
        }),
      });

      if (response.ok) {
        setPlaylists(
          playlists.filter((playlist) => playlist.idPlaylist !== playlistId)
        );
        console.log("Playlist deleted:", playlistId);
      } else {
        console.error("Error deleting playlist");
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  };

  const [showUpdatePlaylist, setShowUpdatePlaylist] = useState(false);
  const [updatePlaylistId, setUpdatePlaylistId] = useState<number | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedMovieCast, setSelectedMovieCast] = useState<
    { nameActor: string; character: string }[] | null
  >(null);

  const handleUpdatePlaylist = async () => {
    const userId = localStorage.getItem("idUser");

    if (newPlaylistName && updatePlaylistId !== null) {
      try {
        const response = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation {
                updatePlaylist(playlistInput: {
                  idPlaylist: ${updatePlaylistId},
                  usersId: ${userId},
                  name: "${newPlaylistName}"
                })
              }
            `,
          }),
        });

        if (response.ok) {
          setPlaylists(
            playlists.map((playlist) =>
              playlist.idPlaylist === updatePlaylistId
                ? { ...playlist, name: newPlaylistName }
                : playlist
            )
          );
          console.log("Playlist updated:", updatePlaylistId);

          setNewPlaylistName("");
          setShowUpdatePlaylist(false);
        } else {
          console.error("Error updating playlist");
        }
      } catch (error) {
        console.error("Error updating playlist:", error);
      }
    }
  };

  const handleMovieClick = async (movie: Movie) => {
    setSelectedMovie(movie);
    setMovieDialogOpen(true);

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
      setSelectedMovieCast(castData);
    } catch (error) {
      console.error("Error fetching movie cast:", error);
    }
  };

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isMovieDialogOpen, setMovieDialogOpen] = useState(false);
  const [selectedMovieData, setSelectedMovieData] = useState<Movie | null>(
    null
  );

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query {
                MovieId(id: ${selectedMovie?.id}) {
                  title
                  overview
                  poster_path
                }
              }
            `,
          }),
        });

        const { data } = await response.json();
        const movieData = data.MovieId;
        setSelectedMovieData(movieData);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    if (selectedMovie) {
      fetchMovieDetails();
    }
  }, [selectedMovie]);

  const handleRemoveMovieFromPlaylist = async (
    playlistId: number,
    movieId: number
  ) => {
    try {
      const response = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation {
              removeMoviePlaylist(playlistInput: {
                idPlaylist: ${playlistId},
                id: ${movieId}
              })
            }
          `,
        }),
      });

      if (response.ok) {
        // Actualizar la lista de películas en la playlist
        setPlaylists((prevPlaylists) => {
          return prevPlaylists.map((playlist) => {
            if (playlist.idPlaylist === playlistId) {
              return {
                ...playlist,
                movies: playlist.movies.filter((movie) => movie.id !== movieId),
              };
            }
            return playlist;
          });
        });
        console.log("Movie removed from playlist:", movieId);
      } else {
        console.error("Error removing movie from playlist");
      }
    } catch (error) {
      console.error("Error removing movie from playlist:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
          marginRight: "40px",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => setShowCreatePlaylist(true)}
          style={{ backgroundColor: "white" }}
        >
          Create New Playlist
        </Button>
      </div>
      <Dialog open={showCreatePlaylist} onClose={handleCancelCreatePlaylist}>
        <DialogTitle>Create New Playlist</DialogTitle>
        <DialogContent>
          <TextField
            label="Playlist Name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCreatePlaylist}>Cancel</Button>
          <Button onClick={handleCreatePlaylist} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showUpdatePlaylist}
        onClose={() => setShowUpdatePlaylist(false)}
      >
        <DialogTitle>Update Playlist Name</DialogTitle>
        <DialogContent>
          <TextField
            label="New Playlist Name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdatePlaylist(false)}>Cancel</Button>
          <Button onClick={handleUpdatePlaylist} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isMovieDialogOpen}
        onClose={() => setMovieDialogOpen(false)}
        aria-labelledby="movie-detail-dialog"
      >
        <DialogTitle>{selectedMovie?.title}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {selectedMovie?.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500/${selectedMovie?.poster_path}`}
                  alt={selectedMovie?.title}
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
                {selectedMovieData?.overview}
              </Typography>
              <Typography
                variant="subtitle1"
                style={{ fontWeight: "bold", marginBottom: "0.5rem" }}
              >
                Cast:
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name Actor</TableCell>
                      <TableCell>Character</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedMovieCast?.map((actor) => (
                      <TableRow key={actor.nameActor}>
                        <TableCell>{actor.nameActor}</TableCell>
                        <TableCell>{actor.character}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div>
            {/* New "Remove" button */}
            {playlists.map(
              (playlist) =>
                playlist.movies?.find(
                  (movie) => movie.id === selectedMovie?.id
                ) && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      handleRemoveMovieFromPlaylist(
                        playlist.idPlaylist,
                        selectedMovie?.id as number
                      );
                      setMovieDialogOpen(false);
                    }}
                    style={{ backgroundColor: "white" }}
                  >
                    Remove for the list
                  </Button>
                )
            )}
          </div>
          <Button onClick={() => setMovieDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Container maxWidth="xl">
        {playlists.map((playlist) => (
          <div key={playlist.idPlaylist}>
            <Typography variant="h6" component="h2" gutterBottom>
              {playlist.name}
              <Button
                variant="outlined"
                onClick={() => handleDeletePlaylist(playlist.idPlaylist)}
                style={{ backgroundColor: "white", marginLeft: "10px" }}
              >
                Delete
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setUpdatePlaylistId(playlist.idPlaylist);
                  setShowUpdatePlaylist(true);
                }}
                style={{ backgroundColor: "white", marginLeft: "10px" }}
              >
                Edit
              </Button>
            </Typography>
            <Box display="flex" flexWrap="wrap">
              {playlist.movies?.map((movie) => (
                <ListItem
                  key={movie.id}
                  style={{
                    flexBasis: "16.666%",
                    maxWidth: "16.666%",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    {/* Contenido de la película */}
                    <div onClick={() => handleMovieClick(movie)}>
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
                      <ListItemText primary={movie.title} />
                    </div>
                  </div>
                </ListItem>
              ))}
            </Box>
          </div>
        ))}
      </Container>
    </div>
  );
};

export default MyPage;
