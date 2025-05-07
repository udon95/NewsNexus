// 文件路径：pages/premiumManageRooms.jsx
import { useState, useEffect } from "react";
import supabase from "../../api/supabaseClient";

const PremiumManageRooms = () => {
  const [publicRooms, setPublicRooms] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [invites, setInvites] = useState([]);
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    room_type: "Public",
    invite: "",
    member_limit: 20,
  });
  const [editRoom, setEditRoom] = useState(null);

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userId = userProfile?.user?.userid;

  const fetchRooms = async () => {
    const res = await fetch(`https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/${userId}`);
    const data = await res.json();
    setPublicRooms(data.filter(r => r.room_type === "Public"));
    setPrivateRooms(data.filter(r => r.room_type === "Private"));
  };

  const fetchInvites = async () => {
    const { data, error } = await supabase
      .from("room_invites")
      .select("roomid, rooms(name)")
      .eq("userid", userId);

    if (!error) {
      setInvites(data.map((d, i) => ({ id: d.roomid, name: d.rooms?.name || `Room ${i + 1}` })));
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchInvites();
  }, [userId]);

  const handleCreateRoom = async () => {
    const res = await fetch("https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newRoom, created_by: userId }),
    });
    if (!res.ok) return alert("Failed to create room");

    if (newRoom.room_type === "Private" && newRoom.invite) {
      const json = await res.json();
      const roomid = json.data?.[0]?.roomid;
      const invites = newRoom.invite
        .split(",")
        .map(s => s.trim().replace("@", ""))
        .filter(Boolean);
      for (let user of invites) {
        await fetch("https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invitee_username: user, roomid }),
        });
      }
    }

    alert("Room created");
    setNewRoom({ name: "", description: "", room_type: "Public", invite: "", member_limit: 20 });
    fetchRooms();
  };

  const handleUpdateRoom = async () => {
    const { roomid, ...payload } = editRoom;
    const res = await fetch(`https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/${roomid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setEditRoom(null);
      fetchRooms();
    } else {
      alert("Update failed");
    }
  };

  const handleAcceptInvite = async (roomid) => {
    await fetch("https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid: userId, roomid }),
    });
    fetchInvites();
  };

  const handleDeclineInvite = async (roomid) => {
    await fetch("https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/decline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid: userId, roomid }),
    });
    fetchInvites();
  };

  return (
    <div className="p-6 space-y-8">
      {/* Create New Room */}
      <section>
        <h2 className="text-xl font-bold mb-2">Create Room</h2>
        <div className="flex gap-2 mb-2">
          <input
            placeholder="Name"
            value={newRoom.name}
            onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
            className="border p-2 rounded w-1/4"
          />
          <input
            placeholder="Description"
            value={newRoom.description}
            onChange={e => setNewRoom({ ...newRoom, description: e.target.value })}
            className="border p-2 rounded w-2/4"
          />
          <select
            value={newRoom.room_type}
            onChange={e => setNewRoom({ ...newRoom, room_type: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
          <select
            value={newRoom.member_limit}
            onChange={e => setNewRoom({ ...newRoom, member_limit: parseInt(e.target.value) })}
            className="border p-2 rounded"
          >
            <option value={20}>Limit: 20</option>
            <option value={50}>Limit: 50</option>
            <option value={100}>Limit: 100</option>
          </select>
        </div>
        {newRoom.room_type === "Private" && (
          <input
            placeholder="@user1, @user2"
            value={newRoom.invite}
            onChange={e => setNewRoom({ ...newRoom, invite: e.target.value })}
            className="border p-2 rounded w-full mb-2"
          />
        )}
        <button onClick={handleCreateRoom} className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Room
        </button>
      </section>

      {/* List Rooms */}
      {[["Public", publicRooms], ["Private", privateRooms]].map(([label, list]) => (
        <section key={label}>
          <h2 className="text-xl font-bold mb-2">{label} Rooms</h2>
          {list.map((room) => (
            <div key={room.roomid} className="bg-white shadow p-4 rounded mb-2 flex justify-between">
              <div>
                <div className="font-semibold">{room.name}</div>
                <div className="text-sm text-gray-600">Limit: {room.member_limit}</div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setEditRoom(room)}
                  className="bg-yellow-400 px-3 py-1 rounded text-white"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </section>
      ))}

      {/* Edit Room Modal */}
      {editRoom && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Edit Room</h3>
            <input
              value={editRoom.name}
              onChange={(e) => setEditRoom({ ...editRoom, name: e.target.value })}
              className="w-full border p-2 rounded mb-2"
            />
            <input
              value={editRoom.description}
              onChange={(e) => setEditRoom({ ...editRoom, description: e.target.value })}
              className="w-full border p-2 rounded mb-2"
            />
            <select
              value={editRoom.member_limit}
              onChange={(e) => setEditRoom({ ...editRoom, member_limit: parseInt(e.target.value) })}
              className="w-full border p-2 rounded mb-4"
            >
              <option value={20}>Limit: 20</option>
              <option value={50}>Limit: 50</option>
              <option value={100}>Limit: 100</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditRoom(null)} className="bg-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleUpdateRoom} className="bg-blue-600 px-4 py-2 text-white rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invites */}
      <section>
        <h2 className="text-xl font-bold mb-2">My Invites</h2>
        {invites.map((inv, idx) => (
          <div key={inv.id} className="flex justify-between bg-white p-4 shadow rounded mb-2">
            <span>{idx + 1}. {inv.name}</span>
            <div className="space-x-2">
              <button onClick={() => handleAcceptInvite(inv.id)} className="bg-green-600 text-white px-3 py-1 rounded">
                Accept
              </button>
              <button onClick={() => handleDeclineInvite(inv.id)} className="bg-red-600 text-white px-3 py-1 rounded">
                Decline
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default PremiumManageRooms;
