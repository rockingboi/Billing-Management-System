import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Factory, FileText, BarChart3, TrendingUp } from 'lucide-react';
import HisabTally from './HisabTally';

const DashboardPage = () => {
  const [partyId, setPartyId] = useState('');
  const [factoryId, setFactoryId] = useState('');
  const [partyOptions, setPartyOptions] = useState([]);
  const [factoryOptions, setFactoryOptions] = useState([]);
  const [partyData, setPartyData] = useState(null);
  const [factoryData, setFactoryData] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [partiesRes, factoriesRes] = await Promise.all([
          axios.get('http://localhost:5001/api/parties'),
          axios.get('http://localhost:5001/api/factories')
        ]);
        setPartyOptions(partiesRes.data);
        setFactoryOptions(factoriesRes.data);
      } catch (err) {
        console.error('Error fetching options', err);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchPartyData = async () => {
      if (!partyId) return setPartyData(null);
      try {
        const res = await axios.get(`http://localhost:5001/api/transactions/summary/party/${partyId}`);
        setPartyData(res.data);
      } catch (err) {
        console.error('Error fetching party summary:', err);
      }
    };
    fetchPartyData();
  }, [partyId]);

  useEffect(() => {
    const fetchFactoryData = async () => {
      if (!factoryId) return setFactoryData(null);
      try {
        const res = await axios.get(`http://localhost:5001/api/transactions/summary/factory/${factoryId}`);
        setFactoryData(res.data);
      } catch (err) {
        console.error('Error fetching factory summary:', err);
      }
    };
    fetchFactoryData();
  }, [factoryId]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Overview of your business operations and financial transactions
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card stat-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Parties</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {partyOptions.length}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-md">
              <Users size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Active business partners
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Factories</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {factoryOptions.length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-md">
              <Factory size={20} className="text-green-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Manufacturing units
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Active Transactions</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {(partyData?.transactions?.length || 0) + (factoryData?.transactions?.length || 0)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-md">
              <FileText size={20} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Recent activities
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Value</h3>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{((partyData?.totalAmount || 0) + (factoryData?.totalAmount || 0)).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-md">
              <BarChart3 size={20} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Business volume
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Selection Controls */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Select Party or Factory
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="partySelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select Party
              </label>
              <select
                id="partySelect"
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Select Party --</option>
                {partyOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="factorySelect" className="block text-sm font-medium text-gray-700 mb-2">
                Select Factory
              </label>
              <select
                id="factorySelect"
                value={factoryId}
                onChange={(e) => setFactoryId(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Select Factory --</option>
                {factoryOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <HisabTally filters={{ partyId, factoryId }} />
      </div>
    </div>
  );
};

export default DashboardPage;
