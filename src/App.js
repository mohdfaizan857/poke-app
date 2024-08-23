import React, { useState, useEffect } from "react";
import axios from "axios";
import PokemonList from "./components/PokemonList";
import "./App.css";

const App = () => {
  const [pokemonData, setPokemonData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [cache, setCache] = useState({});

  const limit = 20; // Number of Pokémon per page
  const maxPageButtons = 3; // Number of pagination buttons to show

  useEffect(() => {
    const fetchData = async () => {
      const offset = (currentPage - 1) * limit;
      const cacheKey = `${offset}-${limit}`;

      if (cache[cacheKey]) {
        setPokemonData(cache[cacheKey]);
        setTotalPages(Math.ceil(1118 / limit)); // Assume there are 1118 Pokémon
      } else {
        try {
          const response = await axios.get(
            `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
          );
          setPokemonData(response.data.results);
          setTotalPages(Math.ceil(response.data.count / limit));
          setCache((prevCache) => ({
            ...prevCache,
            [cacheKey]: response.data.results,
          }));
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
    };

    fetchData();
  }, [currentPage, cache]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPokemon = pokemonData.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Generate page numbers to display
  const getPaginationNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let end = Math.min(totalPages, start + maxPageButtons - 1);

    // Adjust the start if the max page buttons go beyond total pages
    if (end - start + 1 < maxPageButtons) {
      start = Math.max(1, end - maxPageButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="App">
      <h1>Pokémon List</h1>
      <input
        type="text"
        placeholder="Search Pokémon"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <PokemonList pokemonData={filteredPokemon} />
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {getPaginationNumbers().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            className={currentPage === pageNumber ? "active" : ""}
          >
            {pageNumber}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default App;
