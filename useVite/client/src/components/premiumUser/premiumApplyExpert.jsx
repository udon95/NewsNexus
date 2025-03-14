import React, { useState } from "react";
import { Star } from "lucide-react"; // Using Lucide Icons for rating

const PremiumApplyExpert = () => {
  const [reason, setReason] = useState(""); // User input for reason
  const [rating, setRating] = useState(0); // User-selected rating
  const [submitted, setSubmitted] = useState(false); // Submission state

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim() || rating === 0) {
      alert("Please provide a reason and select a rating!");
      return;
    }
    setSubmitted(true); // Mark application as submitted
  };

  return (
    <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-indigo-50 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Apply to Be an Expert</h2>

        {submitted ? (
          <p className="text-green-600 text-lg font-semibold">
            ✅ Your application has been submitted! Awaiting review.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Reason Input */}
            <textarea
              className="w-full p-3 border rounded-md resize-none"
              placeholder="Why do you want to be an expert?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />

            {/* Star Rating Selection */}
            <div className="flex gap-2 text-yellow-500 text-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`cursor-pointer ${
                    rating >= star ? "fill-yellow-500" : "fill-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              Submit Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PremiumApplyExpert;