import React, { useState } from 'react';
import axios from 'axios';

export default function FactoryForm() {
  const [factoryName, setFactoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!factoryName) {
      setMessage('Factory name required');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/factories', { name: factoryName });
      setMessage(`Factory added with ID: ${res.data.id}`);
      setFactoryName('');
    } catch (err) {
      setMessage('Failed to add factory');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Add Factory</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Factory Name"
          value={factoryName}
          onChange={(e) => setFactoryName(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Factory'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
