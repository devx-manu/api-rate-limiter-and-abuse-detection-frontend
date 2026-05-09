import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import Blocked from "./pages/Blocked";
import TestPanel from "./pages/TestPanel";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/blocked" element={<Blocked />} />
          <Route path="/test" element={<TestPanel />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;