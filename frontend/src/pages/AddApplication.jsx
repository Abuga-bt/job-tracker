import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import Navbar from "../components/Navbar"

function AddApplication() {
  // form fields
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [jobType, setJobType] = useState("Full Time")
  const [jobUrl, setJobUrl] = useState("")
  const [deadline, setDeadline] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")

 

  const navigate = useNavigate()



  // ── Submit Application ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post("/applications/", {
        company_name: companyName,
        job_title:    jobTitle,
        job_type:     jobType,
        job_url:      jobUrl || null,
        deadline:     deadline || null,
        notes:        notes || null,
      })
      navigate("/dashboard")
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to add application")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-8">

          {/* header */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-xl font-medium text-gray-800 dark:text-gray-100">
              Add Application
            </p>
           
          </div>

      

          {/* error */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* manual form */}
          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 mb-4"
            />

            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Job Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Junior Software Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 mb-4"
            />

            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Job Type *
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 mb-4"
            >
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Internship</option>
              <option>Remote</option>
              <option>Hybrid</option>
            </select>

            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Job URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 mb-4"
            />

            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 mb-4"
            />

            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Notes
            </label>
            <textarea
              placeholder="Any extra notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 mb-6 resize-none"
            />

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
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