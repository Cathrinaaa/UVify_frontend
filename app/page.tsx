export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center p-8">
      <div className="max-w-2xl bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-3xl">☀️</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              UVify Dashboard
            </h1>
            <p className="text-orange-600 font-medium">UV Monitoring System</p>
          </div>
        </div>

        <div className="space-y-4 text-gray-700">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h2 className="font-semibold text-blue-900 mb-2">📋 Project Information</h2>
            <p className="text-sm text-blue-800">
              This is a <strong>Vite + React</strong> application for UV monitoring and tracking.
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h2 className="font-semibold text-green-900 mb-2">✅ Changes Made</h2>
            <p className="text-sm text-green-800 mb-2">
              The theme toggle and language selector have been successfully moved to the Settings page:
            </p>
            <ul className="text-sm text-green-800 list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Settings Page</strong>: Now includes language selector (English, Tagalog, Ilocano)
              </li>
              <li>
                <strong>Settings Page</strong>: Theme toggle (Light/Dark mode) is available
              </li>
              <li>
                <strong>Dashboard Header</strong>: Kept the theme and language controls for quick access
              </li>
            </ul>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <h2 className="font-semibold text-orange-900 mb-2">🚀 How to Run Your App</h2>
            <p className="text-sm text-orange-800 mb-3">
              Since this is a Vite application, you'll need to run it locally or deploy it:
            </p>
            <div className="bg-white rounded p-3 border border-orange-200">
              <p className="text-xs font-mono text-gray-600 mb-2">Install dependencies:</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block mb-3">npm install</code>

              <p className="text-xs font-mono text-gray-600 mb-2">Run development server:</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded block">npm run dev</code>
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <h2 className="font-semibold text-purple-900 mb-2">📁 Modified Files</h2>
            <ul className="text-sm text-purple-800 list-disc list-inside space-y-1 ml-2">
              <li>
                <code className="bg-purple-100 px-1 rounded">src/pages/Settings.jsx</code> - Added language selector
                section
              </li>
              <li>
                <code className="bg-purple-100 px-1 rounded">src/pages/Dashboard.jsx</code> - Kept controls in header
                for convenience
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Download the ZIP file using the menu in the top right to get all your updated
              files, or push to GitHub to save your changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
