// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import NotificationSystem from "./components/NotificationSystem";

import DashboardPage from "./pages/DashboardPage";
import PartiesPage from "./pages/PartiesPage";
import FactoriesPage from "./pages/FactoriesPage";
import TransactionsPage from "./pages/TransactionsPage";
import HisabTally from "./pages/HisabTally";

import { getParties, getFactories } from "./services/dashboardService";

const App = () => {
  const [filters, setFilters] = useState({
    partyId: null,
    factoryId: null,
    startDate: "",
    endDate: "",
  });

  const [parties, setParties] = useState([]);
  const [factories, setFactories] = useState([]);

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
      <NotificationSystem />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={<DashboardPage filters={filters} setFilters={setFilters} />}
          />
          <Route path="/parties" element={<PartiesPage filters={filters} />} />
          <Route path="/factories" element={<FactoriesPage filters={filters} />} />
          <Route path="/transactions" element={<TransactionsPage filters={filters} />} />
          <Route path="/hisab-tally" element={<HisabTally filters={filters} />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
