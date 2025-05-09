import React from "react";
import useAuthHook from "../../hooks/useAuth";

const AdminHome = () => {
  const { user } = useAuthHook();
  return (
    <div className="flex flex-col items-start justify-start  text-center p-6">
      <h1 className="text-3xl font-bold">Hello {user.username} </h1>
      <p className="mt-2 text-lg">Welcome to the Admin Dashboard.</p>
    </div>
  );
};

export default AdminHome;
