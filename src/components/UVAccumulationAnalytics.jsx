"use client"

import { useState } from "react"
import { useUVData } from "../contexts/UVDataContext"
import { useLanguage } from "../contexts/LanguageContext"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts"

// Helper function to calculate burn time based on UV index
const calculateBurnTime = (uvIndex) => {
  const value = Number.parseFloat(uvIndex)
  if (value <= 2) return "~60 minutes"
  if (value <= 5) return "~30-45 minutes"
  if (value <= 7) return "~15-25 minutes"
  if (value <= 10) return "~15 minutes"
  return "<10 minutes"
}

const getRiskLevel = (uvIndex) => {
  const value = Number.parseFloat(uvIndex)
  if (value <= 2) return "Low"
  if (value <= 5) return "Moderate"
  if (value <= 7) return "High"
  if (value <= 10) return "Very High"
  return "Extreme"
}

// Helper function to calculate safe exposure time based on skin type
const getSafeExposureTime = (skinType) => {
  const skinTypes = {
    1: 10, // Very fair skin, always burns
    2: 15, // Fair skin, usually burns
    3: 20, // Fair to medium, sometimes burns
    4: 25, // Medium skin, rarely burns
    5: 30, // Brown skin, rarely burns
    6: 40, // Dark brown/black skin, never burns
  }
  return skinTypes[skinType] || 20 // Default to medium skin
}

// Helper function to calculate time until reaching accumulation threshold
const calculateTimeToThreshold = (currentAccumulation, threshold, currentUVRate) => {
  if (currentUVRate <= 0) return null
  const remaining = threshold - currentAccumulation
  if (remaining <= 0) return 0 // Already reached
  const hoursToThreshold = remaining / currentUVRate
  return Math.max(0, hoursToThreshold)
}

