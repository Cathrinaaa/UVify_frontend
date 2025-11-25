"use client"

import { useEffect, useState } from "react"
import { useUVData } from "../contexts/UVDataContext"
import { useLanguage } from "../contexts/LanguageContext"

export default function UVNotification() {
  const { getStats } = useUVData()
  const { t } = useLanguage()
  const [showNotification, setShowNotification] = useState(false)
  const [hasVibrated, setHasVibrated] = useState(false)
  const [hasPlayedSound, setHasPlayedSound] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState(() => {
    // Load settings from localStorage or use defaults
    const saved = localStorage.getItem('uvNotificationSettings')
    return saved ? JSON.parse(saved) : {
      soundEnabled: true,
      vibrationEnabled: true,
      volume: 0.7,
      highThreshold: 6,
      veryHighThreshold: 8,
      extremeThreshold: 11
    }
  })

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('uvNotificationSettings', JSON.stringify(notificationSettings))
  }, [notificationSettings])

  // Enhanced sound generation with better patterns
  const playNotificationSound = async (uvLevel) => {
    if (!notificationSettings.soundEnabled) return

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      gainNode.gain.setValueAtTime(notificationSettings.volume, audioContext.currentTime)

      if (uvLevel === 'extreme') {
        // Urgent triple beep pattern for extreme UV
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.15)
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.3)

        gainNode.gain.setValueAtTime(notificationSettings.volume, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)

        // Second beep
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()
        osc2.connect(gain2)
        gain2.connect(audioContext.destination)
        osc2.frequency.value = 1200
        gain2.gain.setValueAtTime(notificationSettings.volume, audioContext.currentTime + 0.15)
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25)
        osc2.start(audioContext.currentTime + 0.15)
        osc2.stop(audioContext.currentTime + 0.25)

        // Third beep
        const osc3 = audioContext.createOscillator()
        const gain3 = audioContext.createGain()
        osc3.connect(gain3)
        gain3.connect(audioContext.destination)
        osc3.frequency.value = 1200
        gain3.gain.setValueAtTime(notificationSettings.volume, audioContext.currentTime + 0.3)
        gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
        osc3.start(audioContext.currentTime + 0.3)
        osc3.stop(audioContext.currentTime + 0.4)

      } else if (uvLevel === 'veryHigh') {
        // Double beep with descending tone for very high UV
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.15)
        gainNode.gain.setValueAtTime(notificationSettings.volume, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.15)

        // Second beep
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()
        osc2.connect(gain2)
        gain2.connect(audioContext.destination)
        osc2.frequency.setValueAtTime(950, audioContext.currentTime + 0.2)
        osc2.frequency.exponentialRampToValueAtTime(850, audioContext.currentTime + 0.35)
        gain2.gain.setValueAtTime(notificationSettings.volume, audioContext.currentTime + 0.2)
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35)
        osc2.start(audioContext.currentTime + 0.2)
        osc2.stop(audioContext.currentTime + 0.35)

      } else {
        // Single ascending tone for high UV
        oscillator.frequency.setValueAtTime(700, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(notificationSettings.volume, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      }
    } catch (error) {
      console.warn('Audio notification failed:', error)
    }
  }

  // Enhanced vibration patterns
  const triggerVibration = (uvLevel) => {
    if (!notificationSettings.vibrationEnabled || !("vibrate" in navigator)) return

    if (uvLevel === 'extreme') {
      navigator.vibrate([300, 100, 300, 100, 300]) // Triple vibration
    } else if (uvLevel === 'veryHigh') {
      navigator.vibrate([250, 150, 250]) // Double vibration
    } else {
      navigator.vibrate([200]) // Single vibration
    }
  }

  useEffect(() => {
    const stats = getStats()
    const currentUV = stats.currentReading

    let shouldShowNotification = false
    let uvLevel = null

    if (currentUV !== null) {
      if (currentUV >= notificationSettings.extremeThreshold) {
        shouldShowNotification = true
        uvLevel = 'extreme'
      } else if (currentUV >= notificationSettings.veryHighThreshold) {
        shouldShowNotification = true
        uvLevel = 'veryHigh'
      } else if (currentUV >= notificationSettings.highThreshold) {
        shouldShowNotification = true
        uvLevel = 'high'
      }
    }

    if (shouldShowNotification) {
      setShowNotification(true)

      if (!hasPlayedSound && uvLevel) {
        playNotificationSound(uvLevel)
        setHasPlayedSound(true)
      }

      if (!hasVibrated && uvLevel) {
        triggerVibration(uvLevel)
        setHasVibrated(true)
      }
    } else {
      setShowNotification(false)
      setHasVibrated(false)
      setHasPlayedSound(false)
    }
  }, [getStats, hasVibrated, hasPlayedSound, notificationSettings])

  if (!showNotification) return null

  const stats = getStats()
  const currentUV = stats.currentReading

  const getUVLevel = (uvi) => {
    if (uvi >= 11)
      return {
        level: t("latest.extreme"),
        color: "bg-purple-600",
        textColor: "text-purple-700",
        borderColor: "border-purple-500",
        bgLight: "bg-purple-50",
        textLight: "text-purple-700",
      }
    if (uvi >= 8)
      return {
        level: t("latest.veryHigh"),
        color: "bg-red-600",
        textColor: "text-red-700",
        borderColor: "border-red-500",
        bgLight: "bg-red-50",
        textLight: "text-red-700",
      }
    return {
      level: t("latest.high"),
      color: "bg-orange-500",
      textColor: "text-orange-700",
      borderColor: "border-orange-500",
      bgLight: "bg-orange-50",
      textLight: "text-orange-700",
    }
  }

  const uvInfo = getUVLevel(currentUV)

  const [showSettings, setShowSettings] = useState(false)

  const updateNotificationSetting = (key, value) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="w-11/12 max-w-sm sm:max-w-md mx-2 pointer-events-auto animate-bounce">
          <div
            className={`${uvInfo.bgLight} dark:${uvInfo.color}/30 border-2 ${uvInfo.borderColor} dark:border-opacity-60 rounded-xl shadow-2xl p-3 sm:p-4`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 ${uvInfo.color} rounded-full flex items-center justify-center animate-pulse`}>
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className={`${uvInfo.textLight} dark:text-orange-400 font-bold text-lg`}>
                  {t("notification.highUVAlert") || "High UV Alert!"}
                </h3>
                <p className={`${uvInfo.textColor} dark:text-orange-500 text-sm mt-1`}>
                  {t("notification.currentUV") || "Current UV Index"}:{" "}
                  <span className="font-bold">{currentUV.toFixed(1)}</span> ({uvInfo.level})
                </p>
                <p className={`${uvInfo.textColor} dark:text-orange-400 text-xs mt-2`}>
                  {t("notification.protectionAdvice") || "Wear sunscreen, protective clothing, and seek shade!"}
                </p>

                {/* Notification status indicators */}
                <div className="flex items-center gap-2 mt-3 text-xs">
                  {notificationSettings.soundEnabled && <span className="text-green-600">🔊 Sound</span>}
                  {notificationSettings.vibrationEnabled && <span className="text-blue-600">📳 Vibration</span>}
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-auto"
                  >
                    ⚙️ Settings
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className={`flex-shrink-0 ${uvInfo.textColor} hover:${uvInfo.textColor} dark:text-orange-400 dark:hover:text-orange-300 transition-colors`}
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            {/* Collapsible Settings Panel */}
            {showSettings && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-300 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Notification Settings</h4>

                <div className="space-y-3">
                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-700 dark:text-gray-300">Sound Alerts</label>
                    <button
                      onClick={() => updateNotificationSetting('soundEnabled', !notificationSettings.soundEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.soundEnabled ? 'bg-green-600' : 'bg-gray-400'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Volume Slider */}
                  {notificationSettings.soundEnabled && (
                    <div>
                      <label className="text-xs text-gray-700 dark:text-gray-300">Volume: {Math.round(notificationSettings.volume * 100)}%</label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={notificationSettings.volume}
                        onChange={(e) => updateNotificationSetting('volume', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                  )}

                  {/* Vibration Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-700 dark:text-gray-300">Vibration</label>
                    <button
                      onClick={() => updateNotificationSetting('vibrationEnabled', !notificationSettings.vibrationEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.vibrationEnabled ? 'bg-blue-600' : 'bg-gray-400'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* UV Thresholds */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">UV Alert Thresholds</label>

                    <div className="grid grid-cols-3 gap-1 sm:gap-2 text-xs">
                      <div>
                        <label className="text-gray-600 dark:text-gray-400">High</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={notificationSettings.highThreshold}
                          onChange={(e) => updateNotificationSetting('highThreshold', parseInt(e.target.value))}
                          className="w-full px-1 sm:px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-400">Very High</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={notificationSettings.veryHighThreshold}
                          onChange={(e) => updateNotificationSetting('veryHighThreshold', parseInt(e.target.value))}
                          className="w-full px-1 sm:px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-400">Extreme</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={notificationSettings.extremeThreshold}
                          onChange={(e) => updateNotificationSetting('extremeThreshold', parseInt(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
