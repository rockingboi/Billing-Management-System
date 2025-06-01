import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatCurrency } from '../utils/formatter';
import TransactionTable from '../components/TransactionTable';
import HisabTally from '../pages/HisabTally';

const DashboardPage = () => {
  const [partyId, setPartyId] = useState('');
  const [factoryId, setFactoryId] = useState('');
  const [partyOptions, setPartyOptions] = useState([]);
  const [factoryOptions, setFactoryOptions] = useState([]);
  const [partyData, setPartyData] = useState(null);
  const [factoryData, setFactoryData] = useState(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [partiesRes, factoriesRes] = await Promise.all([
          axios.get('http://localhost:5001/api/parties'),
          axios.get('http://localhost:5001/api/factories'),
        ]);
        setPartyOptions(partiesRes.data);
        setFactoryOptions(factoriesRes.data);
      } catch (err) {
        console.error('Error fetching counts', err);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchPartyData = async () => {
      if (!partyId) return setPartyData(null);
      try {
        const res = await axios.get(`http://localhost:5001/api/parties/${partyId}/summary`);
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
        const res = await axios.get(`http://localhost:5001/api/factories/${factoryId}/summary`);
        setFactoryData(res.data);
      } catch (err) {
        console.error('Error fetching factory summary:', err);
      }
    };
    fetchFactoryData();
  }, [factoryId]);

  const exportSummaryAsPDF = (type) => {
    const data = type === 'party' ? partyData : factoryData;
    if (!data) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor('#059669');
    doc.text(`${type === 'party' ? 'Party' : 'Factory'} Summary`, 14, 22);
    doc.setFontSize(12);
    doc.setTextColor('#374151');
    doc.text(`Total Amount: ₹ ${data.totalAmount}`, 14, 32);
    doc.text(
      `${type === 'party' ? 'Total Paid' : 'Total Received'}: ₹ ${
        type === 'party' ? data.totalPaid : data.totalReceived
      }`,
      14,
      40
    );
    doc.text(`Remaining: ₹ ${data.remaining}`, 14, 48);

    const columns =
      type === 'party'
        ? ['Date', 'Vehicle', 'Weight', 'Rate', 'Moisture', 'Rejection', 'Duplex', 'Total']
        : ['Date', 'Vehicle', 'Weight', 'Rate', 'Total'];

    const rows = data.transactions.map((tx) =>
      type === 'party'
        ? [
            tx.date,
            tx.vehicle_no || '',
            tx.weight,
            tx.rate,
            tx.moisture || '-',
            tx.rejection || '-',
            tx.duplex || '-',
            `₹ ${tx.total_amount}`,
          ]
        : [tx.date, tx.vehicle_no || '', tx.weight, tx.rate, `₹ ${tx.total_amount}`]
    );

    doc.autoTable({
      startY: 60,
      head: [columns],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: '#34D399' },
    });

    doc.save(`${type}_summary_${Date.now()}.pdf`);
  };

  const exportSummaryAsExcel = (type) => {
    const data = type === 'party' ? partyData : factoryData;
    if (!data) return;

    const summarySheet = [
      ['Total Amount', data.totalAmount],
      [type === 'party' ? 'Total Paid' : 'Total Received', type === 'party' ? data.totalPaid : data.totalReceived],
      ['Remaining', data.remaining],
    ];

    const transactionHeaders =
      type === 'party'
        ? ['Date', 'Vehicle No', 'Weight', 'Rate', 'Moisture', 'Rejection', 'Duplex', 'Total Amount']
        : ['Date', 'Vehicle No', 'Weight', 'Rate', 'Total Amount'];

    const transactionRows = data.transactions.map((tx) =>
      type === 'party'
        ? [tx.date, tx.vehicle_no, tx.weight, tx.rate, tx.moisture, tx.rejection, tx.duplex, tx.total_amount]
        : [tx.date, tx.vehicle_no, tx.weight, tx.rate, tx.total_amount]
    );

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.aoa_to_sheet(summarySheet);
    const wsTransactions = XLSX.utils.aoa_to_sheet([transactionHeaders, ...transactionRows]);

    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${type}_summary_${Date.now()}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <h2 className="text-4xl font-extrabold text-gray-900">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Parties</h3>
          <p className="text-5xl font-bold text-blue-600">{partyOptions.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Factories</h3>
          <p className="text-5xl font-bold text-green-600">{factoryOptions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <label htmlFor="partySelect" className="block text-lg font-medium text-gray-700 mb-2">
            Select Party
          </label>
          <select
            id="partySelect"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 shadow-sm placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-300 focus:outline-none transition"
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
          <label htmlFor="factorySelect" className="block text-lg font-medium text-gray-700 mb-2">
            Select Factory
          </label>
          <select
            id="factorySelect"
            value={factoryId}
            onChange={(e) => setFactoryId(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 shadow-sm placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-300 focus:outline-none transition"
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

      <HisabTally filters={{ partyId, factoryId }} />

      {partyData && (
        <section className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-800">Party Summary</h3>
            <div className="flex gap-3">
              <button
                onClick={() => exportSummaryAsPDF('party')}
                className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 transition"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportSummaryAsExcel('party')}
                className="rounded-md bg-green-600 px-4 py-2 text-white font-semibold shadow hover:bg-green-700 transition"
              >
                Export Excel
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-8 text-gray-700">
            <div>
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-xl font-bold text-blue-700">₹ {partyData.totalAmount}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Paid</p>
              <p className="text-xl font-bold text-blue-700">₹ {partyData.totalPaid}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Remaining</p>
              <p className="text-xl font-bold text-red-600">₹ {partyData.remaining}</p>
            </div>
          </div>
          <TransactionTable transactions={partyData.transactions} />
        </section>
      )}

      {factoryData && (
        <section className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-semibold text-gray-800">Factory Summary</h3>
            <div className="flex gap-3">
              <button
                onClick={() => exportSummaryAsPDF('factory')}
                className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 transition"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportSummaryAsExcel('factory')}
                className="rounded-md bg-green-600 px-4 py-2 text-white font-semibold shadow hover:bg-green-700 transition"
              >
                Export Excel
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-8 text-gray-700">
            <div>
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-xl font-bold text-green-700">₹ {factoryData.totalAmount}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Received</p>
              <p className="text-xl font-bold text-green-700">₹ {factoryData.totalReceived}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Remaining</p>
              <p className="text-xl font-bold text-red-600">₹ {factoryData.remaining}</p>
            </div>
          </div>
          <TransactionTable transactions={factoryData.transactions} />
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
