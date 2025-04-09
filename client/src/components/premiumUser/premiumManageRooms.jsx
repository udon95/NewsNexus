import { useState } from "react";
 
 const ManageRooms = () => {
   const [publicRooms, setPublicRooms] = useState([{ id: 1, name: "Lee Hsien Long", privacy: "public" }]);
   const [privateRooms, setPrivateRooms] = useState([{ id: 2, name: "...", privacy: "private" }]);
   const [isCreating, setIsCreating] = useState(false);
   const [editingRoom, setEditingRoom] = useState(null);
   const [newRoom, setNewRoom] = useState({
     name: "",
     userLimit: "20",
     description: "",
     category: "",
     privacy: "public",
   });
   const [existingRoomNames, setExistingRoomNames] = useState(["Lee Hsien Long"]);
 
   const openCreateForm = () => {
     setIsCreating(true);
     setEditingRoom(null);
     setNewRoom({ name: "", userLimit: "20", description: "", category: "", privacy: "public" });
   };
 
   const closeForm = () => {
     setIsCreating(false);
     setEditingRoom(null);
   };
 
   const handleSaveRoom = () => {
     if (newRoom.name.trim() === "" || existingRoomNames.includes(newRoom.name)) {
       alert("Room name must be unique and not empty!");
       return;
     }
 
     const roomEntry = { id: Date.now(), name: newRoom.name, privacy: newRoom.privacy };
 
     if (editingRoom) {
       if (editingRoom.privacy === "public") {
         setPublicRooms(publicRooms.map((room) => (room.id === editingRoom.id ? roomEntry : room)));
       } else {
         setPrivateRooms(privateRooms.map((room) => (room.id === editingRoom.id ? roomEntry : room)));
       }
     } else {
       if (newRoom.privacy === "public") {
         setPublicRooms([...publicRooms, roomEntry]);
       } else {
         setPrivateRooms([...privateRooms, roomEntry]);
       }
       setExistingRoomNames([...existingRoomNames, newRoom.name]);
     }
 
     closeForm();
   };
 
   const handleDeleteRoom = (id, privacy) => {
     if (privacy === "public") {
       setPublicRooms(publicRooms.filter((room) => room.id !== id));
     } else {
       setPrivateRooms(privateRooms.filter((room) => room.id !== id));
     }
   };
 
   const handleEditRoom = (room, privacy) => {
     setEditingRoom({ ...room, privacy });
     setNewRoom({ ...room, privacy });
     setIsCreating(true);
   };
 
   return (
     <div className="relative flex flex-col items-center justify-center min-h-screen bg-blue-100 p-10">
       <div className="w-full max-w-3xl bg-white p-10 rounded-2xl shadow-lg relative">
 
         {/* Title & Create Room Button */}
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-semibold">Manage Interest Groups</h2>
           <button
             onClick={openCreateForm}
             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
           >
             Create Room
           </button>
         </div>
 
         {/* Public Interest Groups */}
         <h3 className="text-lg font-bold mb-2">My Public Interest Groups:</h3>
         {publicRooms.map((room) => (
           <div key={room.id} className="flex items-center mb-2 gap-2">
             <input
               type="text"
               value={room.name}
               readOnly
               className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg bg-white"
             />
             <button onClick={() => handleEditRoom(room, "public")} className="h-10 px-4 text-sm bg-gray-700 text-white rounded-lg">Update</button>
             <button onClick={() => handleDeleteRoom(room.id, "public")} className="h-10 px-4 text-sm bg-gray-700 text-white rounded-lg">Delete</button>
             <button className="h-10 px-4 text-sm bg-gray-700 text-white rounded-lg">Exit</button>
           </div>
         ))}
 
         {/* Private Interest Groups */}
         <h3 className="text-lg font-bold mt-4 mb-2">My Private Interest Groups:</h3>
         {privateRooms.map((room) => (
           <div key={room.id} className="flex items-center mb-2 gap-2">
             <input
               type="text"
               value={room.name}
               readOnly
               className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg bg-white"
             />
             <button onClick={() => handleEditRoom(room, "private")} className="h-10 px-4 text-sm bg-gray-700 text-white rounded-lg">Update</button>
             <button onClick={() => handleDeleteRoom(room.id, "private")} className="h-10 px-4 text-sm bg-gray-700 text-white rounded-lg">Delete</button>
             <button className="h-10 px-4 text-sm bg-gray-700 text-white rounded-lg">Exit</button>
           </div>
         ))}
 
         {/* Groups I've Joined */}
         <h3 className="text-lg font-bold mt-6 mb-2">Groups I've Joined:</h3>
         {publicRooms.concat(privateRooms).map((room) => (
           <div key={room.id} className="flex items-center mb-2 gap-2">
             <input
               type="text"
               value={room.name}
               readOnly
               className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg bg-gray-100"
             />
             <span className="text-sm italic text-gray-500">
               {room.privacy === "private" ? "Private" : "Public"}
             </span>
           </div>
         ))}
       </div>
 
       {/* Create Room Modal */}
       {isCreating && (
         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
           <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
             <h3 className="text-xl font-bold mb-4">{editingRoom ? "Edit Room" : "Create Room"}</h3>
 
             <input
               type="text"
               placeholder="Room Name (must be unique)"
               value={newRoom.name}
               onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
               className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg mb-2"
             />
 
             <select
               value={newRoom.userLimit}
               onChange={(e) => setNewRoom({ ...newRoom, userLimit: e.target.value })}
               className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg mb-2"
             >
               <option value="20">20 Users</option>
               <option value="50">50 Users</option>
               <option value="100">100 Users</option>
             </select>
 
             <textarea
               placeholder="Room Description"
               value={newRoom.description}
               onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
               className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg resize-none mb-2"
               rows="3"
             />
 
             <input
               type="text"
               placeholder="Category"
               value={newRoom.category}
               onChange={(e) => setNewRoom({ ...newRoom, category: e.target.value })}
               className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg mb-2"
             />
 
             <select
               value={newRoom.privacy}
               onChange={(e) => setNewRoom({ ...newRoom, privacy: e.target.value })}
               className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg mb-2"
             >
               <option value="public">Public</option>
               <option value="private"> Private</option>
             </select>
 
             <button onClick={handleSaveRoom} className="w-full p-2 mt-2 bg-blue-500 text-white rounded-lg">
               {editingRoom ? "Update" : "Create"} Room
             </button>
             <button onClick={closeForm} className="w-full p-2 mt-2 bg-gray-500 text-white rounded-lg">Cancel</button>
           </div>
         </div>
       )}
     </div>
   );
 };
 
 export default ManageRooms;