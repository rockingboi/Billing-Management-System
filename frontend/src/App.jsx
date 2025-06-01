// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import PartiesPage from "./pages/PartiesPage";
import FactoriesPage from "./pages/FactoriesPage";
import TransactionsPage from "./pages/TransactionsPage";
import { Navigate } from "react-router-dom";



import Sidebar from "./components/Sidebar";
import HisabTally from "./pages/HisabTally";

import { getParties, getFactories } from "./services/dashboardService";

const App = () => {
  // Global filter state
  const [filters, setFilters] = useState({
    partyId: null,
    factoryId: null,
    startDate: "",
    endDate: "",
  });

  // Dropdown options for parties and factories
  const [parties, setParties] = useState([]);
  const [factories, setFactories] = useState([]);

  // Fetch parties and factories dropdown data once on mount
  useEffect(() => {
    async function fetchDropdowns() {
      try {
        const [partyRes, factoryRes] = await Promise.all([getParties(), getFactories()]);
        setParties(partyRes.data || []);
        setFactories(factoryRes.data || []);
      } catch (error) {
        console.error("Error loading parties or factories", error);
      }
    }
    fetchDropdowns();
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 p-6 bg-gray-100">

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<Layout />}></Route>

            {/* Pass filters and setFilters to pages that might update filters */}
            <Route
              path="/dashboard"
              element={<DashboardPage filters={filters} setFilters={setFilters} />}
            />

            {/* Other pages get filters if they need it */}
            <Route path="/parties" element={<PartiesPage filters={filters} />} />
            <Route path="/factories" element={<FactoriesPage filters={filters} />} />
            <Route path="/transactions" element={<TransactionsPage filters={filters} />} />
            <Route path="/hisab-tally" element={<HisabTally filters={filters} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
