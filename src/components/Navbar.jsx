import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const navItem = (path, label) => (
    <Link
      to={path}
      className={`px-4 py-2 rounded-xl transition-all duration-300 ${
        location.pathname === path
          ? "bg-cyan-500 text-black font-semibold shadow-lg"
          : "hover:bg-slate-800"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800 px-8 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-cyan-400">
        API Shield Dashboard
      </h1>

      <div className="flex gap-3">
        {navItem("/", "Dashboard")}
        {navItem("/logs", "Logs")}
        {navItem("/blocked", "Blocked")}
        {navItem("/test", "Test API")}
      </div>
    </div>
  );
}