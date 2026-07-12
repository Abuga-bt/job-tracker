import { useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

 const handleLogout = async () => {
    try {
        // blacklist the token on backend
        await API.post("/users/logout")
    } catch (error) {
        console.error("Logout error:", error)
    } finally {
        // always clear local storage and redirect
        localStorage.removeItem("token")
        localStorage.removeItem("user_name")
        navigate("/login")
    }
}

  // check if current path matches link
  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
      {/* logo */}
      <span className="text-lg font-medium bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 bg-clip-text text-transparent">
        JobTracker
      </span>

      {/* nav links */}
      <div className="flex gap-6 items-center">
        <button
          onClick={() => navigate("/dashboard")}
          className={`flex items-center gap-2 text-sm ${isActive("/dashboard") ? "text-blue-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/applications")}
          className={`flex items-center gap-2 text-sm ${isActive("/applications") ? "text-blue-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}
        >
          Applications
        </button>
        <button
          onClick={() => navigate("/documents")}
          className={`flex items-center gap-2 text-sm ${isActive("/documents") ? "text-blue-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}
        >
          Documents
        </button>
        <button
          onClick={() => navigate("/ai-tailor")}
          className={`flex items-center gap-2 text-sm ${isActive("/ai-tailor") ? "text-blue-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}
        >
          AI Tailor
        </button>
      </div>

      {/* right side */}
      <div className="flex items-center gap-4">
        {/* add job button */}
        <button
          onClick={() => navigate("/add-application")}
          className="bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          + Add Job
        </button>

        {/* dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        {/* avatar */}
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 text-sm font-medium">
          {localStorage.getItem("user_name")?.charAt(0).toUpperCase()}
        </div>

        {/* logout */}
        <button
          onClick={handleLogout}
          className="text-sm text-red-400 hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar