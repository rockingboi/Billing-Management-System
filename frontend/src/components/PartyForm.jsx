import React, { useState } from 'react';
import { createParty } from '../services/partyService';

function PartyForm({ onAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    gstin: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createParty(formData);
      alert('Party added successfully');
      setFormData({ name: '', contact: '', address: '', gstin: '' });
      if (onAdded) onAdded(); // 👈 React-style refresh
    } catch (error) {
      console.error(error);
      alert('Failed to add party');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h2 className="font-semibold">Add New Party</h2>
      <input
        type="text"
        name="name"
        placeholder="Name"
        required
        value={formData.name}
        onChange={handleChange}
        className="w-full border px-2 py-1 rounded"
      />
      <input
        type="text"
        name="contact"
        placeholder="Contact"
        value={formData.contact}
        onChange={handleChange}
        className="w-full border px-2 py-1 rounded"
      />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        className="w-full border px-2 py-1 rounded"
      />
      <input
        type="text"
        name="gstin"
        placeholder="GSTIN (optional)"
        value={formData.gstin}
        onChange={handleChange}
        className="w-full border px-2 py-1 rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Party
      </button>
    </form>
  );
}


export default PartyForm;
