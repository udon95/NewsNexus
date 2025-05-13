import React, { useState } from "react";
import supabase from "../../api/supabaseClient";

export const PremiumSubmitTest = () => {
  const [areas, setAreas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState({});

  const feedbackQuestions = [
    { text: "How well designed is the UI ?", column: "design" },
    { text: "How accurate is the AI fact-checking ?", column: "factcheck" },
    { text: "How accessible is the news site for those who are site impaired or have language barriers ?", column: "accessible" },
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
    // if (!allAnswered || areas.trim() === "") {
      if (!allAnswered) {
      alert("Please fill in all required fields.");
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
    // <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">
    //   <main className="w-full max-w-4xl p-10 max-md:flex-col gap-6">       
    //     <div className="flex flex-col w-full">
    //       <label className="text-3xl font-bold mb-1">
    //         Share Your Experience :
    //       </label>

    //       <ul className="mb-4 relative">
    //         {feedbackQuestions.map((question) => (
    //           <div key={question.column} className="p-2">
    //             <li className="list-disc text-2xl font-bold ml-4 mb-1">
    //               {question.text}
    //             </li>
    //             <div className="flex flex-wrap justify-center gap-4 p-2">
    //               <label className="text-xl font-bold">Bad</label>
    //               {[...Array(10)].map((_, i) => {
    //                 const value = i + 1;
    //                 return (
    //                   <button
    //                     key={`${question.column}-${value}`}
    //                     className={`text-xl rounded-lg px-3 py-1 ${
    //                       answers[question.column] === value
    //                         ? "bg-gray-200"
    //                         : "bg-black text-white"
    //                     }`}
    //                     onClick={() => handleAnswer(feedbackQuestions.indexOf(question), value)}
    //                   >
    //                     {value}
    //                   </button>
    //                 );
    //               })}
    //               <label className="text-xl font-bold">Good</label>
    //             </div>
    //           </div>
    //         ))}
    //       </ul>
     
    //       <div className="mb-4 relative">
    //         <label className="text-2xl font-semibold">
    //           Areas of Improvement :
    //         </label>
    //         <textarea
    //           id="Textarea1"
    //           value={areas}
    //           onChange={(e) => setAreas(e.target.value)}
    //           className="flex w-full h-40 p-2 border rounded-lg shadow-sm bg-white mt-2"
    //         ></textarea>               
    //       </div>

    //       <div className="flex justify-end gap-2">
    //         <button 
    //           className="px-4 py-2 text-lg text-white bg-black rounded-lg shadow-md disabled:opacity-50 disabled:pointer-events-none"
    //           onClick={handleSubmitTest}
    //           disabled={isLoading}
    //         >
    //           {isLoading ? "Submitting..." : "Submit"}
    //         </button>
    //       </div>
    //     </div>
    //   </main>
    // </div>

    //DEVI'S IMPROVED VERSION
    <div className="w-full min-h-screen bg-indigo-50 text-black font-grotesk flex justify-center">

    <main className="w-full max-w-5xl px-12 py-10 bg-white rounded-xl shadow-md mx-auto mt-8 mb-8">
    <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
      Share Your Experience
    </h1>

    {/* <div className="space-y-6"> */}
    <div className="space-y-8">
      {feedbackQuestions.map((question, idx) => (
        <div key={question.column} className="bg-gray-50 rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4">{question.text}</h2>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-sm text-gray-500">Poor</span>
          <div className="flex gap-1 flex-wrap justify-center flex-1">
            {[...Array(10)].map((_, i) => {
              const value = i + 1;
              const isSelected = answers[question.column] === value;
              return (
                <button
                  key={`${question.column}-${value}`}
                  // className={`w-8 h-8 text-sm rounded-md border transition ${
                    className={`w-10 h-10 text-base font-semibold rounded-md border transition ${
                      isSelected
                      ? "bg-indigo-600 text-white border-indigo-600"
                      // : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                      : "bg-black text-white border-gray-300 hover:bg-gray-200"
                  }`}
                  onClick={() => handleAnswer(idx, value)}
                >
                  {value}
                </button>
              );
            })}
          </div>
          <span className="text-sm text-gray-500">Excellent</span>
        </div>
        </div>
      ))}

      {/* <div className="bg-white rounded-lg shadow-sm p-4"> */}
      <div className="bg-gray-50 rounded-xl shadow p-6">
      <label className="block text-base font-semibold mb-1">
          Areas of Improvement <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          value={areas}
          onChange={(e) => setAreas(e.target.value)}
          className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none transition text-base"
          placeholder="Let us know what we could improve..."
        />
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmitTest}
          disabled={isLoading}
          className="bg-black hover:bg-gray-800 text-white text-base font-semibold px-6 py-2 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  </main>

  </div>

  );
};

export default PremiumSubmitTest;
