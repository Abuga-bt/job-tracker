import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // send login data to backend
      const response = await API.post("/auth/login", { email, password })
      // save token to localStorage so it's used in future requests
      localStorage.setItem("token", response.data.access_token)
      // save username to show on dashboard
      localStorage.setItem("user_name", response.data.user_name)
      // redirect to dashboard
      navigate("/dashboard")
    } catch (error) {
      setError(error.response?.data?.detail || "Login failed. Try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Welcome Back
        </h2>

        {/* error message */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* email input */}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded mb-4 focus:outline-none focus:border-blue-400"
          />

          {/* password input */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 rounded mb-4 focus:outline-none focus:border-blue-400"
          />

          {/* submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* link to register page */}
        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login