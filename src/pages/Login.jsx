"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../main"
import { useLanguage } from "../contexts/LanguageContext"

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const { t } = useLanguage()
  const featureCards = [
    {
      icon: "☀️",
      color: "text-yellow-500 dark:text-yellow-400",
      title: t("login.realTimeMonitoring"),
      desc: t("login.realTimeDesc"),
    },
    {
      icon: "🛡️",
      color: "text-orange-500 dark:text-orange-400",
      title: t("login.safetyAlerts"),
      desc: t("login.safetyAlertsDesc"),
    },
    {
      icon: "📈",
      color: "text-amber-500 dark:text-amber-400",
      title: t("login.historicalData"),
      desc: t("login.historicalDataDesc"),
    },
    {
      icon: "👥",
      color: "text-red-500 dark:text-red-400",
      title: t("login.multiUserSupport"),
      desc: t("login.multiUserDesc"),
    },
  ]

  // 🌐 Change this to your Render backend URL
  const BACKEND_URL = "https://uvify-backend.onrender.com"

  useEffect(() => {
    const savedEmail = getCookie("uvify_email")
    const savedPassword = getCookie("uvify_password")
    const wasRemembered = getCookie("uvify_remember_me") === "true"

    if (savedEmail && savedPassword) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        password: savedPassword,
      }))
      setRememberMe(wasRemembered)
    }
  }, [])

  const setCookie = (name, value, days = 30) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  const getCookie = (name) => {
    const nameEQ = name + "="
    const cookies = document.cookie.split(";")
    for (let cookie of cookies) {
      cookie = cookie.trim()
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length)
      }
    }
    return ""
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("Login attempt started")

    try {
      const url = `${BACKEND_URL}/auth/login`
      const body = { email: formData.email, password: formData.password }

      console.log("Sending request to:", url)

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      console.log("Response received:", data)

      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong")
        console.log("Login failed:", data.message)
        setIsLoading(false)
        return
      }

      if (rememberMe) {
        setCookie("uvify_email", formData.email, 30)
        setCookie("uvify_password", formData.password, 30)
        setCookie("uvify_remember_me", "true", 30)
      } else {
        setCookie("uvify_email", "", -1)
        setCookie("uvify_password", "", -1)
        setCookie("uvify_remember_me", "", -1)
      }

      login(data.user)
      console.log("Login successful, navigating to dashboard")
      navigate("/dashboard")
    } catch (err) {
      console.error("Auth error:", err)
      setError("Server error. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full items-center">
        {/* Hero Section */}
        <div className="space-y-6 text-center lg:text-left">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("login.welcomeTo")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 dark:from-yellow-400 dark:to-orange-500">
              {t("common.uvify")}
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">{t("login.intelligentSystem")}</p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            {featureCards.map((item, i) => (
              <div
                key={i}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-6 border border-yellow-200 dark:border-gray-700 transition-colors duration-300"
              >
                <div className={`${item.color} text-2xl mb-2`}>{item.icon}</div>
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-yellow-200 dark:border-gray-700 p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">{t("login.title")}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{t("login.subtitle")}</p>

            {error && (
              <div className="mb-4 text-red-600 dark:text-red-400 text-sm font-medium text-center">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder={t("login.email")}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent transition-colors duration-200"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t("login.password")}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent transition-colors duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  {showPassword ? t("common.hide") : t("common.show")}
                </button>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-yellow-500 cursor-pointer accent-yellow-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  {t("login.rememberMe")}
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-600 dark:from-yellow-600 dark:to-orange-700 text-white rounded-lg font-medium shadow-md hover:from-yellow-600 hover:to-orange-700 dark:hover:from-yellow-700 dark:hover:to-orange-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t("login.loggingIn") : t("login.loginButton")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
