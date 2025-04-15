"use client";

import { useState, useEffect } from "react";
import supabase from "../api/supabaseClient";

const ManageRooms = () => {
  const [publicRooms, setPublicRooms] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    name: "",
    userLimit: "20",
    description: "",
    category: "",
    privacy: "public",
  });
  const [existingRoomNames, setExistingRoomNames] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase.from("rooms").select("*");
    if (error) {
      console.error("Error fetching rooms:", error);
      return;
    }
    const publicRooms = data.filter((r) => r.privacy === "public");
    const privateRooms = data.filter((r) => r.privacy === "private");
    setPublicRooms(publicRooms);
    setPrivateRooms(privateRooms);
    setExistingRoomNames(data.map((r) => r.name));
  };

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

  const closeForm = () => {
    setIsCreating(false);
    setEditingRoom(null);
  };

  const handleSaveRoom = async () => {
    if (
      newRoom.name.trim() === "" ||
      (!editingRoom && existingRoomNames.includes(newRoom.name))
    ) {
      alert("The group name cannot be empty and must be unique!");
      return;
    }

    try {
      if (editingRoom) {
        const { error } = await supabase
          .from("rooms")
          .update(newRoom)
          .eq("id", editingRoom.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rooms").insert([newRoom]);
        if (error) throw error;
      }
      await fetchRooms();
      closeForm();
    } catch (error) {
      console.error("SaveError", error);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
      await fetchRooms();
    } catch (error) {
      console.error("deleteError", error);
    }
  };

  const handleEditRoom = (room, privacy) => {
    setEditingRoom({ ...room, privacy });
    setNewRoom({ ...room, privacy });
    setIsCreating(true);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-blue-100 p-10">
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-lg relative">
        {/* Title & Create Room Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Manage Interest Groups</h2>
          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Room
          </button>
        </div>

        {/* Public Rooms */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-2">
            My Public Interest Groups:
          </h3>
          {publicRooms.length > 0 ? (
            publicRooms.map((room) => (
              <div key={room.id} className="flex items-center mb-2">
                <span className="flex-grow">{room.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditRoom(room, "public")}
                    className="px-3 py-1 text-xs bg-gray-700 text-white rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="px-3 py-1 text-xs bg-gray-700 text-white rounded"
                  >
                    Delete
                  </button>
                  <button className="px-3 py-1 text-xs bg-gray-700 text-white rounded">Exit</button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">-</div>
          )}
        </div>

        {/* Private Rooms */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-2">
            My Private Interest Groups:
          </h3>
          {privateRooms.length > 0 ? (
            privateRooms.map((room) => (
              <div key={room.id} className="flex items-center mb-2">
                <span className="flex-grow">{room.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditRoom(room, "private")}
                    className="px-3 py-1 text-xs bg-gray-700 text-white rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="px-3 py-1 text-xs bg-gray-700 text-white rounded"
                  >
                    Delete
                  </button>
                  <button className="px-3 py-1 text-xs bg-gray-700 text-white rounded">Exit</button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">-</div>
          )}
        </div>

        {/* Groups Joined */}
        <div>
          <h3 className="text-base font-medium mb-2">Groups I've Joined:</h3>
          {publicRooms.concat(privateRooms).length > 0 ? (
            publicRooms.concat(privateRooms).map((room) => (
              <div key={room.id} className="flex items-center mb-2">
                <span className="flex-grow">{room.name}</span>
                <span className="text-xs text-gray-500">
                  {room.privacy === "private" ? "Private" : "Public"}
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-500">-</div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {isCreating && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-6">
              {editingRoom ? "Edit Room" : "Create Room"}
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Room Name (must be unique)"
                value={newRoom.name}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, name: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700"
              />

              <select
                value={newRoom.userLimit}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, userLimit: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700"
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
                className="w-full p-3 border border-gray-300 rounded-lg resize-none text-gray-700"
                rows="4"
              />

              <input
                type="text"
                placeholder="Category"
                value={newRoom.category}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, category: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700"
              />

              <select
                value={newRoom.privacy}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, privacy: e.target.value })
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-gray-700"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>

              <button
                onClick={handleSaveRoom}
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingRoom ? "Update Room" : "Create Room"}
              </button>

              <button
                onClick={closeForm}
                className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
