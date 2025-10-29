import React, { useState, useEffect } from "react";
import PartyForm from "../components/PartyForm";
import partyService from "../services/partyService";
import { Trash2 } from "lucide-react";
import { showNotification } from "../components/NotificationSystem";

const PartiesPage = () => {
  const [parties, setParties] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, partyId: null, partyName: '' });

  const fetchParties = async () => {
    try {
      const response = await partyService.getAllParties();
      setParties(response.data); 
    } catch (err) {
      console.error("Failed to fetch parties", err);
    }
  };
  

  useEffect(() => {
    fetchParties();
  }, []);

  const handlePartyAdded = () => {
    fetchParties();
    setSuccessMsg("Party added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDeleteClick = (partyId, partyName) => {
    setDeleteConfirm({ show: true, partyId, partyName });
  };

  const handleDeleteConfirm = async () => {
    try {
      await partyService.deleteParty(deleteConfirm.partyId);
      showNotification('success', 'Party deleted successfully!');
      fetchParties();
      setDeleteConfirm({ show: false, partyId: null, partyName: '' });
    } catch (error) {
      console.error("Failed to delete party", error);
      showNotification('error', 'Failed to delete party. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, partyId: null, partyName: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Parties Management</h1>
        <p className="text-gray-600">Manage your business partners and customers</p>
      </div>


      <PartyForm onAdded={handlePartyAdded} />

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Party List</h3>
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
              {parties.length > 0 ? (
                parties.map((party) => (
                  <tr key={party.id}>
                    <td>{party.name}</td>
                    <td>{party.contact}</td>
                    <td>{party.address}</td>
                    <td>{party.gstin || '-'}</td>
                    <td>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        party.business_type === 'registered' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {party.business_type || 'unregistered'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteClick(party.id, party.name)}
                        className="danger text-sm"
                        title="Delete Party"
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
                    No parties found
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
              Are you sure you want to delete the party <strong>"{deleteConfirm.partyName}"</strong>? 
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
                Delete Party
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartiesPage;
