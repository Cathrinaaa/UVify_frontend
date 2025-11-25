"use client"

import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Latest from "./pages/Latest"
import History from "./pages/History"
import Login from "./pages/Login"
import LandingPage from "./pages/LandingPage" // import new landing page
import DashboardHome from "./pages/DashboardHome"
import "./index.css"
import Profile from "./pages/Profile"
import About from "./pages/About"
import { LanguageProvider } from "./contexts/LanguageContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { UVDataProvider } from "./contexts/UVDataContext"

// =============================
// Simple auth context
// =============================
export const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null)

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  // ✅ NEW: update user info and persist
  const updateUser = (updatedData) => {
    setUser(updatedData)
    localStorage.setItem("user", JSON.stringify(updatedData))
  }

  React.useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser && savedUser !== "null") {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        localStorage.removeItem("user")
      }
    }
  }, [])

  const isAuthenticated = () => !!user

  const value = {
    user,
    setUser,
    isAuthenticated,
    login,
    logout,
    updateUser, // ✅ make this available
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// =============================
// Route Components
// =============================
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = React.useContext(AuthContext)
  return isAuthenticated() ? children : <Navigate to="/" replace />
}

// ✅ REMOVED: PublicRoute since login is now the landing page

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
  </div>
)

const App = () => {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="home" element={<DashboardHome />} />
        <Route path="latest" element={<Latest />} />
        <Route path="history" element={<History />} />
        <Route path="profile" element={<Profile />} />
        <Route path="about" element={<About />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <UVDataProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </UVDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
