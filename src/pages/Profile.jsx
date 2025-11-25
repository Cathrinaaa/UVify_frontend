// ======================================================
// 🌤️ Profile.jsx — Read-Only Profile (Improved Design)
// ======================================================
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../main";
import { useLanguage } from "../contexts/LanguageContext";

export default function Profile() {
  const { t } = useLanguage();
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // ✅ Fetch latest user data from backend
  useEffect(() => {
    if (!user?.user_id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(
          `https://uvify-backend.onrender.com/profile/${user.user_id}`
        );
        const data = await res.json();

        if (data.success && data.user) {
          setFormData({
            firstName: data.user.first_name || "",
            lastName: data.user.last_name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
          });
          if (updateUser) updateUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };

    fetchUser();
  }, [user?.user_id, updateUser]);

  // ✅ Joined date (from backend or localStorage fallback)
  const joinedDate = user?.created_at
    ? new Date(user.created_at)
    : new Date(localStorage.getItem("joinedDate") || Date.now());

  if (!localStorage.getItem("joinedDate")) {
    localStorage.setItem("joinedDate", joinedDate.toISOString());
  }

  // ✅ User initials for avatar
  const getUserInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
    }
    return "JD";
  };

  // ======================================================
  // 🧱 UI Layout (Read-Only, Enhanced Design)
  // ======================================================
  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Page Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 dark:from-orange-400 dark:to-yellow-400 mb-2">
          {t('profile.title')}
        </h1>
        <p className="text-orange-600 dark:text-orange-400 text-sm">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-orange-100 dark:border-gray-700 overflow-hidden transition-transform hover:scale-[1.01] duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-600 p-10 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-28 h-28 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white shadow-lg mb-4">
            <span className="text-4xl text-white font-extrabold">
              {getUserInitials()}
            </span>
          </div>

          {/* Name */}
          <h2 className="text-3xl text-white font-bold">
            {formData.firstName} {formData.lastName}
          </h2>
          <p className="text-white/90 italic">{t('profile.uvEnthusiast')}</p>

          {/* Joined Date */}
          <p className="text-white/80 text-sm mt-2">
            📅 {t('profile.joined')}{" "}
            {joinedDate.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            • {joinedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Info Section */}
        <div className="p-8 bg-orange-50/60 dark:bg-gray-700/60">
          <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 border-b border-orange-200 dark:border-gray-600 pb-3 mb-6">
            {t('profile.personalInfo')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-orange-600 dark:text-orange-400 mb-1">
                {t('profile.firstName')}
              </label>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-4 py-3 border border-orange-100 dark:border-gray-600 text-orange-900 dark:text-gray-200">
                {formData.firstName || <span className="text-orange-400">{t('profile.notSet')}</span>}
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-orange-600 dark:text-orange-400 mb-1">
                {t('profile.lastName')}
              </label>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-4 py-3 border border-orange-100 dark:border-gray-600 text-orange-900 dark:text-gray-200">
                {formData.lastName || <span className="text-orange-400">{t('profile.notSet')}</span>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-orange-600 dark:text-orange-400 mb-1">
                {t('profile.email')}
              </label>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-4 py-3 border border-orange-100 dark:border-gray-600 text-orange-900 dark:text-gray-200 break-all">
                {formData.email || <span className="text-orange-400">{t('profile.notSet')}</span>}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-orange-600 dark:text-orange-400 mb-1">
                {t('profile.phone')}
              </label>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm px-4 py-3 border border-orange-100 dark:border-gray-600 text-orange-900 dark:text-gray-200">
                {formData.phone || <span className="text-orange-400">{t('profile.notSet')}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
