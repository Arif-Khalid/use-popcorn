import { useState, useEffect } from "react";
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [numLoading, setNumLoading] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setErrorMessage("");
          setNumLoading((numLoading) => numLoading + 1);

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=4d3c0219&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok) {
            throw new Error("Something went wrong");
          }

          const data = await res.json();
          if (data.Response === "False") {
            throw new Error("Movie not found");
          }
          setMovies(data.Search);
          setErrorMessage("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setErrorMessage(err.message);
          }
        } finally {
          setNumLoading((numLoading) => numLoading - 1);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setErrorMessage("Type at least 3 letters to search!");
        return;
      }
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, numLoading, errorMessage };
}
