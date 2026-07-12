import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import Navbar from "../components/Navbar"

function Dashboard() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("All")
  const navigate = useNavigate()
  const userName = localStorage.getItem("user_name")

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await API.get("/applications/")
      setApplications(response.data)
      setLoading(false)
    } catch (error) {
      setError("Failed to load applications")
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/applications/${id}`)
      setApplications(applications.filter(app => app.id !== id))
    } catch (error) {
      setError("Failed to delete application")
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.put(`/applications/${id}`, { status: newStatus })
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ))
    } catch (error) {
      setError("Failed to update status")
    }
  }

  // color config for status
  const statusConfig = {
    "Applied":   { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",   bar: "bg-blue-500" },
    "Interview": { badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300", bar: "bg-purple-500" },
    "Offered":   { badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",  bar: "bg-green-500" },
    "Rejected":  { badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",    bar: "bg-red-400" },
  }

  // icon colors for company initials
  const iconColors = [
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-green-100 text-green-600",
    "bg-amber-100 text-amber-600",
  ]

  // filter applications
  const filtered = filter === "All"
    ? applications
    : applications.filter(app => app.status === filter)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        {/* greeting */}
        <p className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-1">
          Good morning, {userName}! 👋
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          You have {applications.filter(a => a.status === "Interview").length} interviews scheduled.
        </p>

        {/* stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Applied",   color: "text-blue-500",   count: applications.filter(a => a.status === "Applied").length },
            { label: "Interview", color: "text-purple-500", count: applications.filter(a => a.status === "Interview").length },
            { label: "Offered",   color: "text-green-500",  count: applications.filter(a => a.status === "Offered").length },
            { label: "Rejected",  color: "text-red-400",    count: applications.filter(a => a.status === "Rejected").length },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <p className={`text-3xl font-medium ${stat.color} mb-1`}>{stat.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* filter + title */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recent applications
          </p>
          <div className="flex gap-2">
            {["All", "Applied", "Interview", "Offered", "Rejected"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1 rounded-full border transition ${
                  filter === f
                    ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
                    : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* error */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* loading */}
        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12">
            <p className="text-gray-400 mb-4">No applications yet!</p>
            <button
              onClick={() => navigate("/add-application")}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
            >
              Add Your First Application
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app, index) => (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex justify-between items-center"
              >
                <div className="flex gap-4 items-center">
                  {/* status color bar */}
                  <div className={`w-1 h-10 rounded-full ${statusConfig[app.status]?.bar}`} />

                  {/* company icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${iconColors[index % iconColors.length]}`}>
                    {app.company_name?.charAt(0).toUpperCase()}
                  </div>

                  {/* details */}
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {app.company_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {app.job_title} · {app.job_type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* date */}
                  <p className="text-xs text-gray-400">
                    {new Date(app.date_applied).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </p>

                  {/* status badge */}
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig[app.status]?.badge}`}>
                    {app.status}
                  </span>

                  {/* status dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                    className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300"
                  >
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offered</option>
                    <option>Rejected</option>
                  </select>

                  {/* delete */}
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard