import React, { useState } from 'react';
import { createFactory } from '../services/factoryService';

function FactoryForm() {
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
      await createFactory(formData);
      alert('Factory added successfully');
      setFormData({ name: '', contact: '', address: '', gstin: '' });
      window.location.reload(); // simple way to refresh list
    } catch (error) {
      console.error(error);
      alert('Failed to add factory');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h2 className="font-semibold">Add New Factory</h2>
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
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Factory
      </button>
    </form>
  );
}

export default FactoryForm;
