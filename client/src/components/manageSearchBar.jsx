import React, { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const TIME_FILTERS = ["All Time", "Year", "Month", "Week", "Today"];

const ManageBar = ({
  onSearch,
  initialQuery = "",
  initialTimeFilter = "",
  onTimeFilterChange,
  articleType = "all",
  onArticleTypeChange,
  isPremium = false,
  topics = [],
  selectedTopicId = "",
  onTopicChange,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [timeFilter, setTimeFilter] = useState(initialTimeFilter);

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
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <div className="flex flex-wrap gap-3 w-full max-w-[850px] px-3 relative">
        {/* Search Input */}
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

        {query.trim() !== "" && (
          <button
            onClick={handleClearSearch}
            className="bg-[#191A23] p-3 h-12 rounded-lg text-white hover:bg-gray-300 transition"
          >
            Clear
          </button>
        )}

        {/* Article Type Filter */}
        <div className="relative inline-block min-w-fit max-w-full overflow-hidden">
          <select
            value={articleType}
            onChange={(e) => onArticleTypeChange(e.target.value)}
            className="bg-[#191A23] py-3 pl-4 pr-10 rounded-lg shadow-lg text-white appearance-none capitalize whitespace-nowrap w-auto"
          >
            <option value="all">All</option>
            <option value="article">Article</option>
            {isPremium && <option value="room article">Room Article</option>}
            <option value="draft">Draft</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ArrowDropDownIcon className="text-white" />
          </div>
        </div>

        {/* Time Filter */}
        <div className="relative inline-block min-w-fit max-w-full overflow-hidden">
          <select
            value={timeFilter}
            onChange={(e) => handleTimeSelect(e.target.value)}
            className="bg-[#191A23] py-3 pl-4 pr-10 rounded-lg shadow-lg text-white appearance-none whitespace-nowrap w-auto"
          >
            {TIME_FILTERS.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ArrowDropDownIcon className="text-white" />
          </div>
        </div>

        {/* Topic Filter */}
        {topics?.length > 0 && (
          <div className="relative inline-block min-w-fit max-w-full overflow-hidden">
            <select
              value={selectedTopicId}
              onChange={(e) => onTopicChange(e.target.value)}
              className="bg-[#191A23] py-3 pl-4 pr-10 rounded-lg shadow-lg text-white appearance-none whitespace-nowrap w-auto"
            >
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic.topicid} value={topic.topicid}>
                  {topic.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowDropDownIcon className="text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBar;
