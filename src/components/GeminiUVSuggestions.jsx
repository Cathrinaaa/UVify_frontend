"use client"

import { useState, useEffect } from "react"
import { useUVData } from "../contexts/UVDataContext"
import { useLanguage } from "../contexts/LanguageContext"

export default function GeminiUVSuggestions() {
  const { getStats } = useUVData()
  const { t } = useLanguage()
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [accumulation, setAccumulation] = useState(null)

  const calculateTodayAccumulation = () => {
    const stats = getStats()
    const todayAccumulated = stats.todaysReadings.reduce((sum, item) => sum + Number.parseFloat(item.uvi || 0), 0)
    return Number.parseFloat(todayAccumulated.toFixed(2))
  }

  const fetchGeminiSuggestions = async () => {
    setLoading(true)
    setError(null)
    setSuggestions(null)

    try {
      const todayUV = calculateTodayAccumulation()
      setAccumulation(todayUV)

      const response = await fetch("https://uvify-backend.onrender.com/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uvData: {
            today: todayUV,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      const suggestionText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!suggestionText || suggestionText.trim() === "") {
        throw new Error("Empty suggestion received from API")
      }

      setSuggestions(suggestionText)
    } catch (err) {
      console.error("Gemini API Error:", err.message)
      setError(t("gemini.error"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGeminiSuggestions()
  }, [])

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-700 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">{t("gemini.title")}</h2>
        <button
          onClick={fetchGeminiSuggestions}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {loading ? t("gemini.loading") : t("gemini.refresh")}
        </button>
      </div>

      {accumulation !== null && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("gemini.accumulationLabel")}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {accumulation} {t("common.uvIndexLabel")}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-lg mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-blue-600 dark:text-blue-400">{t("gemini.generating")}</span>
        </div>
      )}

      {/* Suggestions display */}
      {suggestions && !loading && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {suggestions}
          </div>
        </div>
      )}

      {!loading && !suggestions && !error && accumulation !== null && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">{t("gemini.refreshHint")}</p>
        </div>
      )}

      {/* No data yet */}
      {!loading && accumulation === null && !suggestions && !error && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">{t("gemini.noData")}</p>
        </div>
      )}
    </div>
  )
}
