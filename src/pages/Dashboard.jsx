import { useEffect, useState } from "react";
import api from "../api/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    allowed: 0,
    blocked: 0
  });

  // ✅ Fetch limited logs for chart
  const fetchLogs = async () => {
    const res = await api.get(
      "/api/admin/logs?page=0&size=100&sort=timestamp,desc"
    );
    setLogs(res.data.content);

    // compute stats
    const allowed = res.data.content.filter(l => l.status === "ALLOWED").length;
    const blocked = res.data.content.filter(l => l.status === "BLOCKED").length;

    setStats({
      total: res.data.totalElements, // 🔥 important
      allowed,
      blocked
    });
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = logs.map((log, index) => ({
    index,
    blocked: log.status === "BLOCKED" ? 1 : 0,
    allowed: log.status === "ALLOWED" ? 1 : 0
  }));

  return (
    <div className="p-8 space-y-10">

      <h2 className="text-4xl font-bold text-cyan-400">
        ⚡ Security Command Center
      </h2>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Total Requests" value={stats.total} color="cyan" icon="📡" />
        <StatCard title="Allowed Traffic" value={stats.allowed} color="green" icon="✅" />
        <StatCard title="Blocked Threats" value={stats.blocked} color="red" icon="🚫" />
      </div>

      {/* CHART */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-800 shadow-2xl"
      >
        <h3 className="text-xl mb-4 text-gray-300">
          📊 Last 100 Requests Trend
        </h3>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="blocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>

              <linearGradient id="allowed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1e293b" />
            <XAxis dataKey="index" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />

            <Area
              type="monotone"
              dataKey="allowed"
              stroke="#22c55e"
              fill="url(#allowed)"
            />

            <Area
              type="monotone"
              dataKey="blocked"
              stroke="#ef4444"
              fill="url(#blocked)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  const colors = {
    cyan: "from-cyan-500 to-blue-500",
    green: "from-green-500 to-emerald-500",
    red: "from-red-500 to-pink-500"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-2xl bg-gradient-to-r ${colors[color]} shadow-xl`}
    >
      <div className="flex justify-between">
        <h3>{title}</h3>
        <span>{icon}</span>
      </div>

      <p className="text-4xl font-bold mt-4">{value}</p>
    </motion.div>
  );
}