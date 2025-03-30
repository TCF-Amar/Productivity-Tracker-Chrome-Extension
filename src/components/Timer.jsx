import { useState, useEffect } from "react";
import { saveData, getData } from "../utils/storage";

const TIMER_PRESETS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

const Timer = () => {
  const [time, setTime] = useState(TIMER_PRESETS.pomodoro);
  const [initialTime, setInitialTime] = useState(TIMER_PRESETS.pomodoro);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("pomodoro");
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    getData("timerStats", (data) => {
      if (data && data.sessionsCompleted) {
        setSessionsCompleted(data.sessionsCompleted);
      }
    });
  }, []);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            completeSession();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = (timerType) => {
    setRunning(false);
    setMode(timerType);
    setTime(TIMER_PRESETS[timerType]);
    setInitialTime(TIMER_PRESETS[timerType]);
  };

  const completeSession = () => {
    setRunning(false);

    // Only count completed pomodoros
    if (mode === "pomodoro") {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      saveData("timerStats", { sessionsCompleted: newCount });

      // Play notification sound
      try {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
        audio.play();
      } catch (err) {
        console.log("Could not play notification sound");
      }

      // Show browser notification if permitted
      if (Notification.permission === "granted") {
        new Notification("Pomodoro Completed!", {
          body: "Time for a break!",
          icon: "/icon.png"
        });
      }
    }
  };

  const calculateProgress = () => {
    return ((initialTime - time) / initialTime) * 100;
  };

  const requestNotificationPermission = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg mt-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">Focus Timer</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-400 hover:text-white"
        >
          {isExpanded ? "Hide" : "Show"}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="relative h-2 bg-gray-700 rounded mb-4">
            <div
              className="absolute h-2 bg-green-500 rounded"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>

          <h3 className="text-3xl font-bold text-center my-3">
            {formatTime(time)}
          </h3>

          <div className="flex justify-center space-x-2 mb-4">
            <button
              onClick={() => resetTimer('pomodoro')}
              className={`px-3 py-1 rounded text-sm ${mode === 'pomodoro' ? 'bg-red-600' : 'bg-gray-700'}`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => resetTimer('shortBreak')}
              className={`px-3 py-1 rounded text-sm ${mode === 'shortBreak' ? 'bg-green-600' : 'bg-gray-700'}`}
            >
              Short Break
            </button>
            <button
              onClick={() => resetTimer('longBreak')}
              className={`px-3 py-1 rounded text-sm ${mode === 'longBreak' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Long Break
            </button>
          </div>

          <div className="flex justify-center mb-3">
            <button
              onClick={() => setRunning(!running)}
              className={`px-6 py-2 rounded font-bold ${running ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {running ? "Pause" : time === 0 ? "Restart" : "Start"}
            </button>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-400 mt-2">
            <div>Sessions: {sessionsCompleted}</div>
            <button
              onClick={requestNotificationPermission}
              className="text-xs hover:text-white"
            >
              Enable Notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Timer;
