import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [factorySummary, setFactorySummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/api/dashboard/factory-summary');
      setFactorySummary(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Factory-wise Balance Summary</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="5" cellSpacing="0">
          <thead>
            <tr>
              <th>Factory</th>
              <th>Total Loading</th>
              <th>Total Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {factorySummary.map((factory) => (
              <tr key={factory.id}>
                <td>{factory.name}</td>
                <td>{factory.total_loading}</td>
                <td>{factory.total_credit}</td>
                <td>{factory.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
