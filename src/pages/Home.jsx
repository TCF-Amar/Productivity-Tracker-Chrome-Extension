import Dashboard from "../components/Dashboard";
import Settings from "../components/Settings";
import Timer from "../components/Timer";

const Home = () => {
  return (
    <div className="p-4 max-w-md mx-auto">
      <header className="text-center mb-4 pb-3 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">
          Productivity Tracker
        </h1>
        <p className="text-gray-400 text-sm mt-1">Track and optimize your browsing habits</p>
      </header>

      <div className="space-y-4 pb-16">
        <Dashboard />
        <Timer />
        <Settings />
      </div>
    </div>
  );
};

export default Home;
