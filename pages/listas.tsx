import React, { useEffect, useState } from "react";
import { Container, Typography, List, ListItem, ListItemText, Box } from "@mui/material";
import Navbar from "../components/Navbar";

type Playlist = {
  idPlaylist: number;
  name: string;
  movies: {
    id: number;
    original_title: string;
    poster_path: string;
  }[];
};


const MyPage: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

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
                original_title
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

  return (
    <div>
      <Navbar />
      <Typography variant="h4" component="h1" gutterBottom>
        My Playlists
      </Typography>
      <Container maxWidth="xl">
      {playlists.map((playlist) => (
        <div key={playlist.idPlaylist}>
          <Typography variant="h6" component="h2" gutterBottom>
            {playlist.name}
          </Typography>
          <Box display="flex" flexWrap="wrap">
            {playlist.movies.map((movie) => (
              <ListItem key={movie.id} style={{ flexBasis: "16.666%", maxWidth: "16.666%", marginBottom: "20px" }}>
                <div style={{ textAlign: "center" }}>
                  {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={movie.original_title}
                    style={{ width: '100%', height: 'auto' }}
                  />
                ) : (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png" // Ruta relativa a la imagen de reemplazo en tu proyecto
                    alt="No Image"
                    style={{ width: '100%', height: 'auto' }}
                  />
                )}
                <ListItemText primary={movie.original_title} />
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