export default function UVAccumulationAnalytics() {
  const { getStats } = useUVData()
  const { t } = useLanguage()

  const calculateAccumulation = () => {
    const stats = getStats()
    const now = new Date()
    const todayStr = now.toISOString().split("T")[0]

    // Get last 7 days
    const lastWeek = new Date(now)
    lastWeek.setDate(now.getDate() - 7)

    // Get last 30 days
    const lastMonth = new Date(now)
    lastMonth.setDate(now.getDate() - 30)

    // Calculate accumulated UV for today
    const todayAccumulated = stats.todaysReadings.reduce((sum, item) => sum + Number.parseFloat(item.uvi || 0), 0)

    // Calculate accumulated UV for week
    const weekAccumulated = stats.weekReadings.reduce((sum, item) => sum + Number.parseFloat(item.uvi || 0), 0)

    // Calculate accumulated UV for month
    const monthReadings =
      stats.history?.filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate >= lastMonth && itemDate <= now
      }) || []

    const monthAccumulated = monthReadings.reduce((sum, item) => sum + Number.parseFloat(item.uvi || 0), 0)

    // Calculate daily accumulation trend for chart
    const dailyAccumulationData = []
    const last7Days = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayReadings = stats.history?.filter(item => item.date === dateStr) || []
      const dayAccumulation = dayReadings.reduce((sum, item) => sum + Number.parseFloat(item.uvi || 0), 0)

      dailyAccumulationData.push({
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        accumulation: Number(dayAccumulation.toFixed(1)),
        readings: dayReadings.length
      })
      last7Days.push(...dayReadings)
    }

    // Calculate current UV rate (UV per hour)
    const currentUVRate = stats.currentReading || 0

    // Calculate projections
    const todayProjection = calculateTimeToThreshold(todayAccumulated, 10, currentUVRate) // 10 UV threshold for high risk
    const weekProjection = calculateTimeToThreshold(weekAccumulated, 30, currentUVRate) // 30 UV threshold for week

    return {
      todayAccumulated: todayAccumulated.toFixed(1),
      weekAccumulated: weekAccumulated.toFixed(1),
      monthAccumulated: monthAccumulated.toFixed(1),
      todayReadings: stats.todaysReadings.length,
      weekReadings: stats.weekReadings.length,
      monthReadings: monthReadings.length,
      dailyAccumulationData,
      currentUVRate,
      todayProjection,
      weekProjection,
    }
  }

  const accumulation = calculateAccumulation()

  // Helper function to get current average UV for burn time estimation
  const getCurrentAverageUV = (periodAccumulation, readingsCount) => {
    if (readingsCount === 0) return 0
    return (Number.parseFloat(periodAccumulation) / readingsCount).toFixed(1)
  }

  // Skin type data for personalized risk assessment
  const skinTypes = {
    1: { name: "Very Fair Skin", burnTime: 10, tanAbility: "Always burns, never tans", protection: "Very High" },
    2: { name: "Fair Skin", burnTime: 15, tanAbility: "Usually burns, tans minimally", protection: "High" },
    3: { name: "Fair to Medium Skin", burnTime: 20, tanAbility: "Sometimes burns, tans uniformly", protection: "Medium-High" },
    4: { name: "Medium Skin", burnTime: 25, tanAbility: "Rarely burns, tans well", protection: "Medium" },
    5: { name: "Brown Skin", burnTime: 30, tanAbility: "Rarely burns, tans deeply", protection: "Medium-Low" },
    6: { name: "Dark Brown/Black Skin", burnTime: 40, tanAbility: "Never burns, tans deeply", protection: "Low" }
  }

  // Get user's skin type from localStorage or default to 3
  const [userSkinType, setUserSkinType] = useState(() => {
    return parseInt(localStorage.getItem('userSkinType')) || 3
  })

  // Sunscreen application tracking
  const [lastSunscreenApplication, setLastSunscreenApplication] = useState(() => {
    const saved = localStorage.getItem('lastSunscreenApplication')
    return saved ? new Date(saved) : null
  })
  const [sunscreenSPF, setSunscreenSPF] = useState(() => {
    return parseInt(localStorage.getItem('sunscreenSPF')) || 30
  })

  // Calculate when sunscreen needs reapplication
  const getSunscreenReminder = () => {
    if (!lastSunscreenApplication) {
      return {
        needsReapplication: true,
        message: "Apply sunscreen before sun exposure",
        urgency: "high",
        timeRemaining: null
      }
    }

    const now = new Date()
    const hoursSinceApplication = (now - lastSunscreenApplication) / (1000 * 60 * 60)
    const currentUVRate = accumulation.currentUVRate || 0

    // Base reapplication time depends on SPF and UV intensity
    let baseHours = 2 // Default 2 hours
    if (sunscreenSPF >= 50) baseHours = 4
    else if (sunscreenSPF >= 30) baseHours = 2.5
    else if (sunscreenSPF >= 15) baseHours = 2

    // Adjust for UV intensity - higher UV means faster degradation
    if (currentUVRate > 8) baseHours *= 0.75 // 25% reduction for very high UV
    else if (currentUVRate > 6) baseHours *= 0.85 // 15% reduction for high UV

    // Adjust for skin type - fair skin needs more frequent application
    if (userSkinType <= 2) baseHours *= 0.9 // 10% more frequent for very fair skin

    const needsReapplication = hoursSinceApplication >= baseHours
    const timeRemaining = baseHours - hoursSinceApplication

    let message = ""
    let urgency = "low"

    if (needsReapplication) {
      if (timeRemaining < -2) {
        message = "Overdue for sunscreen reapplication!"
        urgency = "high"
      } else {
        message = "Time to reapply sunscreen"
        urgency = "medium"
      }
    } else {
      if (timeRemaining <= 0.5) {
        message = "Reapply sunscreen soon"
        urgency = "medium"
      } else {
        message = `Reapply sunscreen in ${Math.round(timeRemaining * 60)} minutes`
        urgency = "low"
      }
    }

    return {
      needsReapplication,
      message,
      urgency,
      timeRemaining: timeRemaining > 0 ? timeRemaining : null,
      hoursSinceApplication: hoursSinceApplication.toFixed(1)
    }
  }

  const reminder = getSunscreenReminder()

  const applySunscreen = () => {
    const now = new Date()
    setLastSunscreenApplication(now)
    localStorage.setItem('lastSunscreenApplication', now.toISOString())
  }

  // Personalized risk calculation based on skin type
  const calculatePersonalizedRisk = (accumulation, skinType) => {
    const skinData = skinTypes[skinType] || skinTypes[3]
    const accumulationValue = Number.parseFloat(accumulation)

    // Calculate risk multiplier based on skin type (fair skin = higher risk)
    const riskMultiplier = 7 - skinType // Type 1 = 6x risk, Type 6 = 1x risk

    // Base risk levels adjusted for skin type
    let riskLevel = "Low"
    let riskScore = accumulationValue * riskMultiplier

    if (riskScore > 100) riskLevel = "Very High"
    else if (riskScore > 50) riskLevel = "High"
    else if (riskScore > 25) riskLevel = "Moderate"
    else riskLevel = "Low"

    // Calculate estimated burn time for this accumulation
    const estimatedBurnTime = skinData.burnTime / (accumulationValue / 5) // Assuming 5 UV is baseline

    return {
      skinType: skinData,
      riskLevel,
      riskScore: riskScore.toFixed(1),
      estimatedBurnTime: estimatedBurnTime > 0 ? estimatedBurnTime.toFixed(1) : "N/A",
      personalizedAdvice: getPersonalizedAdvice(skinType, accumulationValue)
    }
  }

  // Get personalized advice based on skin type and accumulation
  const getPersonalizedAdvice = (skinType, accumulation) => {
    const advice = []

    if (skinType <= 2) { // Very fair to fair skin
      advice.push("Your skin is highly sensitive to UV radiation")
      if (accumulation > 5) {
        advice.push("Apply SPF 50+ sunscreen every 2 hours")
        advice.push("Wear UPF 50+ protective clothing")
      }
    } else if (skinType <= 4) { // Medium skin tones
      advice.push("Your skin has moderate UV sensitivity")
      if (accumulation > 10) {
        advice.push("Consider SPF 30+ sunscreen for extended outdoor time")
      }
    } else { // Dark skin tones
      advice.push("Your skin has natural UV protection")
      advice.push("Still use sunscreen during prolonged sun exposure")
    }

    // Common advice based on accumulation
    if (accumulation > 15) {
      advice.push("Limit outdoor time between 10 AM - 4 PM")
      advice.push("Seek shade whenever possible")
    }

    return advice
  }

  const todayAvgUV = getCurrentAverageUV(accumulation.todayAccumulated, accumulation.todayReadings)
  const weekAvgUV = getCurrentAverageUV(accumulation.weekAccumulated, accumulation.weekReadings)
  const monthAvgUV = getCurrentAverageUV(accumulation.monthAccumulated, accumulation.monthReadings)

  const getAccumulationLevel = (accumulated) => {
    const value = Number.parseFloat(accumulated)
    if (value <= 10)
      return {
        level: "Low",
        color: "green",
        icon: "✅",
        description: "Minimal sun exposure. Your skin is well protected.",
        recommendation: "Continue normal outdoor activities with basic sun protection.",
        healthImpact: "Very low risk of skin damage or sunburn.",
        healthRisks: [
          "Minimal risk of UV-related illnesses",
          "Skin damage is unlikely at this level",
          "No immediate health concerns from UV exposure",
        ],
        preventionActions: [
          "Maintain your current sun protection habits",
          "Apply SPF 15+ sunscreen when outdoors",
          "Continue checking UV levels daily",
        ],
      }
    if (value <= 30)
      return {
        level: "Moderate",
        color: "yellow",
        icon: "⚠️",
        description: "Moderate cumulative sun exposure detected.",
        recommendation: "Apply SPF 30+ sunscreen and wear protective clothing when outdoors.",
        healthImpact: "Some UV exposure accumulation. Light tanning may occur.",
        healthRisks: [
          "Risk of accelerated skin aging (premature wrinkles, age spots)",
          "Potential for minor sun burns if exposure continues",
          "Early signs of sun damage may develop",
          "Risk of photoaging - skin texture changes",
        ],
        preventionActions: [
          "Use SPF 30+ broad-spectrum sunscreen daily",
          "Reapply sunscreen every 2 hours or after swimming",
          "Wear protective clothing (long sleeves, pants)",
          "Limit outdoor time during peak hours (10 AM - 4 PM)",
          "Wear a wide-brimmed hat and UV-blocking sunglasses",
        ],
      }
    if (value <= 60)
      return {
        level: "High",
        color: "orange",
        icon: "⚠️",
        description: "Significant cumulative UV exposure over this period.",
        recommendation:
          "Use high SPF sunscreen (50+), seek shade during peak hours (10AM-4PM), and wear full sun protection.",
        healthImpact: "Noticeable risk of sunburn and skin damage. Extra caution advised.",
        healthRisks: [
          "Increased risk of melanoma (skin cancer) development",
          "Risk of basal cell and squamous cell carcinoma",
          "Significant photoaging - visible wrinkles and age spots",
          "Risk of solar lentigines (sun spots/liver spots)",
          "Potential eye damage (cataracts) with long-term exposure",
          "Immunosuppression affecting skin's defense mechanisms",
        ],
        preventionActions: [
          "Apply SPF 50+ broad-spectrum sunscreen liberally",
          "Reapply every 1-2 hours or immediately after water exposure",
          "Seek shade whenever possible, especially 10 AM - 4 PM",
          "Wear protective UPF clothing, hats, and UV-blocking sunglasses",
          "Consider staying indoors during peak UV hours",
          "Schedule skin cancer screenings with a dermatologist",
          "Use lip balm with SPF 30+",
          "Avoid tanning beds and sun lamps",
        ],
      }
    return {
      level: "Very High",
      color: "red",
      icon: "🚨",
      description: "Excessive cumulative UV exposure. Immediate protective measures needed.",
      recommendation:
        "Limit outdoor time, use SPF 50+ sunscreen, wear hat/sunglasses, seek shade, and consider staying indoors during peak hours.",
      healthImpact: "High risk of significant skin damage, sunburn, and accelerated aging.",
      healthRisks: [
        "Very high risk of melanoma - most dangerous form of skin cancer",
        "Increased likelihood of basal cell carcinoma and squamous cell carcinoma",
        "Severe photoaging with deep wrinkles, leathery skin, and pigmentation changes",
        "High risk of solar keratosis (precancerous growths)",
        "Risk of pterygium (tissue growth on the eye)",
        "Photokeratitis (temporary eye damage from UV exposure)",
        "Skin texture degradation and permanent damage",
        "Immunosuppression affecting skin's defense mechanisms",
      ],
      preventionActions: [
        "Minimize outdoor exposure - stay indoors when possible",
        "Apply SPF 50+ waterproof sunscreen generously every 1-2 hours",
        "Wear protective UPF 50+ clothing and wide-brimmed hats",
        "Use UV-blocking sunglasses that block 99-100% of UVA/UVB",
        "Seek shade at all times, especially 10 AM - 4 PM",
        "Use umbrellas or sun shelters when outdoors",
        "Visit a dermatologist immediately for skin examination",
        "Perform monthly self-examinations using the ABCDE method for moles",
        "Consider vitamin D supplementation instead of sun exposure",
        "Avoid tanning beds and reflective surfaces that intensify UV",
        "Keep records of cumulative UV exposure for health monitoring",
      ],
    }
  }

  const todayLevel = getAccumulationLevel(accumulation.todayAccumulated)
  const weekLevel = getAccumulationLevel(accumulation.weekAccumulated)
  const monthLevel = getAccumulationLevel(accumulation.monthAccumulated)

  // Calculate personalized risks
  const todayPersonalized = calculatePersonalizedRisk(accumulation.todayAccumulated, userSkinType)
  const weekPersonalized = calculatePersonalizedRisk(accumulation.weekAccumulated, userSkinType)
  const monthPersonalized = calculatePersonalizedRisk(accumulation.monthAccumulated, userSkinType)

  const getColorClasses = (color) => {
    const colors = {
      green: "bg-green-50 border-green-200 text-green-700",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      red: "bg-red-50 border-red-200 text-red-700",
    }
    return colors[color] || colors.green
  }

  const getAverageDailyExposure = (periodAccumulation, daysCount) => {
    if (daysCount === 0) return 0
    return (Number.parseFloat(periodAccumulation) / daysCount).toFixed(1)
  }

  // Sunscreen Reminder Component
  const SunscreenReminder = () => {
    const getUrgencyColor = (urgency) => {
      switch (urgency) {
        case 'high': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200'
        case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200'
        default: return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200'
      }
    }

    const getUrgencyIcon = (urgency) => {
      switch (urgency) {
        case 'high': return '🚨'
        case 'medium': return '⚠️'
        default: return '✅'
      }
    }

    return (
      <div className={`p-3 sm:p-4 rounded-lg border mb-4 sm:mb-6 mx-2 sm:mx-0 ${getUrgencyColor(reminder.urgency)}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <span>🧴</span>
            Sunscreen Protection Status
          </h4>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
            <select
              value={sunscreenSPF}
              onChange={(e) => {
                const newSPF = parseInt(e.target.value)
                setSunscreenSPF(newSPF)
                localStorage.setItem('sunscreenSPF', newSPF.toString())
              }}
              className="text-xs sm:text-sm px-2 py-1 sm:px-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 w-full sm:w-auto"
            >
              <option value={15}>SPF 15</option>
              <option value={30}>SPF 30</option>
              <option value={50}>SPF 50</option>
              <option value={100}>SPF 100</option>
            </select>
            <button
              onClick={applySunscreen}
              className="text-xs sm:text-sm px-3 py-1 sm:px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Applied Now
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {getUrgencyIcon(reminder.urgency)} {reminder.message}
            </p>
            {lastSunscreenApplication && (
              <p className="text-xs opacity-75 mt-1">
                Last applied: {lastSunscreenApplication.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                ({reminder.hoursSinceApplication} hours ago)
              </p>
            )}
          </div>
          {reminder.timeRemaining && (
            <div className="text-right">
              <p className="text-xs opacity-75">Next reapplication:</p>
              <p className="text-sm font-bold">
                {reminder.timeRemaining < 1
                  ? `${Math.round(reminder.timeRemaining * 60)} min`
                  : `${reminder.timeRemaining.toFixed(1)} hrs`
                }
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-opacity-30">
          <p className="text-xs opacity-75">
            💡 <strong>Smart Reminders:</strong> Reapplication time adjusts based on your UV exposure, skin type, and sunscreen SPF.
            {reminder.needsReapplication && " Apply sunscreen now for continued protection!"}
          </p>
        </div>
      </div>
    )
  }

  // Enhanced chart component
  const AccumulationTrendChart = ({ data }) => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">📈 Daily UV Accumulation Trend</h4>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="accumulationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 12 }} />
          <YAxis tick={{ fill: "#666", fontSize: 12 }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 border border-blue-300 dark:border-blue-600 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      UV Accumulation: <span className="font-bold">{data.accumulation}</span>
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {data.readings} readings
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="accumulation"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#accumulationGradient)"
            strokeWidth={2}
          />
          <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "High Risk", position: "topRight", fill: "#ef4444", fontSize: 10 }} />
          <ReferenceLine y={6} stroke="#f97316" strokeDasharray="5 5" label={{ value: "Moderate", position: "topRight", fill: "#f97316", fontSize: 10 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )

  // Skin Type Selector Component
  const SkinTypeSelector = () => (
    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-3 sm:p-4 rounded-lg border border-teal-200 dark:border-teal-700 mb-4 sm:mb-6 mx-2 sm:mx-0">
      <h3 className="text-sm font-semibold text-teal-900 dark:text-teal-200 mb-3">👤 Your Skin Type (Personalized Risk Assessment)</h3>
      <select
        value={userSkinType}
        onChange={(e) => {
          const newSkinType = parseInt(e.target.value)
          setUserSkinType(newSkinType)
          localStorage.setItem('userSkinType', newSkinType.toString())
        }}
        className="w-full px-3 py-2 text-sm border border-teal-300 dark:border-teal-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      >
        {Object.entries(skinTypes).map(([key, skinType]) => (
          <option key={key} value={key}>
            Type {key}: {skinType.name} - {skinType.tanAbility}
          </option>
        ))}
      </select>
      <p className="text-xs text-teal-700 dark:text-teal-300 mt-2">
        <strong>Current Selection:</strong> {skinTypes[userSkinType].name} • {skinTypes[userSkinType].tanAbility} • Protection Level: {skinTypes[userSkinType].protection}
      </p>
      <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
        💡 This affects your personalized UV risk assessment and burn time estimates
      </p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-orange-200 mt-4 sm:mt-6 mx-2 sm:mx-0">
      <h2 className="text-xl font-semibold mb-2 text-orange-700">📈 {t("analytics.accumulationTitle")}</h2>
      <p className="text-sm text-gray-600 mb-6">{t("analytics.accumulationDescription")}</p>

      {/* Skin Type Selector */}
      <SkinTypeSelector />

      {/* Sunscreen Reminder */}
      <SunscreenReminder />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Today's Accumulation */}
        <div className={`p-3 sm:p-4 rounded-lg border-2 ${getColorClasses(todayLevel.color)}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">{todayLevel.icon} Today</h3>
            <span className="text-xs font-medium px-2 py-1 bg-white rounded">
              {accumulation.todayReadings} readings
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">{accumulation.todayAccumulated}</p>
          <p className="text-xs opacity-75 mb-2">Accumulated UV Index</p>
          <p className="text-xs font-medium mb-3">{todayLevel.level} Exposure</p>
          <div className="border-t pt-3 mt-3">
            <p className="text-xs font-semibold mb-1">What this means:</p>
            <p className="text-xs leading-relaxed text-gray-700">{todayLevel.description}</p>

            <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
              <p className="text-xs font-semibold text-amber-900 mb-1">⏱️ Today's Estimated Burn Time:</p>
              <p className="text-xs text-amber-800">
                <span className="font-bold">{calculateBurnTime(todayAvgUV)}</span> (Average UV: {todayAvgUV})
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Risk Level: <span className="font-semibold">{getRiskLevel(todayAvgUV)}</span>
              </p>
            </div>

            <p className="text-xs mt-2 text-gray-600">
              <span className="font-semibold">Recommendation:</span> {todayLevel.recommendation}
            </p>
            {/* Personalized Risk Assessment */}
            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-semibold text-teal-700 mb-1">👤 Your Personalized Risk (Skin Type {userSkinType}):</p>
              <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded border border-teal-200 dark:border-teal-700 mb-2">
                <p className="text-xs text-teal-800 dark:text-teal-200">
                  <span className="font-bold">Risk Level:</span> {todayPersonalized.riskLevel} ({todayPersonalized.riskScore} risk score)
                </p>
                <p className="text-xs text-teal-800 dark:text-teal-200 mt-1">
                  <span className="font-bold">Estimated Burn Time:</span> ~{todayPersonalized.estimatedBurnTime} minutes unprotected
                </p>
              </div>
            </div>

            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-semibold text-red-700 mb-1">⚠️ Possible Health Risks:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                {todayLevel.healthRisks.map((risk, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-semibold text-green-700 mb-1">✅ What You Should Do:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                {todayLevel.preventionActions.map((action, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
              {todayPersonalized.personalizedAdvice.length > 0 && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                  <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">🎯 Personalized for Your Skin Type:</p>
                  <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    {todayPersonalized.personalizedAdvice.map((advice, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">💡</span>
                        <span>{advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Week's Accumulation */}
        <div className={`p-3 sm:p-4 rounded-lg border-2 ${getColorClasses(weekLevel.color)}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">{weekLevel.icon} This Week</h3>
            <span className="text-xs font-medium px-2 py-1 bg-white rounded">{accumulation.weekReadings} readings</span>
          </div>
          <p className="text-3xl font-bold mb-1">{accumulation.weekAccumulated}</p>
          <p className="text-xs opacity-75 mb-2">Accumulated UV Index</p>
          <p className="text-xs font-medium mb-3">{weekLevel.level} Exposure</p>
          <div className="border-t pt-3 mt-3">
            <p className="text-xs font-semibold mb-1">Weekly Average:</p>
            <p className="text-xs text-gray-700 mb-2">
              ~{getAverageDailyExposure(accumulation.weekAccumulated, Math.max(accumulation.weekReadings / 3, 1))} UV
              per day
            </p>

            <div className="p-2 bg-amber-50 rounded border border-amber-200 mb-2">
              <p className="text-xs font-semibold text-amber-900 mb-1">⏱️ Weekly Avg Burn Time:</p>
              <p className="text-xs text-amber-800">
                <span className="font-bold">{calculateBurnTime(weekAvgUV)}</span> (Average UV: {weekAvgUV})
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Risk Level: <span className="font-semibold">{getRiskLevel(weekAvgUV)}</span>
              </p>
            </div>

            <p className="text-xs leading-relaxed text-gray-700">{weekLevel.description}</p>
            {/* Personalized Risk Assessment */}
            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-semibold text-teal-700 mb-1">👤 Your Weekly Risk (Skin Type {userSkinType}):</p>
              <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded border border-teal-200 dark:border-teal-700 mb-2">
                <p className="text-xs text-teal-800 dark:text-teal-200">
                  <span className="font-bold">Risk Level:</span> {weekPersonalized.riskLevel} ({weekPersonalized.riskScore} risk score)
                </p>
              </div>
            </div>

            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-semibold text-red-700 mb-1">⚠️ Possible Health Risks:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                {weekLevel.healthRisks.map((risk, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-semibold text-green-700 mb-1">✅ What You Should Do:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                {weekLevel.preventionActions.map((action, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Month's Accumulation */}
        <div className={`p-3 sm:p-4 rounded-lg border-2 ${getColorClasses(monthLevel.color)}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">{monthLevel.icon} This Month</h3>
            <span className="text-xs font-medium px-2 py-1 bg-white rounded">
              {accumulation.monthReadings} readings
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">{accumulation.monthAccumulated}</p>
          <p className="text-xs opacity-75 mb-2">Accumulated UV Index</p>
          <p className="text-xs font-medium mb-3">{monthLevel.level} Exposure</p>
          <div className="border-t pt-3 mt-3">
            <p className="text-xs font-semibold mb-1">Monthly Trend:</p>
            <p className="text-xs text-gray-700 mb-2">
              ~{getAverageDailyExposure(accumulation.monthAccumulated, 30)} UV per day average
            </p>

            <div className="p-2 bg-amber-50 rounded border border-amber-200 mb-2">
              <p className="text-xs font-semibold text-amber-900 mb-1">⏱️ Monthly Avg Burn Time:</p>
              <p className="text-xs text-amber-800">
                <span className="font-bold">{calculateBurnTime(monthAvgUV)}</span> (Average UV: {monthAvgUV})
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Risk Level: <span className="font-semibold">{getRiskLevel(monthAvgUV)}</span>
              </p>
            </div>

            <p className="text-xs leading-relaxed text-gray-700">{monthLevel.description}</p>
            {/* Personalized Risk Assessment */}
            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-semibold text-teal-700 mb-1">👤 Your Monthly Risk (Skin Type {userSkinType}):</p>
              <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded border border-teal-200 dark:border-teal-700 mb-2">
                <p className="text-xs text-teal-800 dark:text-teal-200">
                  <span className="font-bold">Risk Level:</span> {monthPersonalized.riskLevel} ({monthPersonalized.riskScore} risk score)
                </p>
              </div>
            </div>

            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-semibold text-red-700 mb-1">⚠️ Possible Health Risks:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                {monthLevel.healthRisks.map((risk, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 border-t pt-2">
              <p className="text-xs font-semibold text-green-700 mb-1">✅ What You Should Do:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                {monthLevel.preventionActions.map((action, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Trend Chart */}
      <AccumulationTrendChart data={accumulation.dailyAccumulationData} />

      {/* Projections and Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">⏰ Time to High Risk Threshold</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-700 dark:text-purple-300">Today's 10 UV limit:</span>
              <span className="text-sm font-bold text-purple-900 dark:text-purple-200">
                {accumulation.todayProjection === null ? "No current UV" :
                 accumulation.todayProjection === 0 ? "Already reached" :
                 accumulation.todayProjection < 1 ?
                 `< ${Math.round(accumulation.todayProjection * 60)} min` :
                 `~${accumulation.todayProjection.toFixed(1)} hrs`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-700 dark:text-purple-300">Week's 30 UV limit:</span>
              <span className="text-sm font-bold text-purple-900 dark:text-purple-200">
                {accumulation.weekProjection === null ? "No current UV" :
                 accumulation.weekProjection === 0 ? "Already reached" :
                 `~${accumulation.weekProjection.toFixed(1)} hrs`}
              </span>
            </div>
            <div className="mt-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-purple-300 dark:border-purple-600">
              <p className="text-xs text-purple-800 dark:text-purple-300">
                <span className="font-semibold">Current UV Rate:</span> {accumulation.currentUVRate.toFixed(1)} UV/hour
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-700">
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">🎯 Daily UV Goals</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-700 dark:text-green-300">Safe daily limit:</span>
              <span className="text-sm font-bold text-green-900 dark:text-green-200">≤ 5 UV</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-700 dark:text-green-300">Today's progress:</span>
              <span className={`text-sm font-bold ${Number(accumulation.todayAccumulated) > 5 ? 'text-red-600' : 'text-green-600'}`}>
                {accumulation.todayAccumulated} UV ({Number(accumulation.todayAccumulated) > 5 ? 'Over' : 'Under'})
              </span>
            </div>
            <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${Number(accumulation.todayAccumulated) > 5 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, (Number(accumulation.todayAccumulated) / 5) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-2">
              💡 Aim to stay under 5 UV units per day for optimal skin health
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg mx-2 sm:mx-0">
        <p className="text-sm font-semibold text-blue-900 mb-2">💡 Understanding Accumulated UV Index</p>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Accumulated UV shows total sun exposure over time, not just peak readings</li>
          <li>• Higher values indicate greater cumulative skin stress and damage risk</li>
          <li>• Monitor trends: Consistently high values mean you need stronger protection habits</li>
          <li>• Use this data to adjust your sun protection strategy for better skin health</li>
          <li>• <strong>New:</strong> Track your daily progress against safe UV limits</li>
          <li>• <strong>New:</strong> Get time projections until reaching high-risk thresholds</li>
        </ul>
      </div>

      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg mx-2 sm:mx-0">
        <p className="text-sm font-semibold text-purple-900 mb-2">🏥 Current Health Impact</p>
        <p className="text-sm text-purple-800">{monthLevel.healthImpact}</p>
      </div>
    </div>
  )
}
