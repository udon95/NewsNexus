import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";

import Layout from  "./Layout.jsx";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout/>}>
        <Route path="/" element={<Login />} />
        <Route path="register" element={<Register />} />
        {/* <Route path="/header" element={<Test />} /> */}
        {/* <Route path="/layout" element={<Layout />} /> */}
    </Route>
    </Routes>
  );
}

export default App

// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import { User, Menu, X, LogIn, UserPlus } from 'lucide-react';
// import Login from './pages/login';
// import Register from './pages/test';
// import './assets/Logo.svg';

// function App() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   const navItems = [
//     { name: 'Home', path: '/' },
//     { name: 'Explore', path: '/explore' },
//     { name: 'Subscription', path: '/subscription' },
//     { name: 'Platform Guidelines', path: '/guidelines' },
//   ];

//   return (
//     <Router>
//       <div className="min-h-screen flex flex-col">
//         {/* Header */}
//         <header className="w-full bg-white shadow-md py-4">
//           <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-between px-6">
//             {/* Logo */}
//             <Link to="/">
//               <img
//                 loading="lazy"
//                 src= "./assets/Logo.svg"
//                 className="h-10 sm:h-12 w-auto cursor-pointer"
//                 alt="NewsNexus Logo"
//               />
//             </Link>
//             <div className="flex items-center space-x-4">
//               <Link to="/login" className="text-gray-600 hover:text-gray-900">
//                 Sign in
//               </Link>
//               <Link
//                 to="/register"
//                 className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
//               >
//                 Sign up
//               </Link>
//               {/* Mobile menu button */}
//               <button
//                 onClick={toggleMenu}
//                 className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
//               >
//                 {isMenuOpen ? (
//                   <X className="h-6 w-6" />
//                 ) : (
//                   <Menu className="h-6 w-6" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* Navigation */}
//         <nav className="w-full bg-blue-200 py-3 shadow-md">
//           {/* Desktop Navigation */}
//           <div className="hidden lg:block">
//             <div className="max-w-screen-lg mx-auto flex justify-center items-center text-lg text-blue-900">
//               {navItems.map((item, index) => (
//                 <React.Fragment key={item.path}>
//                   {index > 0 && <div className="w-px h-5 bg-blue-900 mx-4" />}
//                   <Link
//                     to={item.path}
//                     className="hover:underline px-4"
//                   >
//                     {item.name}
//                   </Link>
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>

//           {/* Mobile Navigation */}
//           <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
//             <div className="px-2 pt-2 pb-3 space-y-1">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   className="text-blue-900 hover:bg-blue-300 block px-3 py-2 rounded-md text-base font-medium"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   {item.name}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </nav>

//         {/* Main Content */}
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route
//             path="/"
//             element={
//               <main className="flex-1 bg-gray-50">
//                 <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
//                   <div className="bg-white rounded-lg shadow-sm p-8 text-center">
//                     <h1 className="text-4xl font-bold text-gray-900 mb-6">
//                       Welcome to NewsNexus
//                     </h1>
//                     <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
//                       Your gateway to curated news and stories. Join our community and discover what matters most to you.
//                     </p>
//                     <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
//                       <Link
//                         to="/login"
//                         className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
//                       >
//                         <LogIn className="h-5 w-5 mr-2" />
//                         Sign In
//                       </Link>
//                       <Link
//                         to="/register"
//                         className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
//                       >
//                         <UserPlus className="h-5 w-5 mr-2" />
//                         Create Account
//                       </Link>
//                     </div>
//                     <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
//                       <div className="p-6 bg-blue-50 rounded-lg">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Feed</h3>
//                         <p className="text-gray-600">Curated news and stories tailored to your interests.</p>
//                       </div>
//                       <div className="p-6 bg-blue-50 rounded-lg">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
//                         <p className="text-gray-600">Stay informed with the latest news as it happens.</p>
//                       </div>
//                       <div className="p-6 bg-blue-50 rounded-lg">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Insights</h3>
//                         <p className="text-gray-600">Engage with a community of informed readers and contributors.</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </main>
//             }
//           />
//         </Routes>

//         {/* Footer */}
//         <footer className="w-full bg-blue-300 py-4 text-center text-sm sm:text-lg text-blue-900 font-medium">
//           <div className="max-w-screen-lg mx-auto px-4">
//             <p>&copy; {new Date().getFullYear()} NewsNexus. All Rights Reserved.</p>
//             <a href="/privacy-policy" className="underline block mt-1">
//               Privacy Policy
//             </a>
//           </div>
//         </footer>
//       </div>
//     </Router>
//   );
// }

// export default App;