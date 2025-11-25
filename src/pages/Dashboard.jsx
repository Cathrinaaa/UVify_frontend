"use client"

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, useRef, useContext } from "react"
import { AuthContext } from "../main"
import { useLanguage } from "../contexts/LanguageContext"
import { useTheme } from "../contexts/ThemeContext"
import UVNotification from "../components/UVNotification"

export default function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const dropdownRef = useRef(null)

  const { user, logout } = useContext(AuthContext)
  const { t, language, changeLanguage } = useLanguage()
  const { isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Only run on client side
    if (typeof document === "undefined") return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navigation = [
    { name: t("nav.home"), href: "/dashboard", icon: "🏠" },
    { name: t("nav.latest"), href: "/dashboard/latest", icon: "📊" },
    { name: t("nav.history"), href: "/dashboard/history", icon: "🕒" },
  ]

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/"
    }
    return location.pathname === path
  }

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    }
    return "JD"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative text-gray-900 dark:text-gray-100 transition-colors duration-300 pb-20 md:pb-0">
      <UVNotification />

      <header className="fixed top-0 left-0 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-orange-200 dark:border-gray-700 shadow-lg z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                <span className="text-xl md:text-2xl text-white">☀️</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 dark:from-orange-400 dark:to-yellow-400 bg-clip-text text-transparent">
                  {t("common.uvify")}
                </h1>
                <p className="text-xs text-orange-500 dark:text-orange-400 font-medium hidden md:block">
                  {t("common.uvMonitoringSystem")}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`relative flex items-center px-4 py-2 rounded-lg transition-all duration-300 group ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-orange-900/40 dark:to-yellow-900/40 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-600 shadow-md"
                      : "text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50/80 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span className="text-lg mr-2">{item.icon}</span>
                  {item.name}
                  {isActive(item.href) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-orange-500 rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 md:p-3 rounded-lg hover:bg-orange-50/80 dark:hover:bg-gray-700/50 transition-colors duration-200 min-h-[44px]"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm md:text-base font-bold">{getUserInitials()}</span>
                  </div>
                  <span className="text-orange-700 dark:text-orange-400 hidden lg:block font-medium">
                    {user ? `${user.first_name} ${user.last_name}` : "User"}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 md:w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-orange-200 dark:border-gray-700 py-2 z-50 transition-colors duration-300">
                    <div className="px-4 py-3 border-b border-orange-100 dark:border-gray-700">
                      <p className="text-sm md:text-base text-orange-800 dark:text-orange-400 font-semibold">
                        {user ? `${user.first_name} ${user.last_name}` : "User"}
                      </p>
                      <p className="text-xs md:text-sm text-orange-600 dark:text-orange-500">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center px-4 py-3 text-sm md:text-base text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-gray-700 min-h-[44px]"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="mr-2 text-lg">👤</span> {t("nav.profile")}
                    </Link>

                    <div className="px-4 py-3 border-t border-b border-orange-100 dark:border-gray-700">
                      <p className="text-xs md:text-sm text-orange-600 dark:text-orange-500 font-medium mb-3">
                        {t("settings.language")}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { code: "en", flag: "🇺🇸", label: t("settings.english") },
                          { code: "tl", flag: "🇵🇭", label: t("settings.tagalog") },
                          { code: "ilo", flag: "🇵🇭", label: t("settings.ilocano") },
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              changeLanguage(lang.code)
                              setIsDropdownOpen(false)
                            }}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                              language === lang.code
                                ? "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-orange-900/40 dark:to-yellow-900/40 text-orange-700 dark:text-orange-400 border-2 border-orange-400 dark:border-orange-500"
                                : "bg-orange-50 dark:bg-gray-700 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-gray-600 hover:bg-orange-100 dark:hover:bg-gray-600"
                            }`}
                          >
                            <span className="flex items-center">
                              <span className="text-lg mr-2">{lang.flag}</span>
                              {lang.label}
                            </span>
                            {language === lang.code && <span className="text-lg">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center text-left px-4 py-3 text-sm md:text-base text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-orange-50 dark:hover:bg-gray-700 border-t border-orange-100 dark:border-gray-700 mt-2 min-h-[44px]"
                    >
                      <span className="mr-2 text-lg">🚪</span> {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-orange-200 dark:border-gray-700 shadow-lg z-50 md:hidden transition-colors duration-300">
        <div className="flex justify-center px-2 py-2">
          <div className="grid grid-cols-3 gap-3 max-w-xs">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 min-h-[60px] ${
                  isActive(item.href)
                    ? "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-orange-900/40 dark:to-yellow-900/40 text-orange-700 dark:text-orange-400 shadow-md border border-orange-300 dark:border-orange-600"
                    : "text-orange-600 dark:text-orange-400 hover:bg-orange-50/80 dark:hover:bg-gray-700/50"
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium text-center">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 relative z-10 mt-16 md:mt-20 transition-colors duration-300">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/40 to-orange-200/40 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl md:rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-orange-200/60 dark:border-gray-700/60 shadow-lg overflow-hidden transition-colors duration-300">
            <div className="min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-12rem)] p-4 md:p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      <footer className="hidden md:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-orange-200 dark:border-gray-700 shadow-sm mt-8 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md"></div>
              <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                © 2025 {t("common.uvify")}. {t("dashboard.protectingSince")}
              </span>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 text-sm font-medium transition-colors duration-200"
              >
                {t("dashboard.privacyPolicy")}
              </a>
              <a
                href="#"
                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 text-sm font-medium transition-colors duration-200"
              >
                {t("dashboard.termsOfService")}
              </a>
              <a
                href="#"
                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 text-sm font-medium transition-colors duration-200"
              >
                {t("dashboard.support")}
              </a>
            </div>
          </div>
        </div>
      </footer>

      <div className="hidden md:block fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full px-8 py-3 border border-orange-300 dark:border-gray-600 shadow-lg transition-colors duration-300">
          <div className="flex items-center space-x-6 text-sm text-orange-700 dark:text-orange-400 font-medium">
            <span className="flex items-center">
              <span className="mr-2">🕒</span>
              {currentTime.toLocaleTimeString()}
            </span>
            <span className="w-px h-6 bg-orange-300 dark:bg-gray-600"></span>
            <span className="flex items-center text-green-600 dark:text-green-400">
              <span className="mr-2">🌡️</span>
              {t("dashboard.realTimeActive")}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
