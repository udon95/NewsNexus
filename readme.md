Ensure node.js is downloaded before 

`cd NewsNexus`

In NewsNexus folder

To start client side

`cd to client`

`run command "npm install"`

`then npm run dev` to start the localhost:5173
      
ensure new .jsx files are in pages folder
it is imported in App.jsx (e.g. import Register from "./pages/register.jsx";)
and the path is included (e.g. <Route path="register" element={<Register />} />)

in the new file (e.g. home.jsx) ensure that <Navbar/> is added before the main contents 
after setting the container for all the contents 

To start server side
Open a new terminal 
`cd to server `
and `use command "node server.js"`
