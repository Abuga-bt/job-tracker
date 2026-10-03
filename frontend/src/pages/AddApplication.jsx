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

  // smart import states
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState("")
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState("")

  const navigate = useNavigate()

  // ── Smart Import ────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!importText) {
      setImportError("Please paste a job URL or job description")
      return
    }

    setImporting(true)
    setImportError("")

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: "You are a job description parser. Extract job details and return ONLY a JSON object with no extra text, no markdown, no backticks."
            },
            {
              role: "user",
              content: `Extract the following details from this job posting and return ONLY a valid JSON object:
{
  "company_name": "company name or empty string",
  "job_title": "job title or empty string",
  "job_type": "one of: Full Time, Part Time, Internship, Remote, Hybrid",
  "notes": "a brief 1-2 sentence summary of the role"
}

Job posting:
${importText}`
            }
          ]
        })
      })

      const data = await response.json()

      if (data.error) {
        setImportError(data.error.message)
        return
      }

      const raw = data.choices[0].message.content.trim()
      const parsed = JSON.parse(raw)

      if (parsed.company_name) setCompanyName(parsed.company_name)
      if (parsed.job_title)    setJobTitle(parsed.job_title)
      if (parsed.job_type)     setJobType(parsed.job_type)
      if (parsed.notes)        setNotes(parsed.notes)

      setShowImport(false)
      setImportText("")

    } catch (error) {
      setImportError("Failed to parse job details. Please fill in manually.")
    } finally {
      setImporting(false)
    }
  }

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
            {/* smart import toggle button */}
            <button
              onClick={() => setShowImport(!showImport)}
              className="text-sm bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
            >
              {showImport ? "Fill Manually" : "⚡ Smart Import"}
            </button>
          </div>

          {/* smart import panel */}
          {showImport && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste a job URL or job description
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Our AI will automatically extract the company name, job title and type for you
              </p>

              {importError && (
                <p className="text-red-500 text-xs mb-2">{importError}</p>
              )}

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste job URL or full job description here..."
                rows={6}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 resize-none mb-3"
              />

              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full bg-blue-500 text-white text-sm py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                {importing ? "Extracting details..." : "Extract Job Details"}
              </button>
            </div>
          )}

          {/* success message after import */}
          {!showImport && companyName && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-green-600 dark:text-green-300 text-xs">
                ✅ Job details imported successfully! Review and edit below before submitting.
              </p>
            </div>
          )}

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