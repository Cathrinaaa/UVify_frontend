import { useEffect, useState } from "react";

function App() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch latest reading
  const fetchLatest = async () => {
    try {
      const res = await fetch("https://uvify-backend.onrender.com/latest");
      const data = await res.json();
      setLatest(data);
    } catch (err) {
      console.error("Error fetching latest:", err);
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    try {
      const res = await fetch("https://uvify-backend.onrender.com/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // Load on mount + refresh every 5s
  useEffect(() => {
    fetchLatest();
    fetchHistory();
    const interval = setInterval(() => {
      fetchLatest();
      fetchHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        🌞 UV Index Dashboard
      </h1>

      {/* Latest Reading */}
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md mb-6 text-center">
        {latest ? (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Latest Reading
            </h2>
            <p className="text-gray-600">📅 {latest.date} ⏰ {latest.time}</p>
            <p className="text-5xl font-bold text-blue-500 my-4">
              {latest.uvi}
            </p>
            <p className="text-lg font-medium text-gray-700">
              Level: {latest.level}
            </p>
          </>
        ) : (
          <p className="text-gray-500">No data yet...</p>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">History</h2>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="py-2 px-3 border">Date</th>
                  <th className="py-2 px-3 border">Time</th>
                  <th className="py-2 px-3 border">UVI</th>
                  <th className="py-2 px-3 border">Level</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="text-center">
                    <td className="py-2 px-3 border">{h.date}</td>
                    <td className="py-2 px-3 border">{h.time}</td>
                    <td className="py-2 px-3 border">{h.uvi}</td>
                    <td className="py-2 px-3 border">{h.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No history yet...</p>
        )}
      </div>
    </div>
  );
}

export default App;
