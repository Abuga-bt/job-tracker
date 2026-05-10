import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import AddApplication from "./pages/AddApplication"

// this component protects routes that need login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token")
  // if no token redirect to login
  if (!token) {
    return <Navigate to="/login" />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default route goes to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protected routes wrapped in ProtectedRoute */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/add-application" element={
          <ProtectedRoute>
            <AddApplication />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App