import { useState } from "react";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="bg-gray-800 min-h-screen">
      {currentPage === "home" ? <Home /> : <Analytics />}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-2">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentPage("home")}
            className={`flex-1 py-2 text-center rounded ${currentPage === "home" ? "text-white font-bold" : "text-gray-400"
              }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentPage("analytics")}
            className={`flex-1 py-2 text-center rounded ${currentPage === "analytics" ? "text-white font-bold" : "text-gray-400"
              }`}
          >
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

