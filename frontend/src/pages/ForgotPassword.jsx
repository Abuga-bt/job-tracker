import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await API.post("/password/forgot-password", { email })
      setMessage(response.data.message)
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-2 text-center text-blue-500">
          Forgot Password?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Enter your email and we'll send you a reset link
        </p>

        {/* success message */}
        {message && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4">
            <p className="text-green-600 dark:text-green-300 text-sm text-center">
              ✅ {message}
            </p>
          </div>
        )}

        {/* error message */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* only show form if no success message yet */}
        {!message && (
          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 mb-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* back to login */}
        <p className="mt-4 text-center text-sm">
          <span
            onClick={() => navigate("/login")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            ← Back to Login
          </span>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword