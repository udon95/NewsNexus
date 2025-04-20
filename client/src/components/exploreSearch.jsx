import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, ChevronDown } from "lucide-react";

const TIME_FILTERS = ["Latest", "Today", "Month", "Year", "All Time"];

const exploreSearchBar = ({
  onSearch,
  initialQuery = "",
  initialTimeFilter = "Latest",
  onTimeFilterChange,
  topics = [],
  selectedTopic = "",
  onTopicChange,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [timeFilter, setTimeFilter] = useState(initialTimeFilter);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowTimeDropdown(false);
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
    setShowTimeDropdown(false);
  };

  return (
    <div className="flex flex-col items-center mt-10 w-full">
      <div className="flex flex-wrap items-center justify-center space-x-3 w-full max-w-[900px] px-3 relative">

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-[350px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 min-w-[200px]"
        />
        <button
          className="bg-[#191A23] p-3 rounded-lg flex items-center justify-center shadow-lg"
          onClick={handleSearch}
        >
          <SearchIcon className="text-white" />
        </button>

        {/* Topic Dropdown */}
        <div className="relative">
          <select
            value={selectedTopic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="bg-[#191A23] text-white px-4 py-3 rounded-lg shadow-lg appearance-none min-w-[210px]"
          >
            <option value="">All Categories</option>
            <option value="recommended">Recommended for you</option>
            {topics.map((cat) => (
              <option key={cat.topicid} value={cat.topicid}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white">
            ▼
          </div>
        </div>

        {/* Time Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="bg-[#191A23] px-4 py-3 rounded-lg flex items-center justify-center shadow-lg text-white min-w-[100px]"
            onClick={() => setShowTimeDropdown((prev) => !prev)}
          >
            <span className="truncate mr-2">{timeFilter}</span>
            ▼
          </button>

          {showTimeDropdown && (
            <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-md z-10 w-40">
              {TIME_FILTERS.map((filter) => (
                <div
                  key={filter}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    filter === timeFilter ? "font-bold" : ""
                  }`}
                  onClick={() => handleTimeSelect(filter)}
                >
                  {filter}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Button */}
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

export default exploreSearchBar;
