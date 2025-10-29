import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { formatCurrency } from '../utils/formatter';
import TransactionTable from './TransactionTable';

const EnhancedHisabTally = ({ filters }) => {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showSummary, setShowSummary] = useState(true);

  const { partyId, factoryId } = filters || {};

  const fetchHisabData = async () => {
    if (!partyId && !factoryId) {
      setData(null);
      return;
    }
    
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      let partyData = null;
      let factoryData = null;

      // Fetch party summary if partyId is provided
      if (partyId) {
        const partyRes = await axios.get(
          `http://localhost:5001/api/transactions/summary/party/${partyId}`,
          { params }
        );
        partyData = partyRes.data;
      }

      // Fetch factory summary if factoryId is provided
      if (factoryId) {
        const factoryRes = await axios.get(
          `http://localhost:5001/api/transactions/summary/factory/${factoryId}`,
          { params }
        );
        factoryData = factoryRes.data;
      }

      setData({
        party: partyData,
        factory: factoryData,
      });
    } catch (err) {
      console.error('Error fetching Hisab data:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHisabData();
  }, [partyId, factoryId, startDate, endDate]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filterTransactions = (transactions) => {
    if (!transactions) return [];
    
    let filtered = transactions;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.vehicle_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.factory_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (sortBy === 'total_amount') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const exportPDF = () => {
    if (!data) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor('#059669');
    doc.text('GUPTA TRADING COMPANY - HISAB TALLY', 14, 22);
    doc.setFontSize(12);
    doc.setTextColor('#374151');
    
    let yPosition = 40;

    if (data.party) {
      doc.text(`Party: ${data.party.party?.name || 'N/A'}`, 14, yPosition);
      yPosition += 10;
      doc.text(`Total Amount: ₹ ${data.party.totalAmount}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Total Paid: ₹ ${data.party.totalPaid}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Remaining: ₹ ${data.party.remaining}`, 14, yPosition);
      yPosition += 15;

      const filteredTransactions = filterTransactions(data.party.transactions);
      doc.autoTable({
        startY: yPosition,
        head: [['Date', 'Vehicle', 'Weight', 'Rate', 'Moisture', 'Rejection', 'Duplex', 'Total']],
        body: filteredTransactions.map(tx => [
          tx.date,
          tx.vehicle_no || '',
          tx.weight,
          tx.rate,
          tx.moisture || '-',
          tx.rejection || '-',
          tx.duplex || '-',
          `₹ ${tx.total_amount}`,
        ]),
        styles: { fontSize: 9 },
      });
    }

    if (data.factory) {
      if (data.party) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`Factory: ${data.factory.factory?.name || 'N/A'}`, 14, yPosition);
      yPosition += 10;
      doc.text(`Total Amount: ₹ ${data.factory.totalAmount}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Total Received: ₹ ${data.factory.totalReceived}`, 14, yPosition);
      yPosition += 8;
      doc.text(`Remaining: ₹ ${data.factory.remaining}`, 14, yPosition);
      yPosition += 15;

      const filteredTransactions = filterTransactions(data.factory.transactions);
      doc.autoTable({
        startY: yPosition,
        head: [['Date', 'Vehicle', 'Weight', 'Rate', 'Total']],
        body: filteredTransactions.map(tx => [
          tx.date,
          tx.vehicle_no || '',
          tx.weight,
          tx.rate,
          `₹ ${tx.total_amount}`,
        ]),
        styles: { fontSize: 9 },
      });
    }

    doc.save(`hisab_tally_${Date.now()}.pdf`);
  };

  const exportExcel = () => {
    if (!data) return;

    const wb = XLSX.utils.book_new();

    if (data.party) {
      const partySummary = [
        ['Party Name', data.party.party?.name || 'N/A'],
        ['Total Amount', data.party.totalAmount],
        ['Total Paid', data.party.totalPaid],
        ['Remaining', data.party.remaining],
      ];

      const filteredTransactions = filterTransactions(data.party.transactions);
      const partyTransactions = [
        ['Date', 'Vehicle No', 'Weight', 'Rate', 'Moisture', 'Rejection', 'Duplex', 'Total Amount'],
        ...filteredTransactions.map(tx => [
          tx.date,
          tx.vehicle_no,
          tx.weight,
          tx.rate,
          tx.moisture,
          tx.rejection,
          tx.duplex,
          tx.total_amount,
        ]),
      ];

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(partySummary), 'Party Summary');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(partyTransactions), 'Party Transactions');
    }

    if (data.factory) {
      const factorySummary = [
        ['Factory Name', data.factory.factory?.name || 'N/A'],
        ['Total Amount', data.factory.totalAmount],
        ['Total Received', data.factory.totalReceived],
        ['Remaining', data.factory.remaining],
      ];

      const filteredTransactions = filterTransactions(data.factory.transactions);
      const factoryTransactions = [
        ['Date', 'Vehicle No', 'Weight', 'Rate', 'Total Amount'],
        ...filteredTransactions.map(tx => [
          tx.date,
          tx.vehicle_no,
          tx.weight,
          tx.rate,
          tx.total_amount,
        ]),
      ];

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(factorySummary), 'Factory Summary');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(factoryTransactions), 'Factory Transactions');
    }

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `hisab_tally_${Date.now()}.xlsx`);
  };

  if (!partyId && !factoryId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Selection</h3>
        <p className="mt-1 text-sm text-gray-500">Please select a Party or Factory to view Hisab Tally.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Hisab Tally</h2>
            <p className="text-blue-100 mt-1">Financial summary and transaction details</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              {showSummary ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showSummary ? 'Hide Summary' : 'Show Summary'}
            </button>
            <button
              onClick={fetchHisabData}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date</option>
              <option value="total_amount">Amount</option>
              <option value="vehicle_no">Vehicle</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportPDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {data?.party && (
              <div className="mb-8">
                {showSummary && (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h3 className="text-xl font-semibold mb-3 text-blue-800">Party Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>Name:</strong> {data.party.party?.name || 'N/A'}</p>
                          <p><strong>Contact:</strong> {data.party.party?.contact || 'N/A'}</p>
                        </div>
                        <div>
                          <p><strong>Address:</strong> {data.party.party?.address || 'N/A'}</p>
                          <p><strong>GSTIN:</strong> {data.party.party?.gstin || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <h3 className="text-xl font-semibold mb-3 text-green-800">Financial Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.party.totalAmount)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Paid</p>
                          <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.party.totalPaid)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Remaining</p>
                          <p className={`text-2xl font-bold ${data.party.remaining >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(data.party.remaining)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <h4 className="text-lg font-semibold mb-2">Transaction History</h4>
                <TransactionTable transactions={filterTransactions(data.party.transactions)} />
              </div>
            )}

            {data?.factory && (
              <div>
                {showSummary && (
                  <>
                    <div className="bg-purple-50 p-4 rounded-lg mb-4">
                      <h3 className="text-xl font-semibold mb-3 text-purple-800">Factory Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>Name:</strong> {data.factory.factory?.name || 'N/A'}</p>
                          <p><strong>Contact:</strong> {data.factory.factory?.contact || 'N/A'}</p>
                        </div>
                        <div>
                          <p><strong>Address:</strong> {data.factory.factory?.address || 'N/A'}</p>
                          <p><strong>GSTIN:</strong> {data.factory.factory?.gstin || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg mb-4">
                      <h3 className="text-xl font-semibold mb-3 text-orange-800">Financial Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-orange-600">{formatCurrency(data.factory.totalAmount)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Received</p>
                          <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.factory.totalReceived)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Remaining</p>
                          <p className={`text-2xl font-bold ${data.factory.remaining >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(data.factory.remaining)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <h4 className="text-lg font-semibold mb-2">Transaction History</h4>
                <TransactionTable transactions={filterTransactions(data.factory.transactions)} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedHisabTally;
