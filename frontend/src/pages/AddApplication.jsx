import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

function AddApplication() {
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [jobType, setJobType] = useState("Full Time")
  const [jobUrl, setJobUrl] = useState("")
  const [deadline, setDeadline] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // send application data to backend
      await API.post("/applications/", {
        company_name: companyName,
        job_title: jobTitle,
        job_type: jobType,
        job_url: jobUrl || null,
        deadline: deadline || null,
        notes: notes || null,
      })
      // redirect to dashboard after adding
      navigate("/dashboard")
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to add application")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Job Tracker</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-500 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">
            Add New Application
          </h2>

          {/* error message */}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            {/* company name */}
            <label className="block text-sm font-medium mb-1">Company Name *</label>
            <input
              type="text"
              placeholder="e.g. Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full border p-2 rounded mb-4 focus:outline-none focus:border-blue-400"
            />

            {/* job title */}
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <input
              type="text"
              placeholder="e.g. Junior Software Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              className="w-full border p-2 rounded mb-4 focus:outline-none focus:border-blue-400"
            />

            {/* job type dropdown */}
            <label className="block text-sm font-medium mb-1">Job Type *</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full border p-2 rounded mb-4 focus:outline-none focus:border-blue-400"
            >
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Internship</option>
              <option>Remote</option>
              <option>Hybrid</option>
            </select>

            {/* job url */}
            <label className="block text-sm font-medium mb-1">Job URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full border p-2 rounded mb-4 focus:outline-none focus:border-blue-400"
            />

            {/* deadline */}
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border p-2 rounded mb-4 focus:outline-none focus:border-blue-400"
            />

            {/* notes */}
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              placeholder="Any extra notes about this application..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border p-2 rounded mb-6 focus:outline-none focus:border-blue-400"
            />

            {/* submit button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Add Application
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddApplication