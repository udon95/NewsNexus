import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, Filter } from "lucide-react";
import { ChevronDown } from "lucide-react";

const TIME_FILTERS = ["Today", "Week", "Month", "Year", "All Time"];

// const SearchBar = ({ onSearch, initialQuery = "", initialTimeFilter = "This Week", onTimeFilterChange }) => {
  const SearchBar = ({
    onSearch,
    initialQuery = "",
    initialTimeFilter = "This Week",
    onTimeFilterChange,
    showSizeFilter = false,          // new prop
    sizeFilter = "All",              // new prop
    onSizeFilterChange = () => {},   // new prop
  }) => {
  
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
    <div className="flex items-center justify-center gap-3 w-full max-w-[900px] px-3 relative">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full h-12 bg-gray-100 rounded-2xl px-4 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
          />
        <button
          className="bg-[#191A23] p-3 rounded-lg flex items-center justify-center shadow-lg"
          onClick={handleSearch}
        >
          <SearchIcon className="text-white" />
        </button>


    {/* DEVI MADE CHANGES HERE */}
    {showSizeFilter ? (
      <div className="relative min-w-[160px] h-12 rounded-lg shadow-lg">
        <select
          value={sizeFilter}
          onChange={(e) => onSizeFilterChange(e.target.value)}
          className="bg-[#191A23] text-white w-full h-full pl-5 pr-10 rounded-lg text-sm appearance-none shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="All">All Sizes</option>
          <option value="Small">Small (&lt;10)</option>
          <option value="Medium">Medium (10–50)</option>
          <option value="Large">Large (50+)</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    ) : (
      // timeFilter button dropdown remains unchanged
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
    )}
    {/* DEVI CHANGES END HERE */}


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
