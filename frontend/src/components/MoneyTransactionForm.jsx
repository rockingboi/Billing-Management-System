import React, { useState, useEffect } from "react";
import axios from "axios";
import { showNotification } from "./NotificationSystem";

const MoneyTransactionForm = ({ type }) => {
  const [entities, setEntities] = useState([]);
  const [form, setForm] = useState({
    id: "",
    name: "",
    date: "",
    amount: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const isParty = type === "party";

  useEffect(() => {
    async function fetchEntities() {
      try {
        const res = await axios.get(`http://localhost:5001/api/${isParty ? "parties" : "factories"}`);
        setEntities(res.data);
      } catch (error) {
        console.error("Failed to load list:", error);
      }
    }
    fetchEntities();
  }, [type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
  
      if (name === "id") {
        const selected = entities.find((e) => String(e.id) === value);
        updated.name = selected?.name || "";
      }
  
      return updated;
    });
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
  
    const payload = {
      ...(isParty
        ? {
            party_id: form.id,
            party_name: form.name,
            amount_paid: parseFloat(form.amount),
          }
        : {
            factory_id: form.id,
            factory_name: form.name,
            amount_received: parseFloat(form.amount),
          }),
      date: form.date,
      remarks: form.remarks || ""
    };
    
  
    try {
      await axios.post(`http://localhost:5001/api/payments/${isParty ? "party_payments" : "factory_payments"}`, payload);
      setSuccessMsg("Payment successfully recorded.");
      setForm({ id: "", name: "", date: "", amount: "" , remarks: ""});
      showNotification('success', `${isParty ? 'Party' : 'Factory'} payment recorded successfully!`);
    } catch (error) {
      console.error("Failed to submit payment", error);
      showNotification('error', 'Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-4">
        Add {isParty ? "Party" : "Factory"} Payment
      </h2>
      {successMsg && <div className="bg-green-100 p-2 text-green-800 mb-2">{successMsg}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-semibold">{isParty ? "Party" : "Factory"}</label>
          <select
            name="id"
            value={form.id}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            required
          >
            <option value="">Select {isParty ? "Party" : "Factory"}</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Amount</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            step="0.01"
            required
          />
        </div>
        <div className="md:col-span-3">
  <label className="block mb-1 font-semibold">Remarks</label>
  <input
    type="text"
    name="remarks"
    value={form.remarks}
    onChange={handleChange}
    className="border rounded px-3 py-2 w-full"
  />
</div>

        <div className="col-span-3 text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MoneyTransactionForm;
