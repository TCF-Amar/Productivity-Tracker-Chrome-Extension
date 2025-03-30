import { useEffect, useState } from "react";
import { getData } from "../utils/storage";

const Analytics = () => {
  const [productivityData, setProductivityData] = useState({
    siteTime: {},
    goals: {},
    timerStats: { sessionsCompleted: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all data we need for analytics
    Promise.all([
      new Promise(resolve => getData("siteTime", resolve)),
      new Promise(resolve => getData("productivitySettings", resolve)),
      new Promise(resolve => getData("timerStats", resolve))
    ]).then(([siteTime, settings, timerStats]) => {
      setProductivityData({
        siteTime: siteTime || {},
        goals: settings || {},
        timerStats: timerStats || { sessionsCompleted: 0 }
      });
      setLoading(false);
    });
  }, []);

  const formatTime = (seconds) => {
    if (!seconds) return "0m";

    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const getTotalTimeSpent = () => {
    return Object.values(productivityData.siteTime).reduce((total, time) => total + time, 0);
  };

  const getTopSites = (limit = 5) => {
    return Object.entries(productivityData.siteTime)
      .sort(([, timeA], [, timeB]) => timeB - timeA)
      .slice(0, limit);
  };

  const calculateProductivityScore = () => {
    const totalTime = getTotalTimeSpent();
    if (totalTime === 0) return 0;

    // Calculate score based on time spent on productive vs. unproductive sites
    // This is a simple example - you can expand with more sophisticated logic
    const limitedSite = productivityData.goals.limitWebsite;
    const timeOnLimitedSite = limitedSite ? (productivityData.siteTime[limitedSite] || 0) : 0;

    // Calculate percentage of time NOT spent on limited sites
    const productiveTimeRatio = (totalTime - timeOnLimitedSite) / totalTime;
    return Math.round(productiveTimeRatio * 100);
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-800 text-white min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Loading analytics...</h1>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-800 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Productivity Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Productivity Score */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Productivity Score</h2>
          <div className="flex items-center">
            <div className="w-24 h-24 relative rounded-full flex items-center justify-center bg-gray-800">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#444"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2"
                  strokeDasharray={`${calculateProductivityScore()}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                {calculateProductivityScore()}%
              </div>
            </div>
            <div className="ml-4">
              <p className="text-gray-400">
                {productivityData.timerStats.sessionsCompleted} focus sessions completed
              </p>
              <p className="text-gray-400">
                Total browsing: {formatTime(getTotalTimeSpent())}
              </p>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Goals</h2>
          <div>
            <p className="mb-2">
              <span className="text-gray-400">Daily Goal: </span>
              <span className="font-medium">{productivityData.goals.dailyGoal || "Not set"}</span>
            </p>
            {productivityData.goals.limitWebsite && (
              <div className="mb-2">
                <p>
                  <span className="text-gray-400">Limit for {productivityData.goals.limitWebsite}: </span>
                  <span className="font-medium">{productivityData.goals.websiteTimeLimit || 0} minutes</span>
                </p>
                <div className="mt-1 w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${((productivityData.siteTime[productivityData.goals.limitWebsite] || 0) / 60) >
                        (parseInt(productivityData.goals.websiteTimeLimit) || 0)
                        ? 'bg-red-600'
                        : 'bg-blue-600'
                      }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (((productivityData.siteTime[productivityData.goals.limitWebsite] || 0) / 60) /
                          (parseInt(productivityData.goals.websiteTimeLimit) || 1)) * 100
                      )}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(productivityData.siteTime[productivityData.goals.limitWebsite] || 0)} used
                  {productivityData.goals.websiteTimeLimit && ` / ${productivityData.goals.websiteTimeLimit}m limit`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Sites */}
        <div className="bg-gray-900 p-6 rounded-lg col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Top Sites</h2>
          <div className="space-y-4">
            {getTopSites().length === 0 ? (
              <p className="text-gray-400">No website activity recorded yet.</p>
            ) : (
              getTopSites().map(([site, time], index) => (
                <div key={site} className="flex items-center">
                  <div className="w-6 text-gray-400">{index + 1}.</div>
                  <div className="flex-1 ml-3">
                    <div className="flex justify-between mb-1">
                      <span>{site}</span>
                      <span className="text-gray-400">{formatTime(time)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-blue-600"
                        style={{
                          width: `${(time / getTotalTimeSpent()) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
