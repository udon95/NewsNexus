import { useState } from "react";
import { Search, MoreVertical } from "lucide-react";

const ManageArticle = () => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const articles = [
    { id: 1, title: "Personal Top 10 Singaporean Xiao Mei Mei", type: "Posted" },
    { id: 2, title: "Latest Malaysian Forest Fire", type: "Posted" },
    { id: 3, title: "US Currency Strengthens again", type: "Posted" },
    { id: 4, title: "Personal Reflection of 2024 Economics", type: "Draft", expires: "Mar 25, 2025" },
    { id: 5, title: "An Objective View of ASEAN Political Landscape", type: "Draft", expires: "Mar 25, 2025" },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesFilter = filter === "All" || article.type === filter;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Filter by Topic */}
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm font-medium">Filter by Topic:</label>
        <select
          className="border px-3 py-1 rounded-md"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option>All Topics</option>
          <option>Technology</option>
          <option>Economy</option>
          <option>Politics</option>
          <option>Finance</option>
          <option>Politics</option>
          <option>Entertainment</option>
          <option>Sports</option>
          <option>Weather</option>
          <option>Lifestyle</option>
          <option>Beauty</option>
          <option>Hollywood</option>
          <option>China</option>
          <option>Horticulture</option>
          <option>Culinary</option>
          <option>LGBTQ++</option>
          <option>Singapore</option>
          <option>Environment</option>
          <option>Investment</option>
          <option>USA</option>
          <option>Luxury</option>
          <option>Korea</option>
        </select>
      </div>

      {/* Show Filter */}
      <div className="flex gap-2 mb-4">
        {["All", "Posted", "Draft"].map((status) => (
          <button
            key={status}
            className={`px-4 py-1 border rounded-md ${filter === status ? "bg-black text-white" : "bg-white"}`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-4 py-2 w-full rounded-md"
        />
        <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
      </div>

      {/* Posted Articles Section */}
      <div>
        <h2 className="font-semibold text-lg mb-2">My Posted Articles:</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {filteredArticles
            .filter(article => article.type === "Posted")
            .map(article => (
              <div key={article.id} className="relative bg-white p-4 border rounded-md">
                <p>{article.title}</p>
                {/* Dropdown Menu */}
                <button
                  className="absolute top-2 right-2"
                  onClick={() => setDropdownOpen(dropdownOpen === article.id ? null : article.id)}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {dropdownOpen === article.id && (
                  <div className="absolute right-2 top-8 bg-white border rounded shadow-md">
                    <button className="block w-full px-4 py-2 hover:bg-gray-200" onClick={() => alert("Edit clicked")}>
                      Edit
                    </button>
                    <button className="block w-full px-4 py-2 hover:bg-gray-200" onClick={() => alert("Delete clicked")}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Drafts Section */}
        <h2 className="font-semibold text-lg mb-2">My Drafts:</h2>
        <div className="grid grid-cols-3 gap-4">
          {filteredArticles
            .filter(article => article.type === "Draft")
            .map(article => (
              <div key={article.id} className="relative bg-white p-4 border rounded-md">
                <p>{article.title}</p>
                <p className="text-xs text-gray-500 mt-2">Expires: {article.expires}</p>
                {/* Dropdown Menu */}
                <button
                  className="absolute top-2 right-2"
                  onClick={() => setDropdownOpen(dropdownOpen === article.id ? null : article.id)}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {dropdownOpen === article.id && (
                  <div className="absolute right-2 top-8 bg-white border rounded shadow-md">
                    <button className="block w-full px-4 py-2 hover:bg-gray-200" onClick={() => alert("Edit clicked")}>
                      Edit
                    </button>
                    <button className="block w-full px-4 py-2 hover:bg-gray-200" onClick={() => alert("Delete clicked")}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ManageArticle;
