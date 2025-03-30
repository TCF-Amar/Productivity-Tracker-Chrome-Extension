import { useEffect, useState } from "react";

const Dashboard = () => {
  const [siteTime, setSiteTime] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we're in a Chrome extension environment
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        chrome.runtime.sendMessage({ action: "getSiteTime" }, (response) => {
          if (response) {
            setSiteTime(response);
          }
          setLoading(false);
        });
      } catch (err) {
        setError("Failed to get site data");
        setLoading(false);
      }
    } else {
      setError("This component requires the Chrome extension environment");
      setLoading(false);
    }
  }, []);

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <h2 className="text-lg font-bold mb-3">Time Spent on Websites</h2>
      {loading ? (
        <p className="text-gray-400">Loading data...</p>
      ) : error ? (
        <div className="text-red-400">
          <p>{error}</p>
          <p className="text-sm mt-2">Please load this as a Chrome extension to see real data.</p>
        </div>
      ) : Object.keys(siteTime).length === 0 ? (
        <p className="text-gray-400">No website activity tracked yet.</p>
      ) : (
        <ul className="space-y-2">
          {Object.keys(siteTime)
            .sort((a, b) => siteTime[b] - siteTime[a])
            .map((site) => (
              <li key={site} className="bg-gray-700 p-2 rounded flex justify-between">
                <span className="truncate mr-2">{site}</span>
                <span className="font-bold whitespace-nowrap">{formatTime(siteTime[site])}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
