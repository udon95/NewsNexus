import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, Filter } from "lucide-react";

const TIME_FILTERS = ["Today", "Week", "Month", "Year", "All Time"];

const SearchBar = ({ onSearch, initialQuery = "", initialTimeFilter = "This Week", onTimeFilterChange }) => {
  const [query, setQuery] = useState(initialQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const [timeFilter, setTimeFilter] = useState(initialTimeFilter);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = () => {
    if (onSearch) onSearch(query.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClearSearch = () => {
    setQuery("");
    if (onSearch) onSearch("");
  };

  const handleTimeSelect = (filter) => {
    setTimeFilter(filter);
    onTimeFilterChange(filter);
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <div className="flex items-center space-x-3 w-full max-w-[900px] px-3 relative">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
        />
        <button
          className="bg-[#191A23] p-3 rounded-lg flex items-center justify-center shadow-lg"
          onClick={handleSearch}
        >
          <SearchIcon className="text-white" />
        </button>

        <div className="relative" ref={dropdownRef}>
        <button
  className="bg-[#191A23] px-4 py-3 rounded-lg flex items-center justify-center shadow-lg text-white min-w-[100px]"
  onClick={() => setShowDropdown((prev) => !prev)}
>
  <Filter className="mr-2" />
  <span className="truncate">{timeFilter}</span>
</button>


          {showDropdown && (
            <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-md z-10 w-40">
              {TIME_FILTERS.map((filter) => (
                <div
                  key={filter}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${filter === timeFilter ? "font-bold" : ""}`}
                  onClick={() => handleTimeSelect(filter)}
                >
                  {filter}
                </div>
              ))}
            </div>
          )}
        </div>

        {query.trim() !== "" && (
          <button
            onClick={handleClearSearch}
            className="bg-[#191A23] p-3 h-12 rounded-lg text-white hover:bg-gray-300 transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
