import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

function Register() {
  // state for each form field
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")  // stores error message
  const navigate = useNavigate()          // for redirecting

  const handleSubmit = async (e) => {
    e.preventDefault()  // stops page from refreshing on submit
    try {
      // send registration data to backend
      await API.post("/auth/register", { name, email, phone, password })
      // if successful redirect to login page
      navigate("/login")
    } catch (error) {
      // show error message to user
      setError(error.response?.data?.detail || "Registration failed. Try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Create Account
        </h2>

        {/* show error message if exists */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* name input */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border p-2 rounded mb-4 focus:outline-none focus:border-blue-400"
          />

          {/* email input */}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded mb-4 focus:outline-none focus:border-blue-400"
          />

          {/* phone input */}
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
            Register
          </button>
        </form>

        {/* link to login page */}
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  )
}

export default Register