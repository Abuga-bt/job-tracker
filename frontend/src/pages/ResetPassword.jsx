import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import API from "../api/axios"

function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const response = await API.post("/password/reset-password", {
        token,
        new_password: password
      })
      setMessage(response.data.message)
      setTimeout(() => navigate("/login"), 3000)
    } catch (error) {
      setError(error.response?.data?.detail || "Reset failed. Link may have expired.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-96 text-center">
          <p className="text-red-500 mb-4">Invalid reset link</p>
          <span
            onClick={() => navigate("/forgot-password")}
            className="text-blue-500 cursor-pointer hover:underline text-sm"
          >
            Request a new one
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-2 text-center text-blue-500">
          Reset Password
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Enter your new password below
        </p>

        {message && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3 mb-4">
            <p className="text-green-600 dark:text-green-300 text-sm text-center">
              ✅ {message} Redirecting to login...
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {!message && (
          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              New Password
            </label>
            {/* new password with eye icon */}
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 pr-10 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Confirm New Password
            </label>
            {/* confirm password with eye icon */}
            <div className="relative mb-6">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 pr-10 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

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

export default ResetPassword