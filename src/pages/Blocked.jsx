import { useEffect, useState } from "react";
import api from "../api/client";

export default function Blocked() {
  const [blocked, setBlocked] = useState([]);

  const fetchBlocked = async () => {
    const res = await api.get("/api/admin/blocked");
    setBlocked(res.data);
  };

  const unblock = async (id) => {
    await api.post(`/api/admin/unblock/${id}`);
    fetchBlocked();
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-6 font-bold">Blocked Entities</h2>

      <div className="grid gap-4">
        {blocked.map(item => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
          >
            <p><span className="text-cyan-400">IP:</span> {item.ip}</p>
            <p><span className="text-cyan-400">Reason:</span> {item.reason}</p>
            <p>
              <span className="text-cyan-400">Until:</span>{" "}
              {item.blockedUntil}
            </p>

            <button
              onClick={() => unblock(item.id)}
              className="mt-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl"
            >
              Unblock
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}