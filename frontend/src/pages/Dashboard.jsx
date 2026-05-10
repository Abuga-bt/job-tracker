import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

function Dashboard() {
  const [applications, setApplications] = useState([])  // stores all applications
  const [loading, setLoading] = useState(true)           // loading state
  const [error, setError] = useState("")                 // error state
  const navigate = useNavigate()
  const userName = localStorage.getItem("user_name")     // get saved username

  // runs when page loads - fetches all applications
  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await API.get("/applications/")
      setApplications(response.data)  // save applications to state
      setLoading(false)
    } catch (error) {
      setError("Failed to load applications")
      setLoading(false)
    }
  }

  // delete an application
  const handleDelete = async (id) => {
    try {
      await API.delete(`/applications/${id}`)
      // remove deleted application from state without refetching
      setApplications(applications.filter(app => app.id !== id))
    } catch (error) {
      setError("Failed to delete application")
    }
  }

  // update application status
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.put(`/applications/${id}`, { status: newStatus })
      // update status in state without refetching
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      ))
    } catch (error) {
      setError("Failed to update status")
    }
  }

  // logout user
  const handleLogout = () => {
    localStorage.removeItem("token")    // remove token
    localStorage.removeItem("user_name") // remove username
    navigate("/login")                  // redirect to login
  }

  // color coding for status badges
  const statusColors = {
    "Applied": "bg-blue-100 text-blue-700",
    "Interview": "bg-yellow-100 text-yellow-700",
    "Offered": "bg-green-100 text-green-700",
    "Rejected": "bg-red-100 text-red-700",
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Job Tracker</h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-600">Hi, {userName}! 👋</span>
          <button
            onClick={() => navigate("/add-application")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Add Application
          </button>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {/* stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {["Applied", "Interview", "Offered", "Rejected"].map(status => (
            <div key={status} className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {/* count applications by status */}
                {applications.filter(app => app.status === status).length}
              </p>
              <p className="text-gray-500 text-sm">{status}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4">My Applications</h2>

        {/* error message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* loading state */}
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : applications.length === 0 ? (
          // empty state
          <div className="text-center bg-white rounded-lg shadow p-10">
            <p className="text-gray-500 text-lg">No applications yet!</p>
            <button
              onClick={() => navigate("/add-application")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Add Your First Application
            </button>
          </div>
        ) : (
          // applications list
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    {/* company and job title */}
                    <h3 className="text-lg font-bold">{app.company_name}</h3>
                    <p className="text-gray-500">{app.job_title}</p>
                    <p className="text-gray-400 text-sm">{app.job_type}</p>
                    {/* notes if exists */}
                    {app.notes && (
                      <p className="text-gray-500 text-sm mt-2">📝 {app.notes}</p>
                    )}
                    {/* feedback if exists */}
                    {app.feedback && (
                      <p className="text-green-600 text-sm mt-1">💬 {app.feedback}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* status badge */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[app.status]}`}>
                      {app.status}
                    </span>

                    {/* status update dropdown */}
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                      className="text-sm border rounded p-1"
                    >
                      <option>Applied</option>
                      <option>Interview</option>
                      <option>Offered</option>
                      <option>Rejected</option>
                    </select>

                    {/* delete button */}
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
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