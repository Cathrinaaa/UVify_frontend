"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from "recharts"
import { useLanguage } from "../contexts/LanguageContext"
import { useUVData } from "../contexts/UVDataContext"
import { useMemo } from "react"

const RISK_LINES = [
  { value: 3, label: "Low" },
  { value: 6, label: "Moderate" },
  { value: 8, label: "High" },
  { value: 11, label: "Extreme" },
]

export default function UVAnalyticsChart({ history }) {
  const { t } = useLanguage()
  const { history: contextHistory } = useUVData()
  const historyData = useMemo(() => history ?? contextHistory ?? [], [history, contextHistory])

  const recentReadings = useMemo(() => {
    return historyData.slice(-20).map((item) => ({
      time: item.time?.substring(0, 5) || "--:--",
      label: `${item.date ?? ""} ${item.time ?? ""}`.trim(),
      uvi: Number.parseFloat(item.uvi) || 0,
    }))
  }, [historyData])

  const dailyAverages = useMemo(() => {
    const dailyMap = {}
    historyData.forEach((item) => {
      if (!dailyMap[item.date]) {
        dailyMap[item.date] = { total: 0, count: 0 }
      }
      dailyMap[item.date].total += Number.parseFloat(item.uvi) || 0
      dailyMap[item.date].count += 1
    })

    return Object.entries(dailyMap)
      .slice(-7)
      .map(([date, info]) => ({
        date: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        avgUVI: Number.parseFloat((info.total / info.count).toFixed(1)),
      }))
  }, [historyData])

  const highestEvent = useMemo(() => {
    if (!historyData.length) return null
    return historyData.reduce((best, item) => {
      const value = Number.parseFloat(item.uvi) || 0
      if (!best || value > best.value) {
        return {
          value,
          date: item.date,
          time: item.time,
        }
      }
      return best
    }, null)
  }, [historyData])

  const highestUV = useMemo(() => {
    if (!highestEvent) return "0.0"
    return highestEvent.value.toFixed(1)
  }, [highestEvent])

  const highestTimestamp = useMemo(() => {
    if (!highestEvent?.date) return null
    const isoString = `${highestEvent.date}T${highestEvent.time || "00:00:00"}`
    const parsed = new Date(isoString)
    if (Number.isNaN(parsed.getTime())) {
      return `${highestEvent.date} ${highestEvent.time || ""}`.trim()
    }
    return parsed.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
  }, [highestEvent])

  const averageUV = useMemo(() => {
    if (!historyData.length) return "0.0"
    const total = historyData.reduce((sum, d) => sum + (Number.parseFloat(d.uvi) || 0), 0)
    return Number.parseFloat(total / historyData.length).toFixed(1)
  }, [historyData])

  if (!historyData.length) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        {t("analytics.noData")}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-orange-200 dark:border-gray-700">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400">📊 {t("analytics.title")}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{t("analytics.description")}</p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t("analytics.chartTitle")}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Last {recentReadings.length} readings</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={recentReadings}>
              <defs>
                <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="time" tick={{ fill: "#666" }} />
              <YAxis
                tick={{ fill: "#666" }}
                domain={[0, Math.max(12, Number(highestUV) + 1)]}
                label={{ value: t("common.uvIndexLabel"), angle: -90, position: "insideLeft", fill: "#666" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-orange-300 dark:border-orange-600 rounded-lg shadow-lg">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{point.label}</p>
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          {t("common.uvIndexLabel")}: <span className="font-bold">{point.uvi}</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area type="monotone" dataKey="uvi" stroke="#f97316" fillOpacity={1} fill="url(#uvGradient)" strokeWidth={3} />
              {RISK_LINES.map((line) => (
                <ReferenceLine
                  key={line.value}
                  y={line.value}
                  stroke="#e5e7eb"
                  strokeDasharray="4 4"
                  label={{ position: "right", value: line.label, fill: "#9ca3af", fontSize: 10 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {dailyAverages.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{t("analytics.avgPerDay")}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyAverages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fill: "#666" }} />
                <YAxis tick={{ fill: "#666" }} domain={[0, Math.max(12, ...dailyAverages.map((d) => d.avgUVI + 1))]} />
                <Tooltip />
                <Bar dataKey="avgUVI" fill="#fb923c" radius={[6, 6, 0, 0]} name={t("analytics.avgPerDay")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("analytics.highestUV")}</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{highestUV}</p>
          {highestTimestamp && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("analytics.highestUVTime")} {highestTimestamp}
            </p>
          )}
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("analytics.averageUV")}</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{averageUV}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("analytics.dataPoints")}</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{historyData.length}</p>
        </div>
      </div>
    </div>
  )
}
