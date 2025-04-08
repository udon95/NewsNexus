import React, { useState } from 'react';

const FactCheck = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    const response = await fetch('http://localhost:5000/api/factcheck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userText: inputText })
    });

    const data = await response.json();
    setResult(data.result);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <textarea
        className="w-full p-2 border"
        rows={5}
        placeholder="Paste user content to fact-check..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white"
        onClick={handleCheck}
        disabled={loading}
      >
        {loading ? "Checking..." : "Fact Check"}
      </button>
      {result && (
        <div className="mt-4 p-2 bg-gray-100 border rounded">
          <strong>Fact Check Result:</strong>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
};

export default FactCheck;
