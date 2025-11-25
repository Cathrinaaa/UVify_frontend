"use client"

// pages/History.jsx
import { useEffect, useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { useUVData } from "../contexts/UVDataContext"

export default function History() {
  const { t } = useLanguage()
  const { history: contextHistory } = useUVData()
  const [filteredHistory, setFilteredHistory] = useState([])
  const [activeFilter, setActiveFilter] = useState("today")
  const [selectedDate, setSelectedDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const removeDuplicates = (data) => {
    const unique = new Map()
    data.forEach((item) => {
      const key = `${item.date}-${item.time}`
      if (!unique.has(key)) {
        unique.set(key, item)
      }
    })
    return Array.from(unique.values())
  }

  useEffect(() => {
    if (contextHistory.length > 0) {
      filterData(contextHistory, activeFilter, selectedDate || null)
    }
  }, [contextHistory])

  useEffect(() => {
    setCurrentPage(1)
  }, [filteredHistory])

  // Filter data based on selected time period or date
  const filterData = (data, period, customDate = null) => {
    const now = new Date()
    let filtered = []

    if (period === "custom" && customDate) {
      filtered = data.filter((item) => item.date === customDate)
    } else {
      switch (period) {
        case "today": {
          const todayStr = now.toISOString().split("T")[0]
          filtered = data.filter((item) => item.date === todayStr)
          break
        }
        case "yesterday": {
          const yesterday = new Date(now)
          yesterday.setDate(now.getDate() - 1)
          const yStr = yesterday.toISOString().split("T")[0]
          filtered = data.filter((item) => item.date === yStr)
          break
        }
        case "lastWeek": {
          const lastWeek = new Date(now)
          lastWeek.setDate(now.getDate() - 7)
          filtered = data.filter((item) => {
            const itemDate = new Date(item.date)
            return itemDate >= lastWeek && itemDate <= now
          })
          break
        }
        case "lastMonth": {
          const lastMonth = new Date(now)
          lastMonth.setMonth(now.getMonth() - 1)
          filtered = data.filter((item) => {
            const itemDate = new Date(item.date)
            return itemDate >= lastMonth && itemDate <= now
          })
          break
        }
        default:
          filtered = data
      }
    }

    const cleanedFiltered = removeDuplicates(filtered).sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`)
      const dateTimeB = new Date(`${b.date} ${b.time}`)
      return dateTimeB - dateTimeA
    })

    setFilteredHistory(cleanedFiltered)
    setActiveFilter(period)
  }

  const handleFilterClick = (period) => {
    setSelectedDate("")
    filterData(contextHistory, period)
  }

  const handleDateChange = (e) => {
    const selected = e.target.value
    setSelectedDate(selected)
    filterData(contextHistory, "custom", selected)
    setActiveFilter("custom")
  }

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageData = filteredHistory.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const getFilterLabel = (filter) => {
    switch (filter) {
      case "today":
        return t("history.today")
      case "yesterday":
        return t("history.yesterday")
      case "lastWeek":
        return t("history.lastWeek")
      case "lastMonth":
        return t("history.lastMonth")
      default:
        return filter
    }
  }

  const groupedByDate = () => {
    const grouped = {}
    currentPageData.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = []
      }
      grouped[item.date].push(item)
    })
    return grouped
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-orange-700 dark:text-orange-400">
        📊 {t("history.title")}
      </h1>

      {/* Navigation Filters */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {["today", "yesterday", "lastWeek", "lastMonth"].map((period) => (
            <button
              key={period}
              onClick={() => handleFilterClick(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === period
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50"
              }`}
            >
              {period === "today"
                ? t("history.today") || "Today"
                : period === "yesterday"
                  ? t("history.yesterday") || "Yesterday"
                  : period === "lastWeek"
                    ? t("history.lastWeek") || "Last Week"
                    : t("history.lastMonth") || "Last Month"}
            </button>
          ))}
        </div>

        {/* 🗓️ Date Picker */}
        <div className="flex items-center gap-2">
          <label htmlFor="date" className="text-sm font-medium text-orange-700 dark:text-orange-400">
            {t("history.pickDate") || "Pick a Date"}:
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border border-orange-300 dark:border-orange-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:border-orange-400 focus:ring-2 focus:ring-orange-300 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Results count */}
      <p className="mt-1 mb-4 text-sm text-gray-600 dark:text-gray-400">
        {t("common.showing")} {startIndex + 1}-{Math.min(endIndex, filteredHistory.length)} {t("common.of")}{" "}
        {filteredHistory.length} {t("common.records")}{" "}
        {activeFilter === "custom" && selectedDate && (
          <span className="text-orange-600 dark:text-orange-400">
            {t("history.forDate")} {new Date(selectedDate).toLocaleDateString()}
          </span>
        )}
      </p>

      {/* Table */}
      <div className="space-y-6">
        {filteredHistory.length === 0 ? (
          <div className="py-8 px-4 text-center text-gray-500 bg-white/80 dark:bg-gray-800/80 rounded-xl">
            {t("history.noRecords")}{" "}
            {activeFilter === "custom" ? new Date(selectedDate).toLocaleDateString() : getFilterLabel(activeFilter)}
          </div>
        ) : (
          Object.entries(groupedByDate()).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 mb-3">
                {new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md rounded-xl">
                  <thead>
                    <tr className="bg-orange-100 dark:bg-orange-900/30">
                      <th className="py-3 px-4 text-left text-orange-700 dark:text-orange-400">{t("history.time")}</th>
                      <th className="py-3 px-4 text-left text-orange-700 dark:text-orange-400">
                        {t("history.uvIndex")}
                      </th>
                      <th className="py-3 px-4 text-left text-orange-700 dark:text-orange-400">{t("history.level")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, i) => {
                      const getLevelColor = (level) => {
                        switch (level?.toLowerCase()) {
                          case "low":
                            return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                          case "moderate":
                            return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                          case "high":
                            return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                          case "very high":
                            return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                          case "extreme":
                            return "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20"
                          default:
                            return "text-gray-600 dark:text-gray-400"
                        }
                      }

                      return (
                        <tr key={i} className="border-b border-orange-200 dark:border-gray-700">
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.time}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.uvi}</td>
                          <td className={`py-3 px-4 font-semibold rounded-lg ${getLevelColor(item.level)}`}>
                            {item.level}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t("common.page")} {currentPage} {t("common.of")} {totalPages}
          </div>

          <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md py-3 z-50">
            <div className="flex justify-center items-center gap-2 sm:gap-3">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`min-w-[90px] px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  currentPage === 1
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {t("common.previous")}
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1 sm:gap-2">
                {[currentPage - 1, currentPage, currentPage + 1]
                  .filter((page) => page >= 1 && page <= totalPages)
                  .map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                        currentPage === pageNum
                          ? "bg-orange-500 text-white"
                          : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`min-w-[90px] px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  currentPage === totalPages
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {t("common.next")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
