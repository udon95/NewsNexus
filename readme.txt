In useVite folder 

cd to vite-app 

run npm install 

then npm run dev

ensure new jsx files are in pages folder
it is imported in App.jsx (e.g. import Register from "./pages/register.jsx";)
and the path is included (e.g. <Route path="register" element={<Register />} />)

in the new file (e.g. home.jsx) ensure that <Navbar/> is added before the main contents 
after setting the container for all the contents 
