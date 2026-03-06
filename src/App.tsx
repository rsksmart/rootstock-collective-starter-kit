import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/Footer";
import { Dao, Home } from "@/pages";

function App() {
  return (
    <Router>
      <main className="min-h-screen flex flex-col justify-between bg-[#000000] text-[#FAF9F5]">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dao />} />
          <Route path="/home" element={<Home />} />
        </Routes>
        <Footer />
        <Toaster />
      </main>
    </Router>
  );
}

export default App;
