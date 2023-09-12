import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     title: "Inception",
//     Year: "2010",
//     poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     title: "Back to the Future",
//     Year: "1985",
//     poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Enter" && document.activeElement !== inputEl.current) {
          setQuery("");
          inputEl.current.focus();
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [setQuery]
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function NumResults({ numResults }) {
  return (
    <p className="num-results">
      Found <strong>{numResults}</strong> results
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function MovieDetails({
  watched,
  selectedId,
  onCloseMovie,
  onAddWatched,
  onRatingChange,
  onRemoveWatched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const watchedMovie = watched.find(
    (watchedMovie) => watchedMovie.imdbID === selectedId
  );
  const [userRating, setUserRating] = useState(watchedMovie?.userRating || 0);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAddWatched() {
    if (watchedMovie) {
      return;
    }
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      Year: year,
      poster,
      runtime: parseInt(runtime),
      imdbRating: parseFloat(imdbRating),
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  function handleRatingChange(newRating) {
    watchedMovie && onRatingChange(newRating);
    setUserRating(newRating);
  }

  function handleRemoveWatched() {
    onRemoveWatched(selectedId);
    onCloseMovie();
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onCloseMovie();
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovieDetail() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=4d3c0219&i=${selectedId}`,
            { signal: controller.signal }
          );
          const data = await res.json();
          setMovie(data);
          setIsLoading(false);
        } catch (err) {
          if (err.name !== "AbortError") {
            //todo Implement some error handling for this
            //medium priority
            console.log(err.message);
          }
        }
      }
      fetchMovieDetail();
      return function () {
        controller.abort();
      };
    },
    [selectedId]
  );

  useEffect(
    function () {
      document.title = isLoading ? "Loading" : `Movie | ${title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [isLoading, title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span> {imdbRating} IMDB rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={handleRatingChange}
                defaultRating={userRating}
              />
              {!watchedMovie && userRating > 0 && (
                <button className="btn-add" onClick={handleAddWatched}>
                  <span>🍿</span> Add to list
                </button>
              )}
              {watchedMovie && (
                <button className="btn-remove" onClick={handleRemoveWatched}>
                  <span>❌</span> Remove from list
                </button>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedMovie({ movie, onRemoveWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button
        className="btn-delete"
        onClick={() => onRemoveWatched(movie.imdbID)}
      >
        X
      </button>
    </li>
  );
}

function WatchedMovieList({ watched, onRemoveWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onRemoveWatched={onRemoveWatched}
        />
      ))}
    </ul>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.round(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "-" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Loader() {
  return <div className="loader">Loading...</div>;
}

function ErrorMessage({ message }) {
  return (
    <div className="error">
      <span>⛔</span> {message}
    </div>
  );
}
export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const [watched, setWatched] = useLocalStorageState("watched", []);
  console.log(watched);
  function handleSelectMovie(id) {
    setSelectedId(id === selectedId ? "" : id);
  }

  function handleCloseMovie() {
    setSelectedId("");
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleExistingRatingChange(newRating) {
    setWatched((watched) =>
      watched.map((watchedMovie) =>
        watchedMovie.imdbID === selectedId
          ? { ...watchedMovie, userRating: newRating }
          : watchedMovie
      )
    );
  }

  function handleRemoveWatched(imdbID) {
    setWatched(
      watched.filter((watchedMovie) => watchedMovie.imdbID !== imdbID)
    );
  }

  const { movies, numLoading, errorMessage } = useMovies(query);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults numResults={movies.length} />
      </NavBar>
      <Main>
        <Box>
          {!numLoading && !errorMessage && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {Boolean(numLoading) && <Loader />}
          {errorMessage && <ErrorMessage message={errorMessage} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              key={selectedId}
              watched={watched}
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              onRatingChange={handleExistingRatingChange}
              onRemoveWatched={handleRemoveWatched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onRemoveWatched={handleRemoveWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
