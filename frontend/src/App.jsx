import React, { useState } from 'react';
import PartyForm from './components/PartyForm';
import FactoryForm from './components/FactoryForm';
import Dashboard from './components/Dashboard';
import PDFGenerator from './components/PDFGenerator';

export default function App() {
  const [view, setView] = useState('party'); // party, factory, dashboard
  const [factoryData, setFactoryData] = React.useState([]);

  return (
    <div style={{ padding: '20px' }}>
      <nav>
        <button onClick={() => setView('party')}>Party Form</button>
        <button onClick={() => setView('factory')}>Factory Form</button>
        <button onClick={() => setView('dashboard')}>Dashboard</button>
      </nav>

      <hr />

      {view === 'party' && <PartyForm />}
      {view === 'factory' && <FactoryForm />}
      {view === 'dashboard' && (
        <>
          <Dashboard />
          {/* For PDF generation, you can pass data fetched by Dashboard or fetch again */}
          {/* Example: <PDFGenerator data={factoryData} /> */}
        </>
      )}
    </div>
  );
}
