// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar        from "./components/layout/Navbar";
import Home          from "./pages/Home";
import Explorer      from "./pages/Explorer";
import Rankings      from "./pages/Rankings";
import Outbreaks     from "./pages/Outbreaks";
import CountryDetail from "./pages/CountryDetail";

export default function App() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      {/* pt-20 clears the floating navbar (top-3 offset + 14 height + breathing room) */}
      <main className="pt-20">
        <div className="p-6 max-w-screen-2xl mx-auto">
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/explorer"      element={<Explorer />} />
            <Route path="/rankings"      element={<Rankings />} />
            <Route path="/outbreaks"     element={<Outbreaks />} />
            <Route path="/country/:code" element={<CountryDetail />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
