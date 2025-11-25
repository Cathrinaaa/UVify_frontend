"use client"

import { useLanguage } from "../contexts/LanguageContext"
import { useUVData } from "../contexts/UVDataContext"
import GeminiUVSuggestions from "../components/GeminiUVSuggestions"

export default function DashboardHome() {
  const { t } = useLanguage()
  const { getStats, lastUpdate } = useUVData()
  const stats = getStats()

  const getArrayTranslation = (key) => {
    const value = t(key)
    return Array.isArray(value) ? value : []
  }

  const quickStats = [
    {
      title: t("dashboard.todaysPeak"),
      value: stats.todaysPeak !== null ? stats.todaysPeak.toFixed(1) : "--",
      unit: t("common.uvIndexLabel"),
      icon: "📈",
      color: "from-orange-400 to-red-500",
      textColor: "text-orange-700 dark:text-orange-400",
      time: stats.todaysPeakTime,
    },
    {
      title: t("dashboard.currentReading"),
      value: stats.currentReading !== null ? stats.currentReading.toFixed(1) : "--",
      unit: t("common.uvIndexLabel"),
      icon: "☀️",
      color: "from-yellow-400 to-orange-500",
      textColor: "text-yellow-700 dark:text-yellow-400",
    },
    {
      title: t("dashboard.avgThisWeek"),
      value: stats.avgThisWeek !== null ? stats.avgThisWeek : "--",
      unit: t("common.uvIndexLabel"),
      icon: "📊",
      color: "from-blue-400 to-cyan-500",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    {
      title: t("dashboard.totalReadings"),
      value: stats.totalReadings > 0 ? stats.totalReadings.toLocaleString() : "--",
      unit: t("dashboard.readings"),
      icon: "🔢",
      color: "from-purple-400 to-pink-500",
      textColor: "text-purple-700 dark:text-purple-400",
    },
  ]
  const infoCards = getArrayTranslation("dashboard.infoCards")
  const uvAnalytics = getArrayTranslation("dashboard.analyticsCards")
  const analyticsStyles = [
    {
      bgLight: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-500",
      color: "bg-green-500",
      textColor: "text-green-700 dark:text-green-400",
    },
    {
      bgLight: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-500",
      color: "bg-yellow-500",
      textColor: "text-yellow-700 dark:text-yellow-400",
    },
    {
      bgLight: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-500",
      color: "bg-orange-500",
      textColor: "text-orange-700 dark:text-orange-400",
    },
    {
      bgLight: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-500",
      color: "bg-red-500",
      textColor: "text-red-700 dark:text-red-400",
    },
    {
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-500",
      color: "bg-purple-500",
      textColor: "text-purple-700 dark:text-purple-400",
    },
  ]
  const styledAnalytics = uvAnalytics.map((item, index) => ({
    ...analyticsStyles[Math.min(index, analyticsStyles.length - 1)],
    ...item,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-700 dark:text-orange-400">
            {t("dashboard.welcome")}
          </h1>
          <p className="text-sm sm:text-base text-orange-600 dark:text-orange-500 mt-1">
            {t("dashboard.monitorUVLevels")}
          </p>
          {lastUpdate && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("common.lastUpdated")}: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-orange-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl sm:text-3xl">{stat.icon}</span>
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${stat.color} opacity-20`}
              ></div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium mb-1">{stat.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-bold ${stat.textColor}`}>{stat.value}</span>
              <span className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm">{stat.unit}</span>
            </div>

            {stat.title === t("dashboard.todaysPeak") && stat.time && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t("common.at")} {stat.time}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* UV Index Information Section */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-700 shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
          <span>ℹ️</span>
          {t("dashboard.infoTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {infoCards.map((card, idx) => (
            <div key={card.title ?? idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-blue-700 dark:text-blue-400 text-sm sm:text-base mb-2">{card.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{card.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-orange-700 dark:text-orange-400 mb-3 sm:mb-4 flex items-center gap-2">
          <span>📊</span>
          {t("dashboard.analyticsTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {styledAnalytics.map((item, index) => (
            <div
              key={`${item.range}-${index}`}
              className={`${item.bgLight} rounded-lg sm:rounded-xl p-4 sm:p-5 border-2 ${item.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold ${item.textColor}`}>{item.level}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    UV Index: <span className="font-semibold">{item.range}</span>
                  </p>
                </div>
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${item.color} rounded-full flex items-center justify-center shadow-md flex-shrink-0`}
                >
                  <span className="text-white text-lg sm:text-xl font-bold">{item.range.split("-")[0]}</span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("dashboard.riskLabel")}:
                  </span>
                  <span className={`text-xs sm:text-sm font-bold ${item.textColor}`}>{item.risk}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("dashboard.burnTimeLabel")}:
                  </span>
                  <span className={`text-xs sm:text-sm font-bold ${item.textColor}`}>{item.burnTime}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t("dashboard.recommendationsLabel")}:
                </p>
                <ul className="space-y-1">
                  {item.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                      <span className="text-orange-500 mt-0.5 flex-shrink-0">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UV Safety Tips */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-orange-200 dark:border-orange-800">
        <h2 className="text-xl sm:text-2xl font-bold text-orange-700 dark:text-orange-400 mb-3 sm:mb-4 flex items-center gap-2">
          <span>💡</span>
          {t("dashboard.uvSafetyTips")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">🧴</span>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-400 text-sm sm:text-base">
                {t("dashboard.useSunscreen")}
              </h3>
              <p className="text-orange-700 dark:text-orange-500 text-xs sm:text-sm">{t("dashboard.sunscreenTip")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">🕶️</span>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-400 text-sm sm:text-base">
                {t("dashboard.wearProtection")}
              </h3>
              <p className="text-orange-700 dark:text-orange-500 text-xs sm:text-sm">{t("dashboard.protectionTip")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">⏰</span>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-400 text-sm sm:text-base">
                {t("dashboard.avoidPeakHours")}
              </h3>
              <p className="text-orange-700 dark:text-orange-500 text-xs sm:text-sm">{t("dashboard.peakHoursTip")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0">🌳</span>
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-400 text-sm sm:text-base">
                {t("dashboard.seekShade")}
              </h3>
              <p className="text-orange-700 dark:text-orange-500 text-xs sm:text-sm">{t("dashboard.shadeTip")}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
