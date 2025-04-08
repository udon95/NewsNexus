import React, { useState } from "react";
import { Search } from "lucide-react"; // Install 'lucide-react' for icons

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  // Function to handle search submission
  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  // Handle "Enter" key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    if (onSearch) {
      onSearch(""); // Clears results in the parent
    }
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <div className="flex items-center space-x-3 w-full max-w-[700px] px-3">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full max-w-screen bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
        />
        {/* Search Icon Button */}
        <button
          className="bg-[#191A23] p-3 rounded-lg flex items-center justify-center shadow-lg"
          onClick={handleSearch}
        >
          <Search className="text-white " />
        </button>

        {query.trim() !== "" && (
          <button
            onClick={handleClearSearch}
            className="bg-[#191A23] p-3 h-12 rounded-lg text-white 
                       hover:bg-gray-300 transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
