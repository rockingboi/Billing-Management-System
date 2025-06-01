import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatCurrency } from '../utils/formatter';
import TransactionTable from '../components/TransactionTable';

const HisabTally = ({ filters }) => {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { partyId, factoryId } = filters || {};

  const fetchHisabData = async () => {
    if (!partyId) {
      setData(null);
      return;
    }
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const partyRes = await axios.get(
        `http://localhost:5001/api/parties/${partyId}/summary`,
        { params }
      );

      let factoryRes = null;
      if (factoryId) {
        factoryRes = await axios.get(
          `http://localhost:5001/api/factories/${factoryId}/summary`,
          { params }
        );
      }

      setData({
        party: partyRes.data,
        factory: factoryRes ? factoryRes.data : null,
      });
    } catch (err) {
      console.error('Error fetching Hisab data:', err);
      setData(null);
    }
  };

  useEffect(() => {
    fetchHisabData();
  }, [partyId, factoryId, startDate, endDate]);

  const exportPDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    // Party Summary
    if (data.party) {
      doc.setFontSize(16);
      doc.text('Party Summary', 14, 20);
      doc.setFontSize(12);
      doc.text(`Total Amount: ₹ ${data.party.totalAmount}`, 14, 30);
      doc.text(`Total Paid: ₹ ${data.party.totalPaid}`, 14, 38);
      doc.text(`Remaining: ₹ ${data.party.remaining}`, 14, 46);

      doc.autoTable({
        startY: 25,
        head: [
          [
            'Date',
            'Vehicle',
            'Weight',
            'Rate',
            'Moisture',
            'Rejection',
            'Duplex',
            'Total',
          ],
        ],
        body: (data.party.transactions || []).map((tx) => [
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

    // Factory Summary if present
    if (data.factory) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Factory Summary', 14, 20);
      doc.setFontSize(12);
      doc.text(`Total Amount: ₹ ${data.factory.totalAmount}`, 14, 30);
      doc.text(`Total Received: ₹ ${data.factory.totalReceived}`, 14, 38);
      doc.text(`Remaining: ₹ ${data.factory.remaining}`, 14, 46);

      doc.autoTable({
        startY: 55,
        head: [['Date', 'Vehicle', 'Weight', 'Rate', 'Total']],
        body: (data.factory.transactions || []).map((tx) => [
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
        ['Total Amount', data.party.totalAmount],
        ['Total Paid', data.party.totalPaid],
        ['Remaining', data.party.remaining],
      ];

      const partyTransactions = [
        [
          'Date',
          'Vehicle No',
          'Weight',
          'Rate',
          'Moisture',
          'Rejection',
          'Duplex',
          'Total Amount',
        ],
        ...(data.party.transactions || []).map((tx) => [
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
        ['Total Amount', data.factory.totalAmount],
        ['Total Received', data.factory.totalReceived],
        ['Remaining', data.factory.remaining],
      ];

      const factoryTransactions = [
        ['Date', 'Vehicle No', 'Weight', 'Rate', 'Total Amount'],
        ...(data.factory.transactions || []).map((tx) => [
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

  if (!partyId) {
    return <p className="text-center text-gray-600 mt-10">Please select a Party to view Hisab Tally.</p>;
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Hisab Tally</h2>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4">
        <div className="mb-2 md:mb-0">
          <label className="block font-semibold mb-1" htmlFor="startDate">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1" htmlFor="endDate">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={exportPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export PDF
        </button>
        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export Excel
        </button>
      </div>

      {data && data.party && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Party Summary</h3>
          <p>
            <strong>Total Amount:</strong> {formatCurrency(data.party.totalAmount)}
          </p>
          <p>
            <strong>Total Paid:</strong> {formatCurrency(data.party.totalPaid)}
          </p>
          <p>
            <strong>Remaining:</strong> {formatCurrency(data.party.remaining)}
          </p>

          <TransactionTable transactions={data.party.transactions} type="party" />
        </div>
      )}

      {data && data.factory && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Factory Summary</h3>
          <p>
            <strong>Total Amount:</strong> {formatCurrency(data.factory.totalAmount)}
          </p>
          <p>
            <strong>Total Received:</strong> {formatCurrency(data.factory.totalReceived)}
          </p>
          <p>
            <strong>Remaining:</strong> {formatCurrency(data.factory.remaining)}
          </p>

          <TransactionTable transactions={data.factory.transactions} type="factory" />
        </div>
      )}
    </div>
  );
};

export default HisabTally;
