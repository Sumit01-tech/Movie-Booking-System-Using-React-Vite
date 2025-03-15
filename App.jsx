import { useState, useEffect } from 'react';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'use-debounce';
import { updateSearhCount } from './appwrite.js';

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";

console.log("Loaded API Key:", API_KEY);

if (!API_KEY) {
  console.error("❌ API Key is missing! Check your .env file.");
  alert("API Key is missing! Add VITE_TMDB_API_KEY to your .env file.");
}

const getMovieEndpoint = (query) =>
  query
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`
    : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceSearchTerm] = useDebounce(searchTerm, 500);

  const fetchMovie = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = getMovieEndpoint(query);
      console.log("Fetching from:", endpoint);

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (!data.results || data.results.length === 0) {
        setErrorMessage('No movies found.');
        setMovieList([]);
      } else {
        setMovieList(data.results);

        if (query) {
          await updateSearhCount(query, data.results[0]);
        }
      }
    } catch (error) {
      console.error(`❌ Error Fetching Movie:`, error);
      setErrorMessage('⚠️ Failed to fetch movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovie(debounceSearchTerm);
  }, [debounceSearchTerm]);

  return (
    <main className="overflow-x-hidden">
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src="./hero.png" alt="hero banner" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
              without the Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          <section className="all-movies">
            <h2 className="mt-[20px]">All Movies</h2>

            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500 font-semibold">{errorMessage}</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
