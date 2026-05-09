import { useState } from "react";
import api from "../api/client";

export default function TestPanel() {

  const [count, setCount] = useState(40);

  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(0);

  const [live, setLive] = useState({
    allowed: 0,
    rateLimited: 0,
    blocked: 0,
    failed: 0
  });

  const [result, setResult] = useState(null);

  // =========================================
  // HANDLE SINGLE REQUEST
  // =========================================

  const hitOnce = async () => {

    setResult(null);

    try {

      const res = await api.get("/api/test");

      setResult({
        type: "ALLOWED",
        title: "✅ REQUEST ALLOWED",
        message: res.data || "Request processed successfully"
      });

    } catch (err) {

      // NETWORK / SERVER ERROR
      if (!err.response) {

        setResult({
          type: "FAILED",
          title: "❌ SERVER ERROR",
          message: "Backend unreachable or network issue"
        });

        return;
      }

      const errorType = err.response?.data?.error;
      const message = err.response?.data?.message;

      // TOKENS EMPTY
      if (errorType === "RATE_LIMIT") {

        setResult({
          type: "RATE_LIMIT",
          title: "⚠️ RATE LIMITED",
          message:
            message ||
            "Token bucket exhausted. Wait for refill."
        });
      }

      // HARD BLOCKED
      else if (errorType === "BLOCKED") {

        setResult({
          type: "BLOCKED",
          title: "🚫 IP BLOCKED",
          message:
            message ||
            "Suspicious activity detected. IP temporarily blocked."
        });
      }

      // UNKNOWN
      else {

        setResult({
          type: "FAILED",
          title: "❌ REQUEST FAILED",
          message: "Unexpected error occurred"
        });
      }
    }
  };

  // =========================================
  // BURST TEST
  // =========================================

  const burstTest = async () => {

    setLoading(true);

    setProgress(0);

    setResult(null);

    setLive({
      allowed: 0,
      rateLimited: 0,
      blocked: 0,
      failed: 0
    });

    let allowed = 0;
    let rateLimited = 0;
    let blocked = 0;
    let failed = 0;

    let completed = 0;

    const requests = Array.from(
      { length: count },
      async () => {

        try {

          await api.get("/api/test");

          allowed++;

          setLive(prev => ({
            ...prev,
            allowed: prev.allowed + 1
          }));

        } catch (err) {

          // NETWORK FAILURE
          if (!err.response) {

            failed++;

            setLive(prev => ({
              ...prev,
              failed: prev.failed + 1
            }));

            return;
          }

          const errorType =
            err.response?.data?.error;

          // TOKENS EXHAUSTED
          if (errorType === "RATE_LIMIT") {

            rateLimited++;

            setLive(prev => ({
              ...prev,
              rateLimited: prev.rateLimited + 1
            }));
          }

          // TEMP BLOCK
          else if (errorType === "BLOCKED") {

            blocked++;

            setLive(prev => ({
              ...prev,
              blocked: prev.blocked + 1
            }));
          }

          // OTHER FAILURE
          else {

            failed++;

            setLive(prev => ({
              ...prev,
              failed: prev.failed + 1
            }));
          }

        } finally {

          completed++;

          setProgress(
            Math.floor((completed / count) * 100)
          );
        }
      }
    );

    await Promise.all(requests);

    // FINAL SUMMARY

    let finalMessage = "";

    if (blocked > 0) {

      finalMessage =
        "🚫 IP got temporarily blocked due to excessive burst traffic.";

    } else if (rateLimited > 0) {

      finalMessage =
        "⚠️ Token bucket exhausted. Some requests were rate limited.";

    } else {

      finalMessage =
        "✅ All requests processed successfully.";
    }

    setResult({
      type: "SUMMARY",
      title: "⚡ STRESS TEST COMPLETED",
      message: finalMessage,
      allowed,
      rateLimited,
      blocked,
      failed
    });

    setLoading(false);
  };

  // =========================================
  // RESULT CARD COLORS
  // =========================================

  const resultStyles = {
    ALLOWED:
      "border-green-500/40 bg-green-500/10 text-green-300",

    RATE_LIMIT:
      "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",

    BLOCKED:
      "border-red-500/40 bg-red-500/10 text-red-300",

    FAILED:
      "border-pink-500/40 bg-pink-500/10 text-pink-300",

    SUMMARY:
      "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
  };

  return (

    <div className="min-h-screen p-8 text-white">

      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}

        <div className="text-center space-y-4">

          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
            ⚡ API STRESS LAB
          </h1>

          <p className="text-slate-400 text-lg">
            Simulate traffic spikes, rate limiting & abuse detection
          </p>

        </div>

        {/* CONTROLS */}

        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-10 backdrop-blur-xl shadow-2xl">

          <div className="flex flex-col items-center gap-8">

            {/* SINGLE */}

            <button
              onClick={hitOnce}
              className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg"
            >
              ✅ Send Single Request
            </button>

            {/* INPUT */}

            <div className="space-y-3">

              <label className="text-slate-300 text-lg block">
                Number of Requests
              </label>

              <input
                type="number"
                value={count}
                onChange={(e) =>
                  setCount(Number(e.target.value))
                }
                className="w-52 px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-400"
                min="1"
                max="1000"
              />

            </div>

            {/* BURST */}

            <button
              onClick={burstTest}
              disabled={loading}
              className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 shadow-2xl"
            >
              {
                loading
                  ? "⚡ Running Stress Test..."
                  : `🚀 Burst ${count} Requests`
              }
            </button>

          </div>
        </div>

        {/* PROGRESS */}

        {loading && (

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

            <div className="flex justify-between mb-3 text-sm text-slate-400">
              <span>Stress Test Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden">

              <div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />

            </div>

          </div>
        )}

        {/* LIVE STATS */}

        {(loading || result) && (

          <div className="grid md:grid-cols-4 gap-6">

            <StatCard
              title="Allowed"
              value={live.allowed}
              color="green"
              icon="✅"
            />

            <StatCard
              title="Rate Limited"
              value={live.rateLimited}
              color="yellow"
              icon="⚠️"
            />

            <StatCard
              title="Blocked"
              value={live.blocked}
              color="red"
              icon="🚫"
            />

            <StatCard
              title="Failed"
              value={live.failed}
              color="pink"
              icon="❌"
            />

          </div>
        )}

        {/* RESULT */}

        {result && (

          <div
            className={`rounded-3xl border p-8 shadow-2xl transition-all duration-500 ${resultStyles[result.type]}`}
          >

            <h2 className="text-3xl font-black mb-4">
              {result.title}
            </h2>

            <p className="text-lg leading-relaxed">
              {result.message}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

// =========================================
// STAT CARD
// =========================================

function StatCard({ title, value, color, icon }) {

  const colors = {

    green:
      "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300",

    yellow:
      "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-300",

    red:
      "from-red-500/20 to-pink-500/20 border-red-500/30 text-red-300",

    pink:
      "from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-300"
  };

  return (

    <div
      className={`bg-gradient-to-br ${colors[color]} border rounded-3xl p-8 backdrop-blur-xl shadow-xl hover:scale-105 transition-all duration-300`}
    >

      <div className="text-5xl mb-4">
        {icon}
      </div>

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="text-5xl font-black mt-4">
        {value}
      </p>

    </div>
  );
}
