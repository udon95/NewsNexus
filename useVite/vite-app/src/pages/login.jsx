import React from "react";
// import "../assets/css/style.css"

// function LoginPage() {
//   return (
//     // <div className="flex flex-col pt-7 font-medium text-sky-900 bg-white">
//     <div className="w-full min-h-screen flex flex-col items-center bg-gray-100">

//       {/* Header Section */}
//       <header className="min-w-screen bg-white shadow-md py-4">
//         <div className="min-w-screen mx-auto flex items-center justify-between px-6">
//           {/* Logo */}
//           <img
//             loading="lazy"
//             src="https://cdn.builder.io/api/v1/image/assets/d76e7352317b403ebb532490cdf24dcd/c5efc9b2b8bfc42494e5d22b797c1171051a629d41b0ad8fae64abc6608efdab?apiKey=d76e7352317b403ebb532490cdf24dcd"
//             className="h-12 w-auto cursor-pointer"
//             alt="NewsNexus Logo"
//           />
//           {/* Profile Button */}
//           <button className="w-14 h-14 bg-blue-200 rounded-lg text-blue-900 font-bold border-2 border-blue-900 flex items-center justify-center shadow-md">
//             G
//           </button>
//         </div>
//       </header>

//       {/* Navigation Bar */}
//       <nav className="min-w-screen flex mt-10 bg-blue-200 py-3 shadow-md">
//         <div className=" min-w-screen mx-auto flex justify-center gap-6 text-lg text-blue-900">
//           <a href="/" className="hover:underline">
//             Home
//           </a>
//           <span>|</span>
//           <a href="/explore" className="hover:underline">
//             Explore
//           </a>
//           <span>|</span>
//           <a href="/subscription" className="hover:underline">
//             Subscription
//           </a>
//           <span>|</span>
//           <a href="/guidelines" className="hover:underline">
//             Platform Guidelines
//           </a>
//         </div>
//       </nav>

//       {/* Login Section */}
//       <main className="flex flex-col items-center justify-center flex-grow w-full px-6">
//         <div className="w-full max-w-200 max-h-400 mx-auto bg-white p-8 shadow-lg rounded-lg">
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
//             Login
//           </h2>
//           <form className="space-y-6">
//             {/* Username Field */}
//             <div className="form-group">
//               <label
//                 htmlFor="username"
//                 className="block text-lg font-medium text-gray-700"
//               >
//                 Username:{" "}
//               </label>
//               <input
//                 id="username"
//                 type="text"
//                 className="form-input w-full max-w-md p-3 border rounded-lg bg-gray-800 focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter your username"
//               />
//             </div>
//             {/* Email Field */}
//             <div className="form-group">
//               <label
//                 htmlFor="email"
//                 className="block text-lg font-medium text-gray-700"
//               >
//                 Password:
//               </label>
//               <input
//                 id="password"
//                 type="password"
//                 className="form-input w-full max-w-md p-3 border rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter your password"
//               />
//             </div>
//             {/* Buttons */}
//             <div className="flex gap-4 self-end mt-11 ml-11 mb-11 max-w-full text-xl text-indigo-50 whitespace-nowrap w-[189px] max-md:mt-10">
//               <button
//                 type="button"
//                 className="gap-2.5 py-2.5 pr-2.5 pl-3 rounded-2xl backdrop-blur-[2px] bg-zinc-700 min-h-[43px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] w-[100%]"
//               >
//                 Forgot
//               </button>
//               <button
//                 type="submit"
//                 className="gap-2.5 p-2.5 rounded-2xl backdrop-blur-[2px] bg-zinc-700 min-h-[43px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] w-[100%]"
//               >
//                 Submit
//               </button>
//             </div>
//           </form>
//         </div>
//       </main>

//       {/* Footer Section */}
//       <footer className="w-full bg-blue-300 py-4 text-center text-lg text-blue-900 font-medium mt-10">
//         <div className="max-w-screen-lg mx-auto px-4">
//           <p>&copy; 2025 NewsNexus. All Rights Reserved.</p>
//           <a href="/privacy-policy" className="underline block mt-1">
//             Privacy Policy
//           </a>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default LoginPage;

function LoginPage() {
  return (
    <div className="w-full min-w-screen min-h-screen flex flex-col bg-gray-100">
      {/* Header Section */}
      <header className="w-full bg-white shadow-md py-4">
        <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-between px-6">
          {/* Logo */}
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/d76e7352317b403ebb532490cdf24dcd/c5efc9b2b8bfc42494e5d22b797c1171051a629d41b0ad8fae64abc6608efdab?apiKey=d76e7352317b403ebb532490cdf24dcd"
            className="h-10 sm:h-12 w-auto cursor-pointer"
            alt="NewsNexus Logo"
          />
          {/* Profile Button */}
          <button className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-200 rounded-lg text-blue-900 font-bold border-2 border-blue-900 flex items-center justify-center shadow-md">
            G
          </button>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="w-full bg-blue-200 py-3 shadow-md">
  <div className="max-w-screen-lg mx-auto flex flex-wrap justify-center items-center text-sm sm:text-lg text-blue-900">
  <div className="w-px h-5 bg-blue-900"></div>  {/* Divider */}
    <a href="/" className="hover:underline px-4 sm:px-6">Home</a>
    <div className="w-px h-5 bg-blue-900"></div>  {/* Divider */}
    <a href="/explore" className="hover:underline px-4 sm:px-6">Explore</a>
    <div className="w-px h-5 bg-blue-900"></div>  {/* Divider */}
    <a href="/subscription" className="hover:underline px-4 sm:px-6">Subscription</a>
    <div className="w-px h-5 bg-blue-900"></div>  {/* Divider */}
    <a href="/guidelines" className="hover:underline px-4 sm:px-6">Platform Guidelines</a>
    <div className="w-px h-5 bg-blue-900"></div>  {/* Divider */}
  </div>
</nav>


      {/* Login Section */}
      <main className="flex flex-col items-center justify-center flex-grow w-full bg-white px-4 sm:px-6">
        <section className="flex w-[30rem] flex-col rounded-lg">
          <h2 className="text-5xl sm:text-3xl font-bold text-left text-black mb-6">Login</h2>
          <form className="space-y-4 sm:space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm sm:text-lg font-medium text-gray-700">Username:</label>
              <input
                id="username"
                type="text"
                className="w-full p-2 sm:p-3 border rounded-lg bg-blue-100 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
              />
            </div>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm sm:text-lg font-medium text-gray-700">E-mail:</label>
              <input
                id="email"
                type="email"
                className="w-full p-2 sm:p-3 border rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4 sm:mt-6">
            <button className="w-full sm:w-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Register
              </button>
              <button className="w-full sm:w-1/2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800">
                Forgot
              </button>
              <button className="w-full sm:w-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Submit
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="w-full bg-blue-300 py-4 text-center text-sm sm:text-lg text-blue-900 font-medium mt-10">
        <div className="max-w-screen-lg mx-auto px-4">
          <p>&copy; 2025 NewsNexus. All Rights Reserved.</p>
          <a href="/privacy-policy" className="underline block mt-1">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;
