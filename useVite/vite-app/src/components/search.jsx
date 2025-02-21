import React, {useState} from "react";
import { Search } from "lucide-react"; // Install 'lucide-react' for icons
const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState("");
  
    // Function to handle search submission
    const handleSearch = () => {
      if (query.trim() !== "") {
        console.log("Searching for:", query); // Replace with actual search logic
        if (onSearch) {
          onSearch(query); // Pass query to parent component if needed
        }
      }
    };
  
    // Handle "Enter" key press
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    };

  return (
    <div className="flex flex-col items-center mt-10">
    <div className="flex items-center space-x-3 w-full max-w-[700px]">
      {/* Search Icon Button */}
      <button className="bg-[#191A23] p-3 rounded-lg flex items-center justify-center shadow-lg" onClick={handleSearch  }>
        <Search className="text-white w-6 h-6" />
      </button>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e)=>setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        className="w-full max-w-screen bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
      />
    </div>
    </div>
  );
};

export default SearchBar;
