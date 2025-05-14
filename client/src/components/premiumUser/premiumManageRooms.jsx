import { useState, useEffect } from "react";
import supabase from "../../api/supabaseClient";


const ManageRooms = () => {
  const [publicRooms, setPublicRooms] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [joinedPublicRooms, setJoinedPublicRooms] = useState([]);
  const [roomMembers, setRoomMembers] = useState([]); 
  const [joinedPrivateRooms, setJoinedPrivateRooms] = useState([]);
  const [invites, setInvites] = useState([]);
  const [inviteInput, setInviteInput] = useState("");
  const [validUserPills, setValidUserPills] = useState([]); // list of confirmed usernames
  const [editInviteInput, setEditInviteInput] = useState("");
  const [editValidUserPills, setEditValidUserPills] = useState([]);

  const [newPublicRoom, setNewPublicRoom] = useState({
    name: "",
    description: "",
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
    member_limit: 20,
    invite: "",
  });

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userId = userProfile?.user?.userid;
  const myUsername = userProfile?.user?.username;

  const fetchRooms = async () => {
    const res = await fetch(
      `https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/${userId}`
    );
    const data = await res.json();
    setPublicRooms(data.filter((room) => room.room_type === "Public"));
    setPrivateRooms(data.filter((room) => room.room_type === "Private"));
  };

  const fetchJoinedRooms = async () => {
    const res = await fetch(
      `https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/joined/${userId}`
    );
    const data = await res.json();

    const publicJoined = data.filter((room) => room.room_type === "Public");
    const privateJoined = data.filter((room) => room.room_type === "Private");

    setJoinedPublicRooms(publicJoined);
    setJoinedPrivateRooms(privateJoined);
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
    fetchJoinedRooms();
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
      setNewPublicRoom({ name: "", description: "" });
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
          member_limit: newPrivateRoom.member_limit || 20,
        }),
      }
    );

    if (res.ok) {
      alert("Private room created");
      const roomData = await res.json();
      const roomid = roomData.data[0].roomid;

      // const usernames = newPrivateRoom.invite
      //   .split(",")
      //   .map((s) => s.replace("@", "").trim())
      //   .filter(Boolean);
      const usernames = validUserPills;

      // if (usernames.length > 10) {
      //   alert("You can only invite up to 10 users to a private room.");
      //   return;
      // }

      if (usernames.length > newPrivateRoom.member_limit - 1) {
        alert(`You can only invite up to ${newPrivateRoom.member_limit - 1} users.`);
        return;
      }      

      // Validate usernames before inviting
      // const { data: users } = await supabase
      //   .from("user_profiles") // adjust table name if different
      //   .select("username")
      //   .in("username", usernames);

      // const validUsernames = users.map((u) => u.username);
      // const invalidUsernames = usernames.filter(
      //   (name) => !validUsernames.includes(name)
      // );

      // if (invalidUsernames.length > 0) {
      //   alert(`The following usernames are invalid: ${invalidUsernames.join(", ")}`);
      // return;
      // }

      // Validate usernames AND ensure only Premium users are invited
const { data: users } = await supabase
.from("user_profiles")
.select("username, subscription_tier")
.in("username", usernames);

const validUsernames = users
.filter((u) => u.subscription_tier === "Premium")
.map((u) => u.username);

const invalidUsernames = usernames.filter(
(name) => !validUsernames.includes(name)
);

if (invalidUsernames.length > 0) {
alert(`These users are not Premium: ${invalidUsernames.join(", ")}`);
return;
}



      // for (let username of usernames) {
      for (let username of validUsernames) {
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

      setNewPrivateRoom({
        name: "",
        description: "",
        member_limit: 20,
        invite: "",
      });
      fetchRooms();
    }
  };

  const handleUpdateRoom = async (
    roomid,
    currentName,
    currentDescription,
    currentRoomType,
    currentLimit
  ) => {
    setEditRoom({
      roomid,
      name: currentName,
      description: currentDescription,
      room_type: currentRoomType,
      member_limit: currentLimit || 20,
    });

    const res = await fetch(
      `https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/members/${roomid}`
    );
    const data = await res.json();
    setRoomMembers(data || []);
    setShowModal(true);
  };

  const submitRoomUpdate = async () => {
    const { roomid, name, description, room_type, member_limit } = editRoom;

    await fetch(
      `https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/${roomid}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, room_type, member_limit }),
      }
    );
    
    //  if (room_type === "Private" && editRoom.invite) {
      if (room_type === "Private" && editValidUserPills.length > 0) {
    // const usernames = editRoom.invite
    //   .split(",")
    //   .map((s) => s.replace("@", "").trim())
    //   .filter(Boolean);

    const usernames = editValidUserPills;

    if (usernames.length > 10) {
      alert("You can only invite up to 10 users.");
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
    setEditValidUserPills([]);

  }

    setEditRoom((prev) => ({ ...prev, invite: "" }));

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

  const handleExitRoom = async (roomid) => {
    await fetch(
      "https://bwnu7ju2ja.ap-southeast-1.awsapprunner.com/rooms/exit",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: userId, roomid }),
      }
    );
    alert("You exited the room");
    fetchJoinedRooms(); // refresh
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
    "bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-700 transition w-[70px] text-center";


  return (
    <div className="flex min-h-screen font-grotesk w-full  justify-center">
      <div className="flex-1 p-10 space-y-8 max-w-4xl">
        
        {/* Public Rooms */}
        <section className="bg-white p-5 rounded-lg shadow-md space-y-4 border border-gray-200">
        <h1 className="font-bold text-2xl text-gray-800">My Public Discussion Rooms</h1>

          {/* <div className="flex gap-2 items-center mb-2">
            <label>New:</label>
            <input
              placeholder="Name"
              value={newPublicRoom.name}
              onChange={(e) =>
                setNewPublicRoom({ ...newPublicRoom, name: e.target.value })
              }
              className="w-1/4 px-3 py-2 border rounded-md text-base"
            />
            <input
              placeholder="Description"
              value={newPublicRoom.description}
              onChange={(e) =>
                setNewPublicRoom({
                  ...newPublicRoom,
                  description: e.target.value,
                })
              }
              className="w-2/3 px-3 py-2 border rounded-md text-base"
            />
            <button
              onClick={handleAddPublicRoom}
              className="bg-black hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              >
              +
            </button>
          </div> */}

        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-gray-700 w-[40px]">New:</span>
            <input
              placeholder="Name"
              value={newPublicRoom.name}
              onChange={(e) => setNewPublicRoom({ ...newPublicRoom, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          <input
            placeholder="Description"
            value={newPublicRoom.description}
            onChange={(e) => setNewPublicRoom({ ...newPublicRoom, description: e.target.value })}
            className="flex-[2] px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={handleAddPublicRoom}
            className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            +
          </button>
        </div>
  
          {/* <div className="bg-white p-4 rounded-xl shadow space-y-2">
            {[...publicRooms, ...joinedPublicRooms].map((room, index) => (
              <div key={room.roomid} className={rowStyle}>
                <span>
                  {index + 1}. {room.name}
                </span>
                <div className="flex gap-2">
                  {room.created_by === userId && (
                    <span className="mt-2">{room.member_count} members</span>
                  )}
                  {room.created_by === userId ? (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateRoom(
                            room.roomid,
                            room.name,
                            room.description,
                            room.room_type,
                            room.member_limit
                          )
                        }
                        className={buttonClass}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.roomid)}
                        className={buttonClass}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleExitRoom(room.roomid)}
                      className={buttonClass}
                    >
                      Exit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div> */}

          <div className="bg-gray-100 p-4 rounded-xl shadow space-y-2 h-[180px] overflow-y-scroll scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {[...publicRooms, ...joinedPublicRooms].length === 0 ? (
            <p className="text-sm text-gray-500 italic">No public discussion rooms yet.</p>
          ) : (
            [...publicRooms, ...joinedPublicRooms].map((room, index) => (
              <div key={room.roomid} className={rowStyle}>
                <span>
                  {index + 1}. {room.name}
                </span>
                <div className="flex gap-2">
                  {room.created_by === userId && (
                    <span className="mt-2">{room.member_count} members</span>
                  )}
                  {room.created_by === userId ? (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateRoom(
                            room.roomid,
                            room.name,
                            room.description,
                            room.room_type,
                            room.member_limit
                          )
                        }
                        className={buttonClass}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.roomid)}
                        className={buttonClass}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleExitRoom(room.roomid)}
                      className={buttonClass}
                    >
                      Exit
                    </button>
                  )}
                </div>
              </div>
            ))
            )}
        </div>

        </section>

        {/* Private Rooms */}
        <section className="bg-white p-5 rounded-lg shadow-md space-y-4 border border-gray-200">
        <h1 className="font-bold text-2xl text-gray-800">My Private Discussion Rooms</h1>

          {/* <div className="flex gap-2 items-center mb-2"> */}
            {/* <label>New:</label>
            <input
              placeholder="Name"
              value={newPrivateRoom.name}
              onChange={(e) =>
                setNewPrivateRoom({ ...newPrivateRoom, name: e.target.value })
              }
              className="w-1/4 px-3 py-2 border rounded-md text-base"
            />
            <input
              placeholder="Description"
              value={newPrivateRoom.description}
              onChange={(e) =>
                setNewPrivateRoom({
                  ...newPrivateRoom,
                  description: e.target.value,
                })
              }
              className="w-1/2 px-3 py-2 border rounded-md text-base"
            /> */}

            {/* 🟩 ADDED: Dropdown for member limit */}
            {/* <select
              value={newPrivateRoom.member_limit}
              onChange={(e) =>
                setNewPrivateRoom({
                  ...newPrivateRoom,
                  member_limit: parseInt(e.target.value),
                })
              }
              className="w-[120px] px-3 py-2 border rounded-md text-base"
            >
              <option value={20}>Limit: 20</option>
              <option value={50}>Limit: 50</option>
              <option value={100}>Limit: 100</option>
            </select>
            {/* 🟩 END */}

            {/* <button
              onClick={handleAddPrivateRoom}
              className="bg-black text-white px-4 py-2 rounded text-base"
            >
              +
            </button> 
          </div>  */}

          {/* <div className="flex items-center gap-2 mb-2">
            <label>Invite:</label>
            <input
              placeholder="Put usernames to invite (max 10)"
              value={newPrivateRoom.invite}
              onChange={(e) =>
                setNewPrivateRoom({ ...newPrivateRoom, invite: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-base"
            />
          </div> */}

        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-gray-700 w-[40px]">New:</span>
          <input
            placeholder="Name"
            value={newPrivateRoom.name}
            onChange={(e) => setNewPrivateRoom({ ...newPrivateRoom, name: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            placeholder="Description"
            value={newPrivateRoom.description}
            onChange={(e) => setNewPrivateRoom({ ...newPrivateRoom, description: e.target.value })}
            className="flex-[2] px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          {/* <select
    value={newPrivateRoom.member_limit}
    onChange={(e) => setNewPrivateRoom({ ...newPrivateRoom, member_limit: parseInt(e.target.value) })}
    className="w-[110px] px-3 py-2 border border-gray-300 rounded-md text-sm"
  >
    <option value={20}>Limit: 20</option>
    <option value={50}>Limit: 50</option>
    <option value={100}>Limit: 100</option>
          </select> */}
          <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Limit:</label>
          <select
            value={newPrivateRoom.member_limit}
            onChange={(e) =>
                setNewPrivateRoom({
                ...newPrivateRoom,
                member_limit: parseInt(e.target.value),
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

          <button
            onClick={handleAddPrivateRoom}
            className="bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            +
          </button>
        </div>


          <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-medium text-gray-700">Invite Users:</label>
  
          {/* <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded-md px-2 py-1"> */}
          <div className="flex items-center flex-wrap gap-2 border border-gray-300 rounded-md px-3 py-2 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {validUserPills.map((user) => (
              <div
                key={user}
                className="flex items-center bg-gray-200 text-sm rounded-full px-3 py-1"
              >
                {user}
                <button
                  className="ml-2 text-gray-600 hover:text-red-500"
                  onClick={() =>
                    setValidUserPills(validUserPills.filter((u) => u !== user))
                  }
                >
                  &times;
                </button>
              </div>
            ))}

            <input
              type="text"
              placeholder="Type username and hit Enter"
              className="flex-1 px-2 py-1 outline-none text-sm"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              // onKeyDown={async (e) => {
      //   if (e.key === "Enter" || e.key === ",") {
      //     e.preventDefault();
      //     const trimmed = inviteInput.replace("@", "").trim();
      //     if (!trimmed) return;

      //     // Check for duplicates
      //     if (validUserPills.includes(trimmed)) {
      //       setInviteInput("");
      //       return;
      //     }

      //     // Validate with Supabase
      //     const { data, error } = await supabase
      //       .from("user_profiles")
      //       .select("username")
      //       .eq("username", trimmed);

      //     if (data?.length > 0) {
      //       setValidUserPills([...validUserPills, trimmed]);
      //     } else {
      //       alert(`Username "${trimmed}" not found.`);
      //     }

      //     setInviteInput("");
      //   }
              // }}
              // onKeyDown={async (e) => {

              //   if (e.key === "Enter" || e.key === ",") {
              //     e.preventDefault();
        
              //     if (validUserPills.length >= newPrivateRoom.member_limit - 1) {
              //       alert(`You can only invite up to ${newPrivateRoom.member_limit - 1} users.`);
              //       setInviteInput("");
              //       return;
              //     }
        
              //     const trimmed = inviteInput.replace("@", "").trim().toLowerCase();
              //     // Block self-invite
              //     if (trimmed === myUsername?.toLowerCase()) {
              //       alert("You cannot invite yourself to your own room.");
              //       setInviteInput("");
              //       return;
              //     }
              //     if (!trimmed) return;

              //     // Live limit check
              //     if (validUserPills.length >= newPrivateRoom.member_limit - 1) {
              //       alert(`You can only invite up to ${newPrivateRoom.member_limit - 1} users.`);
              //       setInviteInput("");
              //       return;
              //     }
      
              //     // Check for duplicates (case-insensitive)
              //     if (validUserPills.some((u) => u.toLowerCase() === trimmed)) {
              //       setInviteInput("");
              //       return;
              //     }
      
              //     // Validate with Supabase
              //     // const { data, error } = await supabase
              //     //   .from("users")
              //     //   .select("username");
      
              //     // const matchingUser = data?.find(
              //     //   (u) => u.username.toLowerCase() === trimmed
              //     //   );
      
              //     // if (matchingUser) {
              //     //   setValidUserPills([...validUserPills, matchingUser.username]);
              //     // } else {
              //     //   alert(`Username "${inviteInput}" not found.`);
              //     // }
      
              //     // setInviteInput("");
              //     const { data: userMatch, error: userError } = await supabase
              //     .from("users")
              //     .select("username, userid")
              //     .ilike("username", trimmed)
              //     .maybeSingle();
                
              //   if (!userMatch) {
              //     alert(`Username "${inviteInput}" not found.`);
              //     setInviteInput("");
              //     return;
              //   }
                
              //   const { data: tierMatch, error: tierError } = await supabase
              //     .from("usertype")
              //     .select("usertype")
              //     .eq("userid", userMatch.userid)
              //     .maybeSingle();
                
              //   if (tierMatch?.usertype !== "Premium") {
              //     alert(`User "${userMatch.username}" is not a Premium user.`);
              //   } else {
              //     setValidUserPills([...validUserPills, userMatch.username]);
              //   }
                
              //   setInviteInput("");
                
              //   }
              // }}
              onKeyDown={async (e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
              
                  const trimmed = inviteInput.replace("@", "").trim().toLowerCase();
                  if (!trimmed || trimmed === myUsername?.toLowerCase()) {
                    alert("You cannot invite yourself or an empty username.");
                    setInviteInput("");
                    return;
                  }
              
                  if (validUserPills.some((u) => u.toLowerCase() === trimmed)) {
                    setInviteInput("");
                    return;
                  }
              
                  if (validUserPills.length >= newPrivateRoom.member_limit - 1) {
                    alert(`You can only invite up to ${newPrivateRoom.member_limit - 1} users.`);
                    setInviteInput("");
                    return;
                  }
              
                  // Step 1: Get userid for the username
                  const { data: userRow, error: userErr } = await supabase
                    .from("users")
                    .select("userid, username")
                    .ilike("username", trimmed)
                    .maybeSingle();
              
                  if (!userRow) {
                    alert(`Username "${inviteInput}" not found.`);
                    setInviteInput("");
                    return;
                  }
              
                  const userIdToCheck = userRow.userid;
              
                  // Step 2: Check Premium status for that userid
                  const { data: typeRow, error: typeErr } = await supabase
                    .from("usertype")
                    .select("usertype")
                    .eq("userid", userIdToCheck)
                    .maybeSingle();
              
                  if (!typeRow || typeRow.usertype !== "Premium") {
                    alert(`User "${userRow.username}" is not a Premium user.`);
                  } else {
                    setValidUserPills([...validUserPills, userRow.username]);
                  }
              
                  setInviteInput("");
                }
              }}
              
      
            />
          </div>
        </div>


          {/* <div className="bg-white p-4 rounded-xl shadow space-y-2">
            {[...privateRooms, ...joinedPrivateRooms].map((room, index) => (
              <div key={room.roomid} className={rowStyle}>
                <span>
                  {index + 1}. {room.name}
                </span>
                <div className="flex gap-2">
                  {room.created_by === userId && (
                    <span className="mt-2">{room.member_count} members</span>
                  )}
                  {room.created_by === userId ? (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateRoom(
                            room.roomid,
                            room.name,
                            room.description,
                            room.room_type,
                            room.member_limit // ensure passing this too
                          )
                        }
                        className={buttonClass}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.roomid)}
                        className={buttonClass}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleExitRoom(room.roomid)}
                      className={buttonClass}
                    >
                      Exit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div> */}
          {/* <div className="bg-white p-4 rounded-xl shadow space-y-2 max-h-[200px] overflow-y-auto pr-2"> */}
          <div className="bg-gray-100 p-4 rounded-xl shadow space-y-2 h-[180px] overflow-y-scroll scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {[...privateRooms, ...joinedPrivateRooms].length === 0 ? (
            <p className="text-sm text-gray-500 italic">No private discussion rooms yet.</p>
          ) : (
            [...privateRooms, ...joinedPrivateRooms].map((room, index) => (
              <div key={room.roomid} className={rowStyle}>
                <span>
                  {index + 1}. {room.name}
                </span>
                <div className="flex gap-2">
                  {room.created_by === userId && (
                    <span className="mt-2">{room.member_count} members</span>
                  )}
                    {room.created_by === userId ? (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateRoom(
                            room.roomid,
                            room.name,
                            room.description,
                            room.room_type,
                            room.member_limit
                          )
                        }
                        className={buttonClass}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.roomid)}
                        className={buttonClass}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleExitRoom(room.roomid)}
                      className={buttonClass}
                    >
                      Exit
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        </section>

        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm min-h-screen flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
              <h2 className="text-xl font-semibold">Update Room</h2>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Room Name
                </label>
                <input
                  value={editRoom.name}
                  onChange={(e) =>
                    setEditRoom({ ...editRoom, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Room Description
                </label>
                <input
                  value={editRoom.description}
                  onChange={(e) =>
                    setEditRoom({ ...editRoom, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Room Type
                </label>
                <select
                  value={editRoom.room_type}
                  onChange={(e) =>
                    setEditRoom({ ...editRoom, room_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              {editRoom.room_type === "Private" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Member Limit
                  </label>
                  {/* <input
                    type="number"
                    min={1}
                    max={100}
                    value={editRoom.member_limit}
                    onChange={(e) =>
                      setEditRoom({
                        ...editRoom,
                        member_limit: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  /> */}
                  <select
                    value={editRoom.member_limit}
                    onChange={(e) =>
                    setEditRoom({
                      ...editRoom,
                      member_limit: parseInt(e.target.value),
                    })
                    }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value={20}>20 members</option>
                      <option value={50}>50 members</option>
                      <option value={100}>100 members</option>
                    </select>

                </div>
              )}

              <div>
                <label className="block text-sm font-medium mt-2 mb-1">
                  Current Members
                </label>
                {roomMembers.length === 0 ? (
                  <p className="text-sm text-gray-500">No members yet.</p>
                ) : (
                  // <ul className="list-disc list-inside text-sm text-gray-700">
                  //   {roomMembers.map((username, idx) => (
                  //     <li key={idx}>{username}</li>
                  //   ))}
                  // </ul>
                  <div className="max-h-40 overflow-y-auto border rounded-md px-3 py-2 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {roomMembers.map((username, idx) => (
                        <li key={idx}>{username}</li>
                      ))}
                    </ul>
                  </div>

                )}
              </div>


              {editRoom.room_type === "Private" && (
              <div>
                <div className="flex justify-between items-center mt-2 mb-1">
                  <label className="block text-sm font-medium">
                    Invite New Users
                  </label>
                  <span className="text-xs text-gray-500 italic">(put username to invite)</span>
                </div>
                {/* <input
                  placeholder="@user1, @user2 (max 10)"
                  value={editRoom.invite}
                  onChange={(e) =>
                    setEditRoom({ ...editRoom, invite: e.target.value }) 
                  }
                  className="w-full px-3 py-2 border rounded-md"
                /> */}
                <div className="flex items-center flex-wrap gap-2 border border-gray-300 rounded-md px-3 py-2 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  {editValidUserPills.map((user) => (
                    <div
                      key={user}
                      className="flex items-center bg-gray-200 text-sm rounded-full px-3 py-1"
                    >
                      {user}
                      <button
                        className="ml-2 text-gray-600 hover:text-red-500"
                        onClick={() =>
                          setEditValidUserPills(editValidUserPills.filter((u) => u !== user))
                        }
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  <input
                    type="text"
                    placeholder="Type username and hit Enter"
                    className="flex-1 px-2 py-1 outline-none text-sm"
                    value={editInviteInput}
                    onChange={(e) => setEditInviteInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();

                      const trimmed = editInviteInput.replace("@", "").trim().toLowerCase();
                        if (!trimmed || trimmed === myUsername?.toLowerCase()) {
                          alert("You cannot invite yourself or an empty username.");
                          setEditInviteInput("");
                          return;
                        }

                        if (roomMembers.some((m) => m.toLowerCase() === trimmed)) {
                          alert(`User "${trimmed}" is already in the room.`);
                          setEditInviteInput("");
                          return;
                        }

                        if (editValidUserPills.some((u) => u.toLowerCase() === trimmed)) {
                          setEditInviteInput("");
                          return;
                        }

                        if (editValidUserPills.length >= editRoom.member_limit - roomMembers.length) {
                          alert(`You can only invite up to ${editRoom.member_limit - roomMembers.length} more users.`);
                          setEditInviteInput("");
                            return;
                        }

                        const { data: userRow } = await supabase
                          .from("users")
                          .select("userid, username")
                          .ilike("username", trimmed)
                          .maybeSingle();

                        if (!userRow) {
                          alert(`Username "${editInviteInput}" not found.`);
                          setEditInviteInput("");
                          return;
                        }

                        const { data: typeRow } = await supabase
                          .from("usertype")
                          .select("usertype")
                          .eq("userid", userRow.userid)
                          .maybeSingle();

                        if (!typeRow || typeRow.usertype !== "Premium") {
                          alert(`User "${userRow.username}" is not a Premium user.`);
                        } else {
                          setEditValidUserPills([...editValidUserPills, userRow.username]);
                        }

                        setEditInviteInput("");
                      }
                    }}
                    />
              </div>

              <div className="mt-1 text-sm text-gray-500">
                {editValidUserPills.length} of {editRoom.member_limit - roomMembers.length} invited
              </div>

              </div>
            )}




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
        <section className="bg-white p-5 rounded-lg shadow-md space-y-4 border border-gray-200">
        <h1 className="font-bold text-2xl text-gray-800">My Private Discussion Room Invites:</h1>
          {/* <div className="bg-white p-4 rounded-xl shadow space-y-2"> */}
          {/* <div className="bg-white p-4 rounded-xl shadow space-y-2 max-h-[200px] overflow-y-auto pr-2"> */}
          <div className="bg-gray-100 p-4 rounded-xl shadow space-y-2 h-[180px] overflow-y-scroll scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {/* {invites.map((invite, index) => (
              <div key={invite.id} className={rowStyle}>
                <span>
                  {index + 1}. {invite.name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptInvite(invite.id)}
                    className={buttonClass}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(invite.id)}
                    className={buttonClass}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))} */}
            {invites.length === 0 ? (
            <p className="text-sm text-gray-500 italic">You have recieved invites yet.</p>
            ) : (
              invites.map((invite, index) => (
                <div key={invite.id} className={rowStyle}>
                  <span>
                    {index + 1}. {invite.name}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptInvite(invite.id)}
                      className={buttonClass}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.id)}
                        className={buttonClass}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>
        </section>
      </div>
    </div>
  );
};

export default ManageRooms;
