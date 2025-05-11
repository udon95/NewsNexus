import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../api/supabaseClient"; // Ensure Supabase client is imported

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth
      .getSessionFromUrl({ storeSession: false })
      .then(({ error }) => {
        if (error) setError(error.message);
      });
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Update password in Supabase Auth (session held in memory only)
    const { data: authData, error: authError } = await supabase.auth.updateUser(
      { password }
    );
    if (authError) {
      setError(`Auth update failed: ${authError.message}`);
      setLoading(false);
      return;
    }

    // Update in your users table
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError(userError ? userError.message : "Could not retrieve user");
      setLoading(false);
      return;
    }
    const { error: tableError } = await supabase
      .from("users")
      .update({ password })
      .eq("auth_id", userData.user.id);
    if (tableError) {
      setError(`Table update failed: ${tableError.message}`);
      setLoading(false);
      return;
    }

    // Clean up: ensure no tokens are stored
    await supabase.auth.signOut();

    setMessage("Password updated successfully! Redirecting to login...");
    setLoading(false);
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full p-2 border rounded-lg mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-blue-500"
            }`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
