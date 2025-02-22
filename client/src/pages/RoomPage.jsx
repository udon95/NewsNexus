import { useParams, useNavigate } from "react-router-dom";

const RoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">Welcome to Room #{id}</h2>
      <p className="text-gray-600 mt-2">This is Room #{id}, where discussions happen.</p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => navigate("/")}>
        Back to Rooms
      </button>
    </div>
  );
};

export default RoomPage;
