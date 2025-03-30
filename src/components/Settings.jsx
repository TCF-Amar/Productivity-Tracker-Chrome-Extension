import { useEffect, useState } from "react";
import { saveData, getData } from "../utils/storage";

const Settings = () => {
  const [goals, setGoals] = useState({
    dailyGoal: "",
    websiteTimeLimit: "",
    limitWebsite: ""
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    getData("productivitySettings", (data) => {
      if (data && Object.keys(data).length > 0) {
        setGoals(data);
      }
    });
  }, []);

  const saveGoals = () => {
    try {
      saveData("productivitySettings", goals);
      setStatusMessage("Settings saved successfully!");
      setMessageType("success");

      // Clear message after 3 seconds
      setTimeout(() => {
        setStatusMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setStatusMessage("Failed to save settings");
      setMessageType("error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGoals(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetData = () => {
    if (confirm("Are you sure you want to reset all tracking data? This cannot be undone.")) {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({ action: "resetStats" }, (response) => {
            if (response && response.success) {
              setStatusMessage("All tracking data has been reset");
              setMessageType("success");
            }
          });
        } else {
          setStatusMessage("Cannot reset data outside of extension context");
          setMessageType("error");
        }
      } catch (error) {
        console.error("Error resetting data:", error);
        setStatusMessage("Failed to reset data");
        setMessageType("error");
      }
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg mt-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Settings</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-400 hover:text-white"
        >
          {isExpanded ? "Hide" : "Show"}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="mb-3">
            <label className="block text-sm mb-1">Daily Productivity Goal</label>
            <input
              type="text"
              name="dailyGoal"
              value={goals.dailyGoal}
              onChange={handleInputChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
              placeholder="e.g., Complete 3 tasks"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm mb-1">Website to Limit</label>
            <input
              type="text"
              name="limitWebsite"
              value={goals.limitWebsite}
              onChange={handleInputChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
              placeholder="e.g., facebook.com"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm mb-1">Daily Time Limit (minutes)</label>
            <input
              type="number"
              name="websiteTimeLimit"
              value={goals.websiteTimeLimit}
              onChange={handleInputChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
              placeholder="e.g., 30"
              min="1"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={saveGoals}
              className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Settings
            </button>

            <button
              onClick={resetData}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-800"
            >
              Reset Data
            </button>
          </div>
        </>
      )}

      {statusMessage && (
        <div className={`mt-3 p-2 rounded text-center ${messageType === "success" ? "bg-green-800" : "bg-red-800"}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default Settings;
