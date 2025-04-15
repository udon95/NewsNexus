import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../api/supabaseClient";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [freeUserList, setFreeUserList] = useState([]);
  const [premiumUserList, setPremiumUserList] = useState([]);
  const [expertUserList, setExpertUserList] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [displayedUserTypes, setDisplayedUserTypes] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setRows(data);
        setFilteredUsers(data);
        console.log(data);
      }
    };

    const fetchUserTypes = async () => {
      const { data, error } = await supabase.from("usertype").select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setFreeUserList(data.filter((row) => row.usertype === "Free"));
        setPremiumUserList(data.filter((row) => row.usertype === "Premium"));
      }
    };

    const fetchExpertUsers = async () => {
      const { data, error } = await supabase
        .from("expert_application")
        .select("*")
        .eq("status", "Approved");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setExpertUserList(data);
      }
    };

    fetchUsers();
    fetchUserTypes();
    fetchExpertUsers();
  }, []);

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filtered = rows.filter((user) =>
      user.username.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);

    console.log(freeUserList);
    console.log(premiumUserList);
    console.log(expertUserList);
  };

  const openUser = (user) => {
    navigate("../AdminUserDetails", { state: { user } });
  };

  const UserList = ({ users, onUserClick }) => {
    return (
      <div id="userList">
        {users.map((user, index) => (
          <div
            key={user.userid}
            className="ml-10 mt-8 max-w-150 bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
            onClick={() => onUserClick(user)}
          >
            User {index + 1}: &emsp; {user.username}
          </div>
        ))}
      </div>
    );
  };

  const handleResolvedStatusChange = () => {
    const statusElement = document.getElementById("status");
    setDisplayedUserTypes(statusElement.value);
    document.getElementById("search").value = "";
  };

  useEffect(() => {
    setFilteredUsers(
      rows.filter((row) =>
        displayedUserTypes === "Free"
          ? freeUserList.some((user) => user.userid === row.userid)
          : displayedUserTypes === "Premium"
          ? premiumUserList.some((user) => user.userid === row.userid)
          : displayedUserTypes === "Expert"
          ? expertUserList.some((user) => user.username === row.username)
          : row
      )
    );
  }, [displayedUserTypes, rows]);

  return (
    <div className="w-screen min-h-screen flex flex-col overflow-auto">
      <div className="flex-1 font-grotesk">
        <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
          Search users:
        </div>
        <div className="flex">
          <input
            id="search"
            placeholder="Enter username"
            className="ml-10 mt-5 min-w-[500px] bg-gray-100 rounded-2xl p-3 text-lg shadow-lg outline-none focus:ring-2 focus:ring-gray-300"
            onChange={handleSearch}
          />
        </div>
        <div className="flex">
          <div className="text-2xl sm:text-3xl text-left mt-8 ml-10 font-bold">
            Users:
          </div>
          <select
            id="status"
            name="status"
            className=" sm:text-xl text-left mt-8 ml-40 font-bold"
            onChange={handleResolvedStatusChange}
          >
            <option value="All">All Users</option>
            <option value="Free">Free Users</option>
            <option value="Premium">Premium Users</option>
            <option value="Expert">Expert Users</option>
          </select>
        </div>
        <UserList users={filteredUsers} onUserClick={openUser} />
      </div>
    </div>
  );
};

export default AdminUsers;
