import { useState, useEffect } from "react";
import supabase from "../../api/supabaseClient";

const ManageRooms = () => {
  const [publicRooms, setPublicRooms] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [invites, setInvites] = useState([]);
  const [newPublicRoom, setNewPublicRoom] = useState({
    name: "",
    description: "",
    member_limit: 20,
  });
  const [newPrivateRoom, setNewPrivateRoom] = useState({
    name: "",
    description: "",
    invite: "",
    member_limit: 20,
  });
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState({
    roomid: null,
    name: "",
    description: "",
    room_type: "Public",
  });

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userId = userProfile?.user?.userid;

  const fetchRooms = async () => {
    const res = await fetch(
      `https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/${userId}`
    );
    const data = await res.json();
    setPublicRooms(data.filter((room) => room.room_type === "Public"));
    setPrivateRooms(data.filter((room) => room.room_type === "Private"));
  };

  const fetchInvites = async () => {
    const { data, error } = await supabase
      .from("room_invites")
      .select("roomid, rooms(name)")
      .eq("userid", userId);
  
    if (!error) {
      const formatted = data.map((item, i) => ({
        id: item.roomid,
        name: item.rooms?.name || `Room ${i + 1}`,
      }));
      setInvites(formatted);
    }
  };  

  useEffect(() => {
    fetchRooms();
    fetchInvites();
  }, [userId]);

  const handleAddPublicRoom = async () => {
    const res = await fetch(
      "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPublicRoom,
          room_type: "Public",
          created_by: userId,
        }),
      }
    );

    if (res.ok) {
      alert("Public room created");
      setNewPublicRoom({ name: "", description: "", member_limit: 20 });
      fetchRooms();
    }
  };

  const handleAddPrivateRoom = async () => {
    const res = await fetch(
      "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPrivateRoom,
          room_type: "Private",
          created_by: userId,
        }),
      }
    );

    if (res.ok) {
      alert("Private room created");
      const roomData = await res.json();
      const roomid = roomData.data[0].roomid;

      const usernames = newPrivateRoom.invite
        .split(",")
        .map((s) => s.replace("@", "").trim())
        .filter(Boolean);

      if (usernames.length > 10) {
        alert("You can only invite up to 10 users to a private room.");
        return;
      }

      for (let username of usernames) {
        await fetch(
          "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/invite",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              invitee_username: username,
              roomid,
            }),
          }
        );
      }

      setNewPrivateRoom({ name: "", description: "", invite: "", member_limit: 20 });
      fetchRooms();
    }
  };

  const handleUpdateRoom = (roomid, currentName, currentDescription, currentRoomType) => {
    setEditRoom({
      roomid,
      name: currentName,
      description: currentDescription,
      room_type: currentRoomType,
    });
    setShowModal(true);
  };
  
  const submitRoomUpdate = async () => {
    const { roomid, name, description, room_type } = editRoom;
  
    await fetch(
      `https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/${roomid}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, room_type }),
      }
    );
  
    setShowModal(false);
    fetchRooms();
  };

  const handleDeleteRoom = async (roomid) => {
    await fetch(
      `https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/${roomid}`,
      {
        method: "DELETE",
      }
    );
    fetchRooms();
  };

  const handleAcceptInvite = async (roomid) => {
    await fetch(
      "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/accept",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId, roomid }),
      }
    );
    alert("Joined room");
    fetchInvites();
  };

  const handleDeclineInvite = async (roomid) => {
    await fetch(
      "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/decline",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId, roomid }),
      }
    );
    alert("Invitation declined");
    fetchInvites();
  };  

  const rowStyle = "flex justify-between items-center mb-2";
  const buttonClass =
    "bg-gray-800 text-white px-4 py-2 rounded-md text-base hover:brightness-110";

  return (
    <div className="flex min-h-screen text-base">
      <div className="flex-1 p-10 bg-[#eef2fc] space-y-8">
        {/* Public Rooms */}
        <section>
          <h2 className="font-bold text-xl mb-2">My Public Discussion Rooms :</h2>
          <div className="flex gap-2 items-center mb-2">
            <label>New:</label>
            <input placeholder="Name" value={newPublicRoom.name}
              onChange={e => setNewPublicRoom({ ...newPublicRoom, name: e.target.value })}
              className="w-1/4 px-3 py-2 border rounded-md text-base" />
            <input placeholder="Description" value={newPublicRoom.description}
              onChange={e => setNewPublicRoom({ ...newPublicRoom, description: e.target.value })}
              className="w-2/3 px-3 py-2 border rounded-md text-base" />
            <select
              value={newPublicRoom.member_limit}
              onChange={(e) =>
                setNewPublicRoom({ ...newPublicRoom, member_limit: parseInt(e.target.value) })
              }
              className="px-3 py-2 border rounded-md text-base"
            >
              <option value={20}>Limit: 20</option>
              <option value={50}>Limit: 50</option>
              <option value={100}>Limit: 100</option>
            </select>
            <button onClick={handleAddPublicRoom} className="bg-black text-white px-4 py-2 rounded text-base">+</button>
          </div>
          <div className="bg-white p-4 rounded-xl shadow space-y-2">
            {publicRooms.map((room, index) => (
              <div key={room.roomid} className={rowStyle}>
                <span>{index + 1}. {room.name}</span>
                <div className="flex gap-2">
                  <span className="mt-2">{room.member_count} members</span>
                  <button onClick={() => handleUpdateRoom(room.roomid, room.name, room.description, room.room_type)} className={buttonClass}>Update</button>
                  <button onClick={() => handleDeleteRoom(room.roomid)} className={buttonClass}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Private Rooms */}
        <section>
          <h2 className="font-bold text-xl mb-2">My Private Discussion Rooms :</h2>
          <div className="flex gap-2 items-center mb-2">
            <label>New:</label>
            <input placeholder="Name" value={newPrivateRoom.name}
              onChange={e => setNewPrivateRoom({ ...newPrivateRoom, name: e.target.value })}
              className="w-1/4 px-3 py-2 border rounded-md text-base" />
            <input placeholder="Description" value={newPrivateRoom.description}
              onChange={e => setNewPrivateRoom({ ...newPrivateRoom, description: e.target.value })}
              className="w-2/3 px-3 py-2 border rounded-md text-base" />
            <select
              value={newPrivateRoom.member_limit}
              onChange={(e) =>
                setNewPrivateRoom({ ...newPrivateRoom, member_limit: parseInt(e.target.value) })
              }
              className="px-3 py-2 border rounded-md text-base"
            >
              <option value={20}>Limit: 20</option>
              <option value={50}>Limit: 50</option>
              <option value={100}>Limit: 100</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <label>Invite:</label>
            <input placeholder="@user1, @user2 (max 10)" value={newPrivateRoom.invite}
              onChange={e => setNewPrivateRoom({ ...newPrivateRoom, invite: e.target.value })}
              className="w-full px-3 py-2 border rounded-md text-base" />
            <button onClick={handleAddPrivateRoom} className="bg-black text-white px-4 py-2 rounded text-base">+</button>
          </div>
          <div className="bg-white p-4 rounded-xl shadow space-y-2">
            {privateRooms.map((room, index) => (
              <div key={room.roomid} className={rowStyle}>
                <span>{index + 1}. {room.name}</span>
                <div className="flex gap-2">
                  <span className="mt-2">{room.member_count} members</span>
                  <button onClick={() => handleUpdateRoom(room.roomid, room.name, room.description, room.room_type)} className={buttonClass}>Update</button>
                  <button onClick={() => handleDeleteRoom(room.roomid)} className={buttonClass}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
              <h2 className="text-xl font-semibold">Update Room</h2>
        
              <div>
                <label className="block text-sm font-medium mb-1">Room Name</label>
                <input
                  value={editRoom.name}
                  onChange={(e) => setEditRoom({ ...editRoom, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
        
              <div>
                <label className="block text-sm font-medium mb-1">Room Description</label>
                <input
                  value={editRoom.description}
                  onChange={(e) => setEditRoom({ ...editRoom, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
        
              <div>
                <label className="block text-sm font-medium mb-1">Room Type</label>
                <select
                  value={editRoom.room_type}
                  onChange={(e) => setEditRoom({ ...editRoom, room_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
        
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRoomUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invites */}
        <section>
          <h2 className="font-bold text-xl mb-2">My Private Discussion Room Invites :</h2>
          <div className="bg-white p-4 rounded-xl shadow space-y-2">
            {invites.map((invite, index) => (
              <div key={invite.id} className={rowStyle}>
                <span>{index + 1}. {invite.name}</span>
                <button onClick={() => handleAcceptInvite(invite.id)} className={buttonClass}>Accept</button>
                <button onClick={() => handleDeclineInvite(invite.id)} className={buttonClass}>Decline</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManageRooms;

