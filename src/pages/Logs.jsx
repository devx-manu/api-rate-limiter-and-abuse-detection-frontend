import { useEffect, useState } from "react";
import api from "../api/client";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  const fetchLogs = () => {
    api
      .get("/api/admin/logs?page=0&size=100&sort=timestamp,desc")
      .then((res) => setLogs(res.data.content))
      .catch(() => {});
  };

  useEffect(() => {
    fetchLogs();

    // 🔁 auto refresh every 3 sec
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-start p-8">
      <div className="w-full max-w-6xl">

        {/* TITLE */}
        <h2 className="text-3xl mb-6 font-bold text-center">
          Request Logs
        </h2>

        {/* TABLE */}
        <div className="overflow-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">

          <table className="w-full text-center">

            <thead className="bg-slate-800">
              <tr>
                <th className="p-4">IP Address</th>
                <th className="p-4">Endpoint</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-6 text-gray-400">
                    No logs available
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="p-4">{log.ip}</td>

                    <td className="p-4 text-cyan-400">
                      {log.endpoint}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-semibold border ${
                          log.status === "BLOCKED"
                            ? "bg-red-500/20 text-red-400 border-red-500"
                            : "bg-green-500/20 text-green-400 border-green-500"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}