import React, { useEffect, useState } from "react";
import axios from "axios";
import transactionService from "../services/transactionService";

const TransactionForm = ({ onSave }) => {
  const [form, setForm] = useState({
    party_id: "",
    factory_id: "",
    date: "",
    vehicle_no: "",
    weight: "",
    rate: "",
    moisture: 0,
    rejection: 0,
    duplex: 0,
    first: 0,
    second: 0,
    third: 0,
  });

  const [parties, setParties] = useState([]);
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLists() {
      try {
        const [partyRes, factoryRes] = await Promise.all([
          axios.get("http://localhost:5001/api/parties"),
          axios.get("http://localhost:5001/api/factories"),
        ]);
        setParties(partyRes.data || []);
        setFactories(factoryRes.data || []);
      } catch (err) {
        console.error("Failed to load dropdowns", err);
      }
    }
    fetchLists();
  }, []);

  const computeAmount = () => {
    const {
      weight,
      rate,
      moisture,
      rejection,
      duplex,
      first,
      second,
      third,
    } = form;

    const base = parseFloat(weight || 0) * parseFloat(rate || 0);
    const deductions =
      parseFloat(moisture || 0) +
      parseFloat(rejection || 0) +
      parseFloat(duplex || 0) +
      parseFloat(first || 0) +
      parseFloat(second || 0) +
      parseFloat(third || 0);

    return parseFloat(base - deductions).toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const total_amount = computeAmount();

    try {
      await transactionService.createTransaction({
        ...form,
        total_amount,
      });

      setForm({
        party_id: "",
        factory_id: "",
        date: "",
        vehicle_no: "",
        weight: "",
        rate: "",
        moisture: 0,
        rejection: 0,
        duplex: 0,
        first: 0,
        second: 0,
        third: 0,
      });

      if (onSave) onSave();
    } catch (err) {
      console.error("Failed to save transaction", err);
      alert("Error saving transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Add Scrap Transaction</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Party Select */}
        <div>
          <label className="block font-semibold mb-1">Party</label>
          <select
            name="party_id"
            value={form.party_id}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value="">Select Party</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Factory Select */}
        <div>
          <label className="block font-semibold mb-1">Factory</label>
          <select
            name="factory_id"
            value={form.factory_id}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value="">Select Factory</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle No */}
        <div>
          <label className="block font-semibold mb-1">Vehicle No</label>
          <input
            type="text"
            name="vehicle_no"
            value={form.vehicle_no}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            placeholder="e.g. UP32 AB 1234"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block font-semibold mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>

        {/* Weight & Rate */}
        <div>
          <label className="block font-semibold mb-1">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Rate (₹/kg)</label>
          <input
            type="number"
            name="rate"
            value={form.rate}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            step="0.01"
            required
          />
        </div>

        {/* Deductions */}
        {["moisture", "rejection", "duplex", "first", "second", "third"].map((field) => (
          <div key={field}>
            <label className="block font-semibold mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type="number"
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
              step="0.01"
              min="0"
            />
          </div>
        ))}

        {/* Computed Amount */}
        <div className="md:col-span-3 text-right">
          <p className="text-lg font-bold">
            Total Amount: ₹ {computeAmount()}
          </p>
        </div>

        {/* Submit */}
        <div className="md:col-span-3 text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
