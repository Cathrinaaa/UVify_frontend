"use client"

// src/pages/Latest.jsx
import { useEffect, useState } from "react"
import UVGauge from "../components/UVGauge"
import UVAnalyticsChart from "../components/UVAnalyticsChart"
import UVAccumulationAnalytics from "../components/UVAccumulationAnalytics"
import { useLanguage } from "../contexts/LanguageContext"
import { useUVData } from "../contexts/UVDataContext"

export default function Latest() {
  const { t } = useLanguage()
  const { history: contextHistory, isConnected } = useUVData()
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isDeviceConnected, setIsDeviceConnected] = useState(true)

  const fetchLatestData = async () => {
    try {
      setError(null)
      const response = await fetch("https://uvify-backend.onrender.com/latest")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      if (data.message === "No data yet") {
        setLatest(null)
        setIsDeviceConnected(false)
      } else {
        setLatest(data)
        setIsDeviceConnected(true)
      }
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Error fetching latest data:", err)
      setError(t("latest.errorFetching"))
      setIsDeviceConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLatestData()
    const interval = setInterval(fetchLatestData, 5000)
    return () => clearInterval(interval)
  }, [])

  const getSafeUVValue = () => {
    if (!latest || !latest.uvi) return 0
    const uvValue = Number.parseFloat(latest.uvi)
    return isNaN(uvValue) ? 0 : Math.max(0, uvValue)
  }

  const getUVLevel = (uvi) => {
    if (uvi <= 2)
      return {
        level: t("latest.low"),
        color: "green",
        bgColor: "bg-green-50",
        textColor: "text-green-600",
        borderColor: "border-green-600",
      }
    if (uvi <= 5)
      return {
        level: t("latest.moderate"),
        color: "yellow",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-600",
        borderColor: "border-yellow-600",
      }
    if (uvi <= 7)
      return {
        level: t("latest.high"),
        color: "orange",
        bgColor: "bg-orange-50",
        textColor: "text-orange-600",
        borderColor: "border-orange-600",
      }
    if (uvi <= 10)
      return {
        level: t("latest.veryHigh"),
        color: "red",
        bgColor: "bg-red-50",
        textColor: "text-red-600",
        borderColor: "border-red-600",
      }
    return {
      level: t("latest.extreme"),
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-600",
    }
  }

  const uvValue = getSafeUVValue()
  const uvLevelInfo = getUVLevel(uvValue)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">{t("latest.loadingUVData")}</p>
      </div>
    )
  }

  if (error && !latest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
          <strong className="font-bold">{t("common.error")}: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={fetchLatestData}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {t("common.retry")}
        </button>
      </div>
    )
  }

  if (!latest) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-orange-800">🌞 {t("latest.title")}</h1>
        <p className="text-sm md:text-base text-gray-600 mb-4">{t("latest.subtitle")}</p>

        {/* Connectivity Status Banner */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-6 max-w-md w-full text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse mr-2"></div>
            <span className="font-semibold">⚠️ {t("latest.deviceNotConnected")}</span>
          </div>
          <p className="text-sm">{t("common.waitingForReadings")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-4xl w-full">
          {/* UV Gauge - showing 0 */}
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200">
              <UVGauge value={0} size={220} />
              <p className="text-center text-sm text-gray-500 mt-2">{t("latest.noDataYet")}</p>
            </div>
          </div>

          {/* Latest Data Details - placeholder */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200">
            <h2 className="text-xl font-semibold mb-4 text-orange-700">📊 {t("common.details")}</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-medium text-gray-700">📅 {t("latest.date")}:</span>
                <span className="font-semibold text-gray-400">--/--/----</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-medium text-gray-700">⏰ {t("latest.time")}:</span>
                <span className="font-semibold text-gray-400">--:--:--</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-medium text-gray-700">📈 {t("latest.uvIndex")}:</span>
                <span className="font-semibold text-lg text-gray-400">--</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">⚠️ {t("latest.level")}:</span>
                <span className="font-semibold text-gray-400">--</span>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                {t("common.waitingForFirstReading")}
              </p>
              <div className="flex items-center justify-center mt-2">
                <div className="w-2 h-2 rounded-full animate-pulse mr-2 bg-yellow-500"></div>
                <span className="text-xs font-medium text-yellow-600">{t("latest.deviceDisconnected")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* UV Analytics Chart */}
        <div className="mt-8 w-full max-w-4xl">
          <UVAnalyticsChart history={contextHistory} />
        </div>

        <div className="mt-8 w-full max-w-4xl">
          <UVAccumulationAnalytics />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-orange-800">🌞 {t("latest.title")}</h1>
      <p className="text-sm md:text-base text-gray-600 mb-4">{t("latest.subtitle")}</p>

      {/* Connectivity Status Banner */}
      {!isDeviceConnected && latest && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg mb-6 max-w-md w-full text-center">
          ⚠️ {t("common.disconnected")}
        </div>
      )}

      {isDeviceConnected && latest && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg mb-6 max-w-md w-full text-center">
          ✅ {t("common.connected")}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-4xl w-full">
        {/* UV Gauge */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200">
            <UVGauge value={uvValue} size={220} />
          </div>
        </div>

        {/* Latest Data Details */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-200">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">📊 {t("common.details")}</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="font-medium text-gray-700">📅 {t("latest.date")}:</span>
              <span className="font-semibold text-gray-900">{latest.date || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="font-medium text-gray-700">⏰ {t("latest.time")}:</span>
              <span className="font-semibold text-gray-900">{latest.time || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="font-medium text-gray-700">📈 {t("latest.uvIndex")}:</span>
              <span className="font-semibold text-lg text-gray-900">{latest.uvi}</span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${uvLevelInfo.bgColor}`}>
              <span className="font-medium text-gray-700">⚠️ {t("latest.level")}:</span>
              <span className={`font-semibold ${uvLevelInfo.textColor}`}>{uvLevelInfo.level}</span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              {t("latest.lastUpdated")}: {lastUpdated.toLocaleTimeString()}
            </p>
            <div className="flex items-center justify-center mt-2">
              <div
                className={`w-2 h-2 rounded-full animate-pulse mr-2 ${isDeviceConnected ? "bg-green-500" : "bg-yellow-500"}`}
              ></div>
              <span className={`text-xs font-medium ${isDeviceConnected ? "text-green-600" : "text-yellow-600"}`}>
                {isDeviceConnected ? t("latest.liveUpdating") : t("latest.showingCachedData")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* UV Analytics Chart - USES CONTEXT DATA NOW */}
      <div className="mt-8 w-full max-w-4xl">
        <UVAnalyticsChart history={contextHistory} />
      </div>

      {/* UV Accumulation Analytics */}
      <div className="mt-8 w-full max-w-4xl">
        <UVAccumulationAnalytics history={contextHistory} />
      </div>
    </div>
  )
}
