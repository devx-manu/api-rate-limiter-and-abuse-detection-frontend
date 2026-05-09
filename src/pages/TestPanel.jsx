import { useState } from "react";
import api from "../api/client";

export default function TestPanel() {

  const [count, setCount] = useState(40);

  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(0);

  const [live, setLive] = useState({
    allowed: 0,
    rateLimited: 0,
    blocked: 0
  });

  const [result, setResult] = useState(null);

  // ✅ SINGLE REQUEST
  const hitOnce = async () => {

    try {

      await api.get("/api/test");

      setResult({
        type: "ALLOWED",
        message: "✅ Request Allowed"
      });

    } catch (err) {

      const errorType = err.response?.data?.error;

      if (errorType === "RATE_LIMIT") {

        setResult({
          type: "RATE_LIMIT",
          message: "⚠️ Tokens exhausted (Rate Limited)"
        });

      } else if (errorType === "BLOCKED") {

        setResult({
          type: "BLOCKED",
          message: "🚫 IP Temporarily Blocked"
        });

      }
    }
  };

  // ✅ BURST TEST
  const burstTest = async () => {

    setLoading(true);

    setProgress(0);

    setResult(null);

    setLive({
      allowed: 0,
      rateLimited: 0,
      blocked: 0
    });

    let allowed = 0;
    let rateLimited = 0;
    let blocked = 0;
    let completed = 0;

    const requests = Array.from({ length: count }, () =>

      api.get("/api/test")

        .then(() => {

          allowed++;

          setLive(prev => ({
            ...prev,
            allowed: prev.allowed + 1
          }));
        })

        .catch(err => {

          const errorType = err.response?.data?.error;

          // ⚠️ TOKENS EMPTY
          if (errorType === "RATE_LIMIT") {

            rateLimited++;

            setLive(prev => ({
              ...prev,
              rateLimited: prev.rateLimited + 1
            }));
          }

          // 🚫 HARD BLOCK
          else if (errorType === "BLOCKED") {

            blocked++;

            setLive(prev => ({
              ...prev,
              blocked: prev.blocked + 1
            }));
          }
        })

        .finally(() => {

          completed++;

          setProgress(
            Math.floor((completed / count) * 100)
          );
        })
    );

    await Promise.all(requests);

    setResult({
      allowed,
      rateLimited,
      blocked
    });

    setLoading(false);
  };

  return (

    <div className="p-8 space-y-8 text-center">

      <h2 className="text-4xl font-bold">
        ⚡ API Stress Lab
      </h2>

      {/* SINGLE REQUEST */}
      <button
        onClick={hitOnce}
        className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-2xl font-bold transition"
      >
        Single Request
      </button>

      {/* INPUT */}
      <div className="flex flex-col items-center gap-3">

        <label className="text-gray-400 text-lg">
          Number of Requests
        </label>

        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-center w-44 text-lg"
          min="1"
          max="1000"
        />
      </div>

      {/* BURST BUTTON */}
      <button
        onClick={burstTest}
        disabled={loading}
        className="bg-red-500 hover:bg-red-600 px-8 py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition"
      >
        {loading
          ? "Running Stress Test..."
          : `🚀 Burst ${count} Requests`
        }
      </button>

      {/* PROGRESS BAR */}
      {loading && (

        <div className="w-full max-w-2xl mx-auto">

          <div className="bg-slate-800 rounded-full h-5 overflow-hidden">

            <div
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />

          </div>

          <p className="text-sm text-gray-400 mt-2">
            {progress}% Completed
          </p>

        </div>
      )}

      {/* LIVE COUNTERS */}
      {(loading || result) && (

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">

          {/* ALLOWED */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
            <h3 className="text-green-400 text-xl font-bold">
              ✅ Allowed
            </h3>

            <p className="text-4xl mt-3 font-bold">
              {live.allowed}
            </p>
          </div>

          {/* RATE LIMITED */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
            <h3 className="text-yellow-400 text-xl font-bold">
              ⚠️ Rate Limited
            </h3>

            <p className="text-4xl mt-3 font-bold">
              {live.rateLimited}
            </p>
          </div>

          {/* BLOCKED */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <h3 className="text-red-400 text-xl font-bold">
              🚫 Blocked
            </h3>

            <p className="text-4xl mt-3 font-bold">
              {live.blocked}
            </p>
          </div>

        </div>
      )}

      {/* FINAL STATUS */}
      {result?.message && (

        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <p className="text-xl font-semibold">
            {result.message}
          </p>

        </div>
      )}

    </div>
  );
}
