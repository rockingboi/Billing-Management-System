import React, { useEffect, useState } from "react";
import axios from "axios";
import transactionService from "../services/transactionService";
import { showNotification } from "./NotificationSystem";

const TransactionForm = ({ onSave, transactionType = "factory" }) => {
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
    remarks: "",
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
      const transactionData = {
        ...form,
        total_amount,
        transactionType,
      };

      await transactionService.createTransaction(transactionData);

      // Reset form
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
        remarks: "",
      });

      showNotification('success', 'Transaction created successfully!');
      if (onSave) onSave();
    } catch (err) {
      console.error("Failed to save transaction", err);
      showNotification('error', 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Add Scrap Transaction</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Party Select - Required for party transactions, optional for factory */}
          <div>
            <label htmlFor="party_id" className="block text-sm font-medium text-gray-700 mb-1">
              Party {transactionType === "party" && <span className="text-red-500">*</span>}
            </label>
            <select
              id="party_id"
              name="party_id"
              value={form.party_id}
              onChange={handleChange}
              className="w-full"
              required={transactionType === "party"}
            >
              <option value="">Select Party</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Factory Select - Required for factory transactions, optional for party */}
          <div>
            <label htmlFor="factory_id" className="block text-sm font-medium text-gray-700 mb-1">
              Factory {transactionType === "factory" && <span className="text-red-500">*</span>}
            </label>
            <select
              id="factory_id"
              name="factory_id"
              value={form.factory_id}
              onChange={handleChange}
              className="w-full"
              required={transactionType === "factory"}
            >
              <option value="">Select Factory</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="vehicle_no" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number *
            </label>
            <input
              type="text"
              id="vehicle_no"
              name="vehicle_no"
              value={form.vehicle_no}
              onChange={handleChange}
              className="w-full"
              placeholder="e.g. UP32 AB 1234"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full"
              required
            />
          </div>
        </div>

        {/* Weight & Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg) *
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              className="w-full"
              step="0.01"
              placeholder="Enter weight in kg"
              required
            />
          </div>

          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
              Rate (₹/kg) *
            </label>
            <input
              type="number"
              id="rate"
              name="rate"
              value={form.rate}
              onChange={handleChange}
              className="w-full"
              step="0.01"
              placeholder="Enter rate per kg"
              required
            />
          </div>
        </div>

        {/* Deductions Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Deductions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {["moisture", "rejection", "duplex", "first", "second", "third"].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type="number"
                  id={field}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <textarea
            id="remarks"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            className="w-full"
            rows="3"
            placeholder="Additional notes or remarks..."
          />
        </div>

        {/* Computed Amount */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-green-600">₹ {computeAmount()}</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="success"
          >
            {loading ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
