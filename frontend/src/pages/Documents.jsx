import { useState, useEffect } from "react"
import API from "../api/axios"
import Navbar from "../components/Navbar"

function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fileType, setFileType] = useState("CV")
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await API.get("/documents/")
      setDocuments(response.data)
      setLoading(false)
    } catch (error) {
      setError("Failed to load documents")
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      setError("Please select a file")
      return
    }

    // send file as form data not JSON
    const formData = new FormData()
    formData.append("file", selectedFile)

    setUploading(true)
    try {
      await API.post(`/documents/?file_type=${fileType}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setSuccess("Document uploaded successfully!")
      setSelectedFile(null)
      setError("")
      fetchDocuments()  // refresh list
    } catch (error) {
      setError("Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/documents/${id}`)
      setDocuments(documents.filter(doc => doc.id !== id))
      setSuccess("Document deleted successfully!")
    } catch (error) {
      setError("Failed to delete document")
    }
  }

  // icon and color per file type
  const typeConfig = {
    "CV":           { color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",     label: "CV" },
    "Resume":       { color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300", label: "Resume" },
    "Cover Letter": { color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",  label: "Cover Letter" },
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">
        <p className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-1">
          Documents
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Manage your CVs, resumes and cover letters
        </p>

        {/* upload section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Upload new document
          </p>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-3">{success}</p>}

          <form onSubmit={handleUpload}>
            <div className="flex gap-3 items-end">
              {/* file type selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Document type
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400"
                >
                  <option>CV</option>
                  <option>Resume</option>
                  <option>Cover Letter</option>
                </select>
              </div>

              {/* file input */}
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Select file (PDF, DOCX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none"
                />
              </div>

              {/* upload button */}
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-500 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>

        {/* documents list */}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Your documents ({documents.length})
        </p>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : documents.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12">
            <p className="text-gray-400 mb-1">No documents uploaded yet</p>
            <p className="text-gray-300 text-xs">Upload your CV or cover letter above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex justify-between items-center"
              >
                <div className="flex gap-4 items-center">
                  {/* file type badge */}
                  <div className={`px-3 py-1 rounded-lg text-xs font-medium ${typeConfig[doc.file_type]?.color}`}>
                    {typeConfig[doc.file_type]?.label}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {doc.file_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Uploaded {new Date(doc.uploaded_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  {/* download link */}
                  <a
                    href={`http://127.0.0.1:8000/${doc.file_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Download
                  </a>

                  {/* delete */}
                  <button
                    onClick={() => handleDelete(doc.id)}
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

export default Documents