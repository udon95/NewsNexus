import React, { useState } from "react";
import supabase from "../../api/supabaseClient";

export const FreeSubmitTest = () => {
  const [areas, setAreas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState({});

  const feedbackQuestions = [
    { text: "How well designed is the UI ?", column: "design" },
    { text: "How is the content safety in the news site ?", column: "safety" },
    { text: "How reasonably priced is the news subscription ?", column: "price" },
    { text: "Do you think NewsNexus has good news coverage and well curated news ?", column: "news" }
  ];

  const handleAnswer = (Num, value) => {
    const columnKey = feedbackQuestions[Num].column;
    setAnswers(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  const handleSubmitTest = async () => {
    const storedUser = localStorage.getItem("userProfile");
    if (!storedUser) {
      alert("User not authenticated. Cannot upload.");
      return;
    }
  
    const parsedUser = JSON.parse(storedUser);
    const session = parsedUser?.user;
  
    if (!session) {
      alert("User not authenticated. Cannot upload.");
      return;
    }
  
    const allAnswered = feedbackQuestions.every(q => answers[q.column]);
    if (!allAnswered) {
      alert("Please rate all questions before submitting.");
      return;
    }
    
    setIsLoading(true);
    const dataToInsert = {
      userid: session.userid,
      areas_to_improve: areas,
    };
    
    feedbackQuestions.forEach((q) => {
      dataToInsert[q.column] = answers[q.column];
    });
    
    const { error } = await supabase.from("testimonial").insert([dataToInsert]);
    setIsLoading(false);
  
    if (error) {
      alert("Something went wrong. Try again.");
      return;
    }
  
    alert("Testimonial submitted successfully!");
    setAreas("");
    setAnswers({});
  };  

  return (
    <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">
      <main className="w-full max-w-4xl p-10 max-md:flex-col gap-6">       
        <div className="flex flex-col w-full">
          <label className="text-3xl font-bold mb-1">
            Share Your Experience :
          </label>

          <ul className="mb-4 relative">
            {feedbackQuestions.map((question) => (
              <div key={question.column} className="p-2">
                <li className="list-disc text-2xl font-bold ml-4 mb-1">
                  {question.text}
                </li>
                <div className="flex flex-wrap justify-center gap-4 p-2">
                  <label className="text-xl font-bold">Bad</label>
                  {[...Array(10)].map((_, i) => {
                    const value = i + 1;
                    return (
                      <button
                        key={`${question.column}-${value}`}
                        className={`text-xl rounded-lg px-3 py-1 ${
                          answers[question.column] === value
                            ? "bg-gray-200"
                            : "bg-black text-white"
                        }`}
                        onClick={() => handleAnswer(feedbackQuestions.indexOf(question), value)}
                      >
                        {value}
                      </button>
                    );
                  })}
                  <label className="text-xl font-bold">Good</label>
                </div>
              </div>
            ))}
          </ul>
     
          <div className="mb-4 relative">
            <label className="text-2xl font-semibold">
              Areas of Improvement :
            </label>
            <textarea
              id="Textarea1"
              value={areas}
              onChange={(e) => setAreas(e.target.value)}
              className="flex w-full h-40 p-2 border rounded-lg shadow-sm bg-white mt-2"
            ></textarea>               
          </div>

          <div className="flex justify-end gap-2">
            <button 
              className="px-4 py-2 text-lg text-white bg-black rounded-lg shadow-md disabled:opacity-50 disabled:pointer-events-none"
              onClick={handleSubmitTest}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FreeSubmitTest;
