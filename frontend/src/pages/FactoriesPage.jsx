import React, { useState, useEffect } from "react";
import FactoryForm from "../components/FactoryForm";
import factoryService from "../services/factoryService";

const FactoriesPage = ({ filters }) => {
  const [factories, setFactories] = useState([]);

  const fetchFactories = async () => {
    try {
      const data = await factoryService.getFilteredFactories(filters);
      setFactories(data);
    } catch (err) {
      console.error("Failed to fetch factories", err);
    }
  };

  useEffect(() => {
    fetchFactories();
  }, [filters]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Factories</h1>
      <FactoryForm onAdded={fetchFactories} />

      <table className="w-full mt-6 border border-gray-300 rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2 text-left">Name</th>
            <th className="border border-gray-300 p-2 text-left">Contact</th>
            <th className="border border-gray-300 p-2 text-left">Address</th>
            <th className="border border-gray-300 p-2 text-left">GSTIN</th>
          </tr>
        </thead>
        <tbody>
          {factories.length > 0 ? (
            factories.map((factory) => (
              <tr key={factory.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{factory.name}</td>
                <td className="border border-gray-300 p-2">{factory.contact}</td>
                <td className="border border-gray-300 p-2">{factory.address}</td>
                <td className="border border-gray-300 p-2">{factory.gstin}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center p-4 text-gray-500">
                No factories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FactoriesPage;
