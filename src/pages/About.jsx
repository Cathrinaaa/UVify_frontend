"use client"

import { useLanguage } from "../contexts/LanguageContext"

export default function About() {
  const { t } = useLanguage()

  const teamMembers = [
    {
      name: "Fritz Gerald Tacanay",
      role: "Lead Developer & Project Manager",
      roleKey: "about.leadDeveloper",
      description: "Passionate about UV monitoring technology and health innovation",
      descriptionKey: "about.alexDesc",
      image: "/ilad.png",
    },
    {
      name: "Rossellah Marie Bodaño",
      role: "UI/UX Designer & Frontend Developer",
      roleKey: "about.designerDeveloper",
      description: "Creating beautiful and intuitive user experiences for health tech",
      descriptionKey: "about.mariaDesc",
      image: "/lheng.jpg",
    },
    {
      name: "Cathrina Lapuz",
      role: "Backend Developer & Data Specialist",
      roleKey: "about.backendDeveloper",
      description: "Building robust systems to track and analyze UV radiation data",
      descriptionKey: "about.jamesDesc",
      image: "/cath.jpg",
    },
    {
      name: "Flix Vixen Barbero",
      role: "QA & Product Strategist",
      roleKey: "about.qaStrategist",
      description: "Ensuring quality and driving the vision of safer sun protection",
      descriptionKey: "about.sofiaDesc",
      image: "/flix.jpg",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 dark:from-orange-400 dark:to-yellow-400 bg-clip-text text-transparent">
          {t("about.title")}
        </h1>
        <p className="text-lg text-orange-600 dark:text-orange-400 max-w-2xl mx-auto">{t("about.subtitle")}</p>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-8 border border-orange-200 dark:border-orange-600/30">
        <h2 className="text-2xl font-bold text-orange-700 dark:text-orange-400 mb-4">{t("about.ourMission")}</h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{t("about.missionText")}</p>
      </div>

      {/* Values Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "about.innovation", desc: "about.innovationDesc", icon: "💡" },
          { title: "about.health", desc: "about.healthDesc", icon: "❤️" },
          { title: "about.accessibility", desc: "about.accessibilityDesc", icon: "🌍" },
          { title: "about.reliability", desc: "about.reliabilityDesc", icon: "🔒" },
        ].map((value, index) => (
          <div
            key={index}
            className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 border border-orange-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="text-4xl mb-3">{value.icon}</div>
            <h3 className="font-bold text-orange-700 dark:text-orange-400 mb-2">{t(value.title)}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t(value.desc)}</p>
          </div>
        ))}
      </div>

      {/* Team Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-700 dark:text-orange-400">{t("about.ourTeam")}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t("about.teamSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-orange-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {/* Team Member Image */}
              <div className="relative h-64 md:h-72 overflow-hidden bg-gradient-to-b from-yellow-100 to-orange-100 dark:from-orange-900/30 dark:to-yellow-900/30">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Team Member Info */}
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300">{member.name}</h3>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "about.usersProtected", value: "10K+", icon: "👥" },
          { label: "about.readingsTracked", value: "1M+", icon: "📊" },
          { label: "about.yearsFounded", value: "2024", icon: "🚀" },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-xl p-6 border border-orange-200 dark:border-orange-600/30 text-center"
          >
            <div className="text-4xl mb-3">{stat.icon}</div>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{stat.value}</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{t(stat.label)}</p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 dark:from-orange-600 dark:to-yellow-600 rounded-2xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-3">{t("about.joinUs")}</h3>
        <p className="mb-6 opacity-95">{t("about.joinUsDesc")}</p>
        <button className="bg-white text-orange-600 dark:text-orange-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-100 transition-colors duration-200 shadow-lg">
          {t("about.contactUs")}
        </button>
      </div>
    </div>
  )
}
