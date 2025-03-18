import { useState } from "react";

const ManageRooms = () => {
  const [publicRooms, setPublicRooms] = useState([
    { id: 1, name: "Lee Hsien Loong" },
  ]);
  const [privateRooms, setPrivateRooms] = useState([{ id: 2, name: "..." }]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    name: "",
    userLimit: "20",
    description: "",
    category: "",
    privacy: "public",
  });
  const [existingRoomNames, setExistingRoomNames] = useState([
    "Lee Hsien Loong",
  ]); // Prevent duplicate names

  // Open Create Form
  const openCreateForm = () => {
    setIsCreating(true);
    setEditingRoom(null);
    setNewRoom({
      name: "",
      userLimit: "20",
      description: "",
      category: "",
      privacy: "public",
    });
  };

  // Close Form
  const closeForm = () => {
    setIsCreating(false);
    setEditingRoom(null);
  };

  // Handle Create/Update Room
  const handleSaveRoom = () => {
    if (
      newRoom.name.trim() === "" ||
      existingRoomNames.includes(newRoom.name)
    ) {
      alert("Room name must be unique and not empty!");
      return;
    }

    const roomEntry = { id: Date.now(), name: newRoom.name };

    if (editingRoom) {
      if (editingRoom.privacy === "public") {
        setPublicRooms(
          publicRooms.map((room) =>
            room.id === editingRoom.id ? roomEntry : room
          )
        );
      } else {
        setPrivateRooms(
          privateRooms.map((room) =>
            room.id === editingRoom.id ? roomEntry : room
          )
        );
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

  // Handle Delete Room
  const handleDeleteRoom = (id, privacy) => {
    if (privacy === "public") {
      setPublicRooms(publicRooms.filter((room) => room.id !== id));
    } else {
      setPrivateRooms(privateRooms.filter((room) => room.id !== id));
    }
  };

  // Handle Edit Room
  const handleEditRoom = (room, privacy) => {
    setEditingRoom({ ...room, privacy });
    setNewRoom({ ...room, privacy });
    setIsCreating(true);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen font-grotesk p-10">
      <div className="w-full max-w-3xl bg-white p-10 rounded-2xl shadow-lg relative">
        {/* Create Room Button at the Top Right */}
        <button
          onClick={openCreateForm}
          className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        >
          Create Room
        </button>

        <h2 className="text-2xl font-semibold mb-4">Manage Interest Groups</h2>

        {/* Public Interest Groups */}
        <h3 className="text-lg font-bold mb-2">My Public Interest Groups:</h3>
        {publicRooms.map((room) => (
          <div key={room.id} className="flex items-center mb-2">
            <input
              type="text"
              value={room.name}
              readOnly
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleEditRoom(room, "public")}
              className="ml-2 px-3 py-1 bg-gray-700 text-white rounded-lg"
            >
              Update
            </button>
            <button
              onClick={() => handleDeleteRoom(room.id, "public")}
              className="ml-2 px-3 py-1 bg-gray-700 text-white rounded-lg"
            >
              Delete
            </button>
            <button className="ml-2 px-3 py-1 bg-gray-700 text-white rounded-lg">
              Exit
            </button>
          </div>
        ))}

        {/* Private Interest Groups */}
        <h3 className="text-lg font-bold mt-4 mb-2">
          My Private Interest Groups:
        </h3>
        {privateRooms.map((room) => (
          <div key={room.id} className="flex items-center mb-2">
            <input
              type="text"
              value={room.name}
              readOnly
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleEditRoom(room, "private")}
              className="ml-2 px-3 py-1 bg-gray-700 text-white rounded-lg"
            >
              Update
            </button>
            <button
              onClick={() => handleDeleteRoom(room.id, "private")}
              className="ml-2 px-3 py-1 bg-gray-700 text-white rounded-lg"
            >
              Delete
            </button>
            <button className="ml-2 px-3 py-1 bg-gray-700 text-white rounded-lg">
              Exit
            </button>
          </div>
        ))}
      </div>

      {/* Create Room Modal */}
      {isCreating && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-100">
          <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              {editingRoom ? "Edit Room" : "Create Room"}
            </h3>

            <input
              type="text"
              placeholder="Room Name (must be unique)"
              value={newRoom.name}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              className="w-full p-2 border rounded-lg mb-2"
            />

            <select
              value={newRoom.userLimit}
              onChange={(e) =>
                setNewRoom({ ...newRoom, userLimit: e.target.value })
              }
              className="w-full p-2 border rounded-lg mb-2"
            >
              <option value="20">20 Users</option>
              <option value="50">50 Users</option>
              <option value="100">100 Users</option>
            </select>

            <textarea
              placeholder="Room Description"
              value={newRoom.description}
              onChange={(e) =>
                setNewRoom({ ...newRoom, description: e.target.value })
              }
              className="w-full p-2 border rounded-lg mb-2 resize-none"
              rows="3"
            />

            {/* <input
              type="text"
              placeholder="Category"
              value={newRoom.category}
              onChange={(e) =>
                setNewRoom({ ...newRoom, category: e.target.value })
              }
              className="w-full p-2 border rounded-lg mb-2"
            /> */}
            <select
              value={newRoom.category}
              onChange={(e) =>
                setNewRoom({ ...newRoom, category: e.target.value })
              }
              className="w-full p-2 border rounded-lg mb-2"
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              value={newRoom.privacy}
              onChange={(e) =>
                setNewRoom({ ...newRoom, privacy: e.target.value })
              }
              className="w-full p-2 border rounded-lg mb-2"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <button
              onClick={handleSaveRoom}
              className="w-full p-2 mt-2 bg-blue-500 text-white rounded-lg"
            >
              {editingRoom ? "Update" : "Create"} Room
            </button>
            <button
              onClick={closeForm}
              className="w-full p-2 mt-2 bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
