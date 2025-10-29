import React, { useState } from 'react';
import { createParty } from '../services/partyService';
import axios from 'axios';
import { showNotification } from './NotificationSystem';

function PartyForm({ onAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    address: '',
    gstin: '',
    business_type: 'unregistered',
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [gstinValidation, setGstinValidation] = useState({
    isValidating: false,
    isValid: null,
    businessName: '',
    error: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset GSTIN validation when business type changes
    if (name === 'business_type') {
      setGstinValidation({
        isValidating: false,
        isValid: null,
        businessName: '',
        error: ''
      });
    }
  };

  const validateGstin = async () => {
    if (!formData.gstin) {
      setGstinValidation({
        isValidating: false,
        isValid: false,
        businessName: '',
        error: 'Please enter GSTIN number'
      });
      return;
    }

    setGstinValidation(prev => ({ ...prev, isValidating: true, error: '' }));

    try {
      const response = await axios.post('http://localhost:5001/api/parties/validate-gstin', {
        gstin: formData.gstin
      });

      if (response.data.isValid) {
        setGstinValidation({
          isValidating: false,
          isValid: true,
          businessName: response.data.businessName,
          legalName: response.data.legalName,
          tradeName: response.data.tradeName,
          stateCode: response.data.stateCode,
          pinCode: response.data.pinCode,
          address1: response.data.address1,
          address2: response.data.address2,
          status: response.data.status,
          isOfficial: response.data.isOfficial,
          isMock: response.data.isMock,
          error: ''
        });
        
        // Auto-fill the business name if validation is successful
        setFormData(prev => ({ ...prev, name: response.data.businessName }));
      } else {
        setGstinValidation({
          isValidating: false,
          isValid: false,
          businessName: '',
          error: response.data.error || 'Invalid GSTIN'
        });
      }
    } catch (error) {
      setGstinValidation({
        isValidating: false,
        isValid: false,
        businessName: '',
        error: error.response?.data?.message || 'Failed to validate GSTIN'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createParty(formData);
      setFormData({ name: '', contact: '', address: '', gstin: '', business_type: 'unregistered' });
      setGstinValidation({
        isValidating: false,
        isValid: null,
        businessName: '',
        error: ''
      });
      showNotification('success', 'Party added successfully!');

      if (onAdded) onAdded();
    } catch (error) {
      console.error(error);
      showNotification('error', 'Failed to add party. Please try again.');
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Add New Party</h2>


      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Party Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter party name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Number
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            placeholder="Enter contact number"
            value={formData.contact}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Enter party address"
            value={formData.address}
            onChange={handleChange}
            className="w-full"
          />
        </div>
      
        {/* Business Type Dropdown */}
        <div>
          <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-1">
            Business Type
          </label>
          <select
            id="business_type"
            name="business_type"
            value={formData.business_type}
            onChange={handleChange}
            className="w-full"
          >
            <option value="unregistered">Unregistered</option>
            <option value="registered">Registered</option>
          </select>
        </div>

      {/* GSTIN Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
        <input
          type="text"
          name="gstin"
          placeholder="Enter GSTIN number"
          value={formData.gstin}
          onChange={handleChange}
          className="w-full border px-2 py-1 rounded"
        />
        
        {/* GSTIN Validation for Registered Businesses */}
        {formData.business_type === 'registered' && (
          <div className="mt-2">
            <button
              type="button"
              onClick={validateGstin}
              disabled={gstinValidation.isValidating}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
            >
              {gstinValidation.isValidating ? 'Validating...' : 'Validate GSTIN'}
            </button>
            
            {/* Validation Status */}
            {gstinValidation.isValid === true && (
              <div className="mt-2 p-3 bg-green-100 border border-green-300 rounded text-green-700 text-sm">
                <div className="flex items-center mb-2">
                  <span className="text-green-600">✅ Valid GSTIN</span>
                  {gstinValidation.isOfficial && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      Official Data
                    </span>
                  )}
                  {gstinValidation.isMock && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                      Mock Data
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div><strong>Business Name:</strong> {gstinValidation.businessName}</div>
                  {gstinValidation.legalName && gstinValidation.legalName !== gstinValidation.businessName && (
                    <div><strong>Legal Name:</strong> {gstinValidation.legalName}</div>
                  )}
                  {gstinValidation.stateCode && (
                    <div><strong>State Code:</strong> {gstinValidation.stateCode}</div>
                  )}
                  {gstinValidation.pinCode && (
                    <div><strong>PIN Code:</strong> {gstinValidation.pinCode}</div>
                  )}
                  {gstinValidation.address1 && (
                    <div><strong>Address:</strong> {gstinValidation.address1}{gstinValidation.address2 && `, ${gstinValidation.address2}`}</div>
                  )}
                  {gstinValidation.status && (
                    <div><strong>Status:</strong> {gstinValidation.status}</div>
                  )}
                </div>
              </div>
            )}
            
            {gstinValidation.isValid === false && gstinValidation.error && (
              <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                ❌ {gstinValidation.error}
              </div>
            )}
          </div>
        )}
      </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="primary"
          >
            Add Party
          </button>
        </div>
      </form>
    </div>
  );
}

export default PartyForm;
