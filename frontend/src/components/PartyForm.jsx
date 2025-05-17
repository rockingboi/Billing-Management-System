import React, { useState } from 'react';
import axios from 'axios';

export default function PartyForm() {
  const [formData, setFormData] = useState({
    s_no: '',
    party_name: '',
    bill_date: '',
    mill_name: '',
    inv_no: '',
    inv_date: '',
    mill_weight: '',
    truck_no: '',
    freight: '',
    tax: '',
    total: '',
    grand_total: '',
    items: [{ particular: '', weight: '', rate: '', amount: '' }],
  });

  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, e) => {
    const newItems = [...formData.items];
    newItems[index][e.target.name] = e.target.value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { particular: '', weight: '', rate: '', amount: '' }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate total and grand_total if needed here or from user inputs
    try {
      const res = await axios.post('http://localhost:3000/api/party/bills', formData);
      setMessage(`Bill created successfully with ID: ${res.data.bill_id}`);
      // Reset form or keep
    } catch (err) {
      setMessage('Failed to create bill');
    }
  };

  return (
    <div>
      <h2>Create Party Bill</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="S No"
          name="s_no"
          value={formData.s_no}
          onChange={handleInputChange}
        />
        <input
          placeholder="Party Name"
          name="party_name"
          value={formData.party_name}
          onChange={handleInputChange}
          required
        />
        <input
          type="date"
          name="bill_date"
          value={formData.bill_date}
          onChange={handleInputChange}
          required
        />
        <input
          placeholder="Mill Name"
          name="mill_name"
          value={formData.mill_name}
          onChange={handleInputChange}
        />
        <input
          placeholder="Invoice No"
          name="inv_no"
          value={formData.inv_no}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="inv_date"
          value={formData.inv_date}
          onChange={handleInputChange}
        />
        <input
          placeholder="Mill Weight"
          name="mill_weight"
          value={formData.mill_weight}
          onChange={handleInputChange}
        />
        <input
          placeholder="Truck No"
          name="truck_no"
          value={formData.truck_no}
          onChange={handleInputChange}
        />
        <input
          placeholder="Freight"
          name="freight"
          value={formData.freight}
          onChange={handleInputChange}
        />
        <input
          placeholder="Tax"
          name="tax"
          value={formData.tax}
          onChange={handleInputChange}
        />
        <input
          placeholder="Total"
          name="total"
          value={formData.total}
          onChange={handleInputChange}
        />
        <input
          placeholder="Grand Total"
          name="grand_total"
          value={formData.grand_total}
          onChange={handleInputChange}
        />

        <h3>Items</h3>
        {formData.items.map((item, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              placeholder="Particular"
              name="particular"
              value={item.particular}
              onChange={(e) => handleItemChange(index, e)}
              required
            />
            <input
              placeholder="Weight"
              name="weight"
              value={item.weight}
              onChange={(e) => handleItemChange(index, e)}
              type="number"
            />
            <input
              placeholder="Rate"
              name="rate"
              value={item.rate}
              onChange={(e) => handleItemChange(index, e)}
              type="number"
            />
            <input
              placeholder="Amount"
              name="amount"
              value={item.amount}
              onChange={(e) => handleItemChange(index, e)}
              type="number"
            />
            {index > 0 && (
              <button type="button" onClick={() => removeItem(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addItem}>
          Add Item
        </button>
        <br />
        <button type="submit">Create Bill</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
