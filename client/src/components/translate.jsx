import React, { useState, useRef } from "react";
import { Languages } from "lucide-react";

const TranslateButton = ({ onLanguageSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLanguageSelect = (language) => {
    // Call your translate logic here
    console.log("Translating to:", language);
    onLanguageSelect(language);
    setShowDropdown(false); // Hide the dropdown once language is selected
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* This is your main button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          background: "#F1F1F1",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Languages className="h-5 w-5 text-black" />
      </button>

      {showDropdown && (
        <ul
          style={{
            position: "absolute",
            top: "110%", // slightly below the button
            left: "0",
            background: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            borderRadius: "4px",
            margin: 0,
            padding: "8px 0",
            listStyle: "none",
            minWidth: "120px",
            zIndex: 10,
          }}
        >
          <li
            style={dropdownItemStyle}
            onClick={() => handleLanguageSelect("zh")}
          >
            Simplified Chinese
          </li>

          <li
            style={dropdownItemStyle}
            onClick={() => handleLanguageSelect("ms")}
          >
            Malay
          </li>
          <li
            style={dropdownItemStyle}
            onClick={() => handleLanguageSelect("ta")}
          >
            Tamil
          </li>
          <li
            style={dropdownItemStyle}
            onClick={() => handleLanguageSelect("en")}
          >
            English
          </li>
          <li
            style={{ ...dropdownItemStyle, color: "red" }}
            onClick={() => setShowDropdown(false)}
          >
            Cancel
          </li>
        </ul>
      )}
    </div>
  );
};

// Just an example style object for reusability
const dropdownItemStyle = {
  padding: "6px 12px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export default TranslateButton;
