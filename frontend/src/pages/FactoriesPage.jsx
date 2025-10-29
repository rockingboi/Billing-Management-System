import React, { useState, useEffect } from "react";
import FactoryForm from "../components/FactoryForm";
import factoryService from "../services/factoryService";
import { Trash2 } from "lucide-react";
import { showNotification } from "../components/NotificationSystem";

const FactoriesPage = ({ filters }) => {
  const [factories, setFactories] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, factoryId: null, factoryName: '' });

  const fetchFactories = async () => {
    try {
      const response = await factoryService.getAllFactories(filters);
      setFactories(response.data);  
    } catch (err) {
      console.error("Failed to fetch factories", err);
    }
  };
  

  useEffect(() => {
    fetchFactories();
  }, [filters]);

  const handleFactoryAdded = () => {
    fetchFactories();
    setSuccessMsg("Factory added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDeleteClick = (factoryId, factoryName) => {
    setDeleteConfirm({ show: true, factoryId, factoryName });
  };

  const handleDeleteConfirm = async () => {
    try {
      await factoryService.deleteFactory(deleteConfirm.factoryId);
      showNotification('success', 'Factory deleted successfully!');
      fetchFactories();
      setDeleteConfirm({ show: false, factoryId: null, factoryName: '' });
    } catch (error) {
      console.error("Failed to delete factory", error);
      showNotification('error', 'Failed to delete factory. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, factoryId: null, factoryName: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Factories Management</h1>
        <p className="text-gray-600">Manage your factory partners and suppliers</p>
      </div>


      <FactoryForm onAdded={handleFactoryAdded} />

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Factory List</h3>
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Address</th>
                <th>GSTIN</th>
                <th>Business Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {factories.length > 0 ? (
                factories.map((factory) => (
                  <tr key={factory.id}>
                    <td>{factory.name}</td>
                    <td>{factory.contact}</td>
                    <td>{factory.address}</td>
                    <td>{factory.gstin || '-'}</td>
                    <td>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        factory.business_type === 'registered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {factory.business_type || 'unregistered'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteClick(factory.id, factory.name)}
                        className="danger text-sm"
                        title="Delete Factory"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">
                    No factories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the factory <strong>"{deleteConfirm.factoryName}"</strong>? 
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete Factory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactoriesPage;
