import React, { useState, useEffect } from "react";
import PartyForm from "../components/PartyForm";
import partyService from "../services/partyService";

const PartiesPage = () => {
  const [parties, setParties] = useState([]);

  const fetchParties = async () => {
    try {
      const data = await partyService.getAllParties();
      setParties(data);
    } catch (err) {
      console.error("Failed to fetch parties", err);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-center text-green-700">Parties Management</h1>

      <div className="backdrop-blur-md bg-white/60 p-6 rounded-2xl shadow-lg border border-gray-200">
        <PartyForm onAdded={fetchParties} />
      </div>

      <div className="backdrop-blur-md bg-white/60 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-100 text-green-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Address</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">GSTIN</th>
            </tr>
          </thead>
          <tbody>
            {parties.length > 0 ? (
              parties.map((party) => (
                <tr key={party.id} className="hover:bg-green-50">
                  <td className="px-4 py-2 border-t">{party.name}</td>
                  <td className="px-4 py-2 border-t">{party.contact}</td>
                  <td className="px-4 py-2 border-t">{party.address}</td>
                  <td className="px-4 py-2 border-t">{party.gstin}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No parties found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartiesPage;
