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
    if (!partyId && !factoryId) {
      setData(null);
      return;
    }
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
    }
  };

  useEffect(() => {
    fetchHisabData();
  }, [partyId, factoryId, startDate, endDate]);

  const exportPDF = (type = 'all') => {
    if (!data) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    // Helper function to add header
    const addHeader = (title) => {
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('GUPTA TRADING COMPANY', centerX, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(title, centerX, 30, { align: 'center' });
      
      // Add date range if available
      if (startDate && endDate) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Period: ${startDate} to ${endDate}`, centerX, 38, { align: 'center' });
      }
    };

    // Helper function to add summary
    const addSummary = (summaryData, yPos, type) => {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('SUMMARY', 14, yPos);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Amount: ₹ ${summaryData.totalAmount}`, 14, yPos + 8);
      doc.text(`Total ${type === 'party' ? 'Paid' : 'Received'}: ₹ ${summaryData.totalPaid || summaryData.totalReceived}`, 14, yPos + 16);
      doc.text(`Remaining: ₹ ${summaryData.remaining}`, 14, yPos + 24);
    };

    let currentY = 50;

    if ((type === 'all' || type === 'party') && data.party) {
      addHeader('PARTY TRANSACTION REPORT');
      addSummary({ ...data.party, type: 'party' }, currentY, 'party');
      currentY += 40;

      doc.autoTable({
        startY: currentY,
        head: [['Date', 'Vehicle No', 'Weight (kg)', 'Rate (₹)', 'Moisture', 'Rejection', 'Duplex', 'First', 'Second', 'Third', 'Total Amount', 'Remarks']],
        body: (data.party.transactions || []).map(tx => [
          tx.date || '-',
          tx.vehicle_no || '-',
          tx.weight || '-',
          tx.rate || '-',
          tx.moisture || '-',
          tx.rejection || '-',
          tx.duplex || '-',
          tx.first || '-',
          tx.second || '-',
          tx.third || '-',
          `₹ ${tx.total_amount || 0}`,
          tx.remarks || '-',
        ]),
        styles: { 
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      // Add totals at the bottom
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('TOTAL AMOUNT:', 14, finalY);
      doc.text(`₹ ${data.party.totalAmount}`, 50, finalY);
      doc.text('TOTAL PAID:', 14, finalY + 8);
      doc.text(`₹ ${data.party.totalPaid}`, 50, finalY + 8);
      doc.text('REMAINING:', 14, finalY + 16);
      doc.text(`₹ ${data.party.remaining}`, 50, finalY + 16);
    }

    if ((type === 'all' || type === 'factory') && data.factory) {
      if ((type === 'all' && data.party) || type === 'factory') {
        if (type === 'all') {
      doc.addPage();
        }
        addHeader('FACTORY TRANSACTION REPORT');
        addSummary({ ...data.factory, type: 'factory' }, 50, 'factory');

        doc.autoTable({
          startY: 90,
          head: [['Date', 'Vehicle No', 'Weight (kg)', 'Rate (₹)', 'Moisture', 'Rejection', 'Duplex', 'First', 'Second', 'Third', 'Total Amount', 'Remarks']],
          body: (data.factory.transactions || []).map(tx => [
            tx.date || '-',
            tx.vehicle_no || '-',
            tx.weight || '-',
            tx.rate || '-',
            tx.moisture || '-',
            tx.rejection || '-',
            tx.duplex || '-',
            tx.first || '-',
            tx.second || '-',
            tx.third || '-',
            `₹ ${tx.total_amount || 0}`,
            tx.remarks || '-',
          ]),
          styles: { 
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [168, 85, 247],
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
        });

        // Add totals at the bottom
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('TOTAL AMOUNT:', 14, finalY);
        doc.text(`₹ ${data.factory.totalAmount}`, 50, finalY);
        doc.text('TOTAL RECEIVED:', 14, finalY + 8);
        doc.text(`₹ ${data.factory.totalReceived}`, 50, finalY + 8);
        doc.text('REMAINING:', 14, finalY + 16);
        doc.text(`₹ ${data.factory.remaining}`, 50, finalY + 16);
      }
    }

    if (type === 'intersection' && data.party && data.factory) {
      addHeader('INTERSECTION TRANSACTION REPORT');
      
      // Create intersection data
      const partyTransactions = data.party.transactions || [];
      const factoryTransactions = data.factory.transactions || [];
      const intersectionData = [];
      
      partyTransactions.forEach(partyTx => {
        const matchingFactoryTx = factoryTransactions.find(factoryTx => 
          partyTx.party_name === factoryTx.party_name && 
          partyTx.factory_name === factoryTx.factory_name &&
          partyTx.vehicle_no === factoryTx.vehicle_no &&
          partyTx.date === factoryTx.date
        );
        
        if (matchingFactoryTx) {
          intersectionData.push([
            partyTx.date || '-',
            partyTx.vehicle_no || '-',
            partyTx.party_name || '-',
            partyTx.factory_name || '-',
            partyTx.weight || '-',
            partyTx.rate || '-',
            `₹ ${partyTx.total_amount || 0}`,
          ]);
        }
      });

      doc.autoTable({
        startY: 50,
        head: [['Date', 'Vehicle No', 'Party Name', 'Factory Name', 'Weight (kg)', 'Rate (₹)', 'Total Amount']],
        body: intersectionData,
        styles: { 
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
      });

      // Add totals at the bottom
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('INTERSECTION TOTAL:', 14, finalY);
      doc.text(`₹ ${intersectionData.reduce((sum, row) => sum + (parseFloat(row[6].replace('₹ ', '')) || 0), 0).toFixed(2)}`, 50, finalY);
      doc.text('MATCHING RECORDS:', 14, finalY + 8);
      doc.text(`${intersectionData.length}`, 50, finalY + 8);
    }

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
      doc.text('Generated on: ' + new Date().toLocaleDateString(), 14, doc.internal.pageSize.getHeight() - 10);
    }

    const fileName = type === 'all' ? 'COMPLETE_REPORT' : 
                     type === 'intersection' ? 'INTERSECTION_REPORT' : 
                     type.toUpperCase() + '_REPORT';
    doc.save(`GUPTA_TRADING_${fileName}_${Date.now()}.pdf`);
  };

  const exportExcel = (type = 'all') => {
    if (!data) return;

    const wb = XLSX.utils.book_new();

    // Helper function to create a comprehensive report sheet
    const createComprehensiveSheet = (summaryData, transactions, type) => {
      const sheetData = [];
      
      // Company Header
      sheetData.push(['GUPTA TRADING COMPANY']);
      sheetData.push([`${type.toUpperCase()} TRANSACTION REPORT`]);
      sheetData.push(['']);
      
      // Date range
      if (startDate && endDate) {
        sheetData.push(['Period:', `${startDate} to ${endDate}`]);
      } else {
        sheetData.push(['Period:', 'All Time']);
      }
      sheetData.push(['Generated On:', new Date().toLocaleDateString()]);
      sheetData.push(['']);
      
      // Summary Section
      sheetData.push(['FINANCIAL SUMMARY']);
      sheetData.push(['Total Amount', summaryData.totalAmount]);
      sheetData.push([`Total ${type === 'party' ? 'Paid' : 'Received'}`, summaryData.totalPaid || summaryData.totalReceived]);
      sheetData.push(['Remaining', summaryData.remaining]);
      sheetData.push(['']);
      
      // Transaction Details Header
      sheetData.push(['TRANSACTION DETAILS']);
      sheetData.push(['']);
      
      // Table Headers
      const headers = [
        'Date', 'Vehicle No', 'Weight (kg)', 'Rate (₹)', 'Moisture', 'Rejection', 
        'Duplex', 'First', 'Second', 'Third', 'Total Amount', 'Remarks'
      ];
      sheetData.push(headers);
      
      // Transaction Data
      (transactions || []).forEach(tx => {
        sheetData.push([
          tx.date || '-',
          tx.vehicle_no || '-',
          tx.weight || '-',
          tx.rate || '-',
          tx.moisture || '-',
          tx.rejection || '-',
          tx.duplex || '-',
          tx.first || '-',
          tx.second || '-',
          tx.third || '-',
          tx.total_amount || 0,
          tx.remarks || '-',
        ]);
      });
      
      // Totals Row
      sheetData.push(['']);
      sheetData.push(['', '', '', '', '', '', '', '', '', '', 'TOTAL AMOUNT', '']);
      sheetData.push(['', '', '', '', '', '', '', '', '', '', 
        transactions?.reduce((sum, tx) => sum + (parseFloat(tx.total_amount) || 0), 0) || 0, '']);

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      
      // Set column widths
      const colWidths = [
        { wch: 12 }, // Date
        { wch: 15 }, // Vehicle No
        { wch: 12 }, // Weight
        { wch: 10 }, // Rate
        { wch: 10 }, // Moisture
        { wch: 10 }, // Rejection
        { wch: 10 }, // Duplex
        { wch: 8 },  // First
        { wch: 8 },  // Second
        { wch: 8 },  // Third
        { wch: 15 }, // Total Amount
        { wch: 20 }, // Remarks
      ];
      ws['!cols'] = colWidths;
      
      // Style the worksheet
      const range = XLSX.utils.decode_range(ws['!ref']);
      
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!ws[cellAddress]) continue;
          
          // Company title styling
          if (row === 0) {
            ws[cellAddress].s = {
              font: { bold: true, size: 16 },
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: 'E5E7EB' } }
            };
          }
          // Report title styling
          else if (row === 1) {
            ws[cellAddress].s = {
              font: { bold: true, size: 14 },
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: 'F3F4F6' } }
            };
          }
          // Section headers
          else if (row === 7 || row === 12) { // FINANCIAL SUMMARY and TRANSACTION DETAILS
            ws[cellAddress].s = {
              font: { bold: true, size: 12 },
              fill: { fgColor: { rgb: type === 'party' ? 'DBEAFE' : 'EDE9FE' } }
            };
          }
          // Table headers
          else if (row === 14) { // Headers row
            ws[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: type === 'party' ? '3B82F6' : 'A855F7' } },
              alignment: { horizontal: 'center' },
              color: { rgb: 'FFFFFF' }
            };
          }
          // Data rows
          else if (row > 14 && row < sheetData.length - 3) {
            ws[cellAddress].s = {
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: row % 2 === 0 ? 'FFFFFF' : 'F9FAFB' } }
            };
          }
          // Totals row
          else if (row >= sheetData.length - 2) {
            ws[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: 'FEF3C7' } },
              alignment: { horizontal: 'center' }
            };
          }
        }
      }
      
      return ws;
    };

    // Create sheets based on type
    if ((type === 'all' || type === 'party') && data.party) {
      const partySheet = createComprehensiveSheet(data.party, data.party.transactions, 'party');
      XLSX.utils.book_append_sheet(wb, partySheet, 'Party Transactions');
    }

    if ((type === 'all' || type === 'factory') && data.factory) {
      const factorySheet = createComprehensiveSheet(data.factory, data.factory.transactions, 'factory');
      XLSX.utils.book_append_sheet(wb, factorySheet, 'Factory Transactions');
    }

    if (type === 'intersection' && data.party && data.factory) {
      // Create intersection sheet
      const intersectionData = [];
      
      // Company Header
      intersectionData.push(['GUPTA TRADING COMPANY']);
      intersectionData.push(['INTERSECTION TRANSACTION REPORT']);
      intersectionData.push(['']);
      
      // Date range
      if (startDate && endDate) {
        intersectionData.push(['Period:', `${startDate} to ${endDate}`]);
      } else {
        intersectionData.push(['Period:', 'All Time']);
      }
      intersectionData.push(['Generated On:', new Date().toLocaleDateString()]);
      intersectionData.push(['']);
      
      // Description
      intersectionData.push(['DESCRIPTION']);
      intersectionData.push(['Shows only transactions where party name, factory name, vehicle number, and date match between party and factory records']);
      intersectionData.push(['']);
      
      // Table Headers
      const headers = ['Serial No', 'Date', 'Vehicle No', 'Party Name', 'Factory Name', 'Weight (kg)', 'Rate (₹)', 'Total Amount'];
      intersectionData.push(headers);
      
      // Create intersection data
      const partyTransactions = data.party.transactions || [];
      const factoryTransactions = data.factory.transactions || [];
      let serialNo = 1;
      
      partyTransactions.forEach(partyTx => {
        const matchingFactoryTx = factoryTransactions.find(factoryTx => 
          partyTx.party_name === factoryTx.party_name && 
          partyTx.factory_name === factoryTx.factory_name &&
          partyTx.vehicle_no === factoryTx.vehicle_no &&
          partyTx.date === factoryTx.date
        );
        
        if (matchingFactoryTx) {
          intersectionData.push([
            serialNo++,
            partyTx.date || '-',
            partyTx.vehicle_no || '-',
            partyTx.party_name || '-',
            partyTx.factory_name || '-',
            partyTx.weight || '-',
            partyTx.rate || '-',
            partyTx.total_amount || 0,
          ]);
        }
      });
      
      // Add totals
      intersectionData.push(['']);
      intersectionData.push(['INTERSECTION TOTAL:', '', '', '', '', '', '', 
        intersectionData.slice(8).reduce((sum, row) => sum + (parseFloat(row[7]) || 0), 0)
      ]);
      intersectionData.push(['MATCHING RECORDS:', '', '', '', '', '', '', 
        intersectionData.slice(8).length
      ]);

      const intersectionSheet = XLSX.utils.aoa_to_sheet(intersectionData);
      
      // Set column widths
      const colWidths = [
        { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 15 }
      ];
      intersectionSheet['!cols'] = colWidths;
      
      // Style the worksheet
      const range = XLSX.utils.decode_range(intersectionSheet['!ref']);
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!intersectionSheet[cellAddress]) continue;
          
          if (row === 0) {
            intersectionSheet[cellAddress].s = {
              font: { bold: true, size: 16 },
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: 'E5E7EB' } }
            };
          } else if (row === 1) {
            intersectionSheet[cellAddress].s = {
              font: { bold: true, size: 14 },
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: 'F3F4F6' } }
            };
          } else if (row === 7) { // Headers row
            intersectionSheet[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: '6366F1' } },
              alignment: { horizontal: 'center' },
              color: { rgb: 'FFFFFF' }
            };
          } else if (row > 7 && row < intersectionData.length - 3) {
            intersectionSheet[cellAddress].s = {
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: row % 2 === 0 ? 'FFFFFF' : 'F9FAFB' } }
            };
          } else if (row >= intersectionData.length - 3) {
            intersectionSheet[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: 'FEF3C7' } },
              alignment: { horizontal: 'center' }
            };
          }
        }
      }
      
      XLSX.utils.book_append_sheet(wb, intersectionSheet, 'Intersection Report');
    }

    // Create combined summary sheet if both exist and type is 'all'
    if (type === 'all' && data.party && data.factory) {
      const summaryData = [];
      
      // Company Header
      summaryData.push(['GUPTA TRADING COMPANY']);
      summaryData.push(['COMBINED SUMMARY REPORT']);
      summaryData.push(['']);
      
      // Date range
      if (startDate && endDate) {
        summaryData.push(['Period:', `${startDate} to ${endDate}`]);
      } else {
        summaryData.push(['Period:', 'All Time']);
      }
      summaryData.push(['Generated On:', new Date().toLocaleDateString()]);
      summaryData.push(['']);
      
      // Party Summary
      summaryData.push(['PARTY TRANSACTION SUMMARY']);
      summaryData.push(['Total Amount', data.party.totalAmount]);
      summaryData.push(['Total Paid', data.party.totalPaid]);
      summaryData.push(['Remaining', data.party.remaining]);
      summaryData.push(['']);
      
      // Factory Summary
      summaryData.push(['FACTORY TRANSACTION SUMMARY']);
      summaryData.push(['Total Amount', data.factory.totalAmount]);
      summaryData.push(['Total Received', data.factory.totalReceived]);
      summaryData.push(['Remaining', data.factory.remaining]);
      summaryData.push(['']);
      
      // Intersection view - simplified columns
      summaryData.push(['INTERSECTION VIEW (Party + Factory)']);
      summaryData.push(['']);
      const intersectionHeaders = ['Serial No', 'Party Name', 'Factory Name', 'Vehicle No', 'Weight (kg)', 'Rate (₹)', 'Total Amount'];
      summaryData.push(intersectionHeaders);
      
      // Create intersection data (simplified view) - only matching transactions
      const intersectionData = [];
      let serialNo = 1;
      
      const partyTransactions = data.party.transactions || [];
      const factoryTransactions = data.factory.transactions || [];
      
      // Find matching transactions
      partyTransactions.forEach(partyTx => {
        const matchingFactoryTx = factoryTransactions.find(factoryTx => 
          partyTx.party_name === factoryTx.party_name && 
          partyTx.factory_name === factoryTx.factory_name &&
          partyTx.vehicle_no === factoryTx.vehicle_no &&
          partyTx.date === factoryTx.date
        );
        
        if (matchingFactoryTx) {
          intersectionData.push([
            serialNo++,
            partyTx.party_name || '-',
            partyTx.factory_name || '-',
            partyTx.vehicle_no || '-',
            partyTx.weight || '-',
            partyTx.rate || '-',
            partyTx.total_amount || 0,
          ]);
        }
      });
      
      summaryData.push(...intersectionData);
      
      // Add totals
      summaryData.push(['']);
      summaryData.push(['INTERSECTION TOTAL:', '', '', '', '', '', 
        intersectionData.reduce((sum, row) => sum + (parseFloat(row[6]) || 0), 0)
      ]);

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Set column widths for summary
      const summaryColWidths = [
        { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 15 }
      ];
      summarySheet['!cols'] = summaryColWidths;
      
      // Style the summary sheet
      const range = XLSX.utils.decode_range(summarySheet['!ref']);
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!summarySheet[cellAddress]) continue;
          
          if (row === 0) {
            summarySheet[cellAddress].s = {
              font: { bold: true, size: 16 },
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: 'E5E7EB' } }
            };
          } else if (row === 1) {
            summarySheet[cellAddress].s = {
              font: { bold: true, size: 14 },
              alignment: { horizontal: 'center' },
              fill: { fgColor: { rgb: 'F3F4F6' } }
            };
          }
        }
      }
      
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Combined Summary');
    }

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileName = type === 'all' ? 'COMPLETE_REPORT' : 
                     type === 'intersection' ? 'INTERSECTION_REPORT' : 
                     type.toUpperCase() + '_REPORT';
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `GUPTA_TRADING_${fileName}_${Date.now()}.xlsx`);
  };

  if (!partyId && !factoryId) {
    return <p className="text-center text-gray-600 mt-10">Please select a Party or Factory to view Hisab Tally.</p>;
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


      {data?.party && (
        <div className="mb-8">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-blue-800">Party Information</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => exportPDF('party')}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={() => exportExcel('party')}
                  className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Excel
                </button>
              </div>
            </div>
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
          
          <h4 className="text-lg font-semibold mb-2">Party Transaction History</h4>
          <TransactionTable transactions={data.party.transactions} />
        </div>
      )}

      {data?.factory && (
        <div>
          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-purple-800">Factory Information</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => exportPDF('factory')}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={() => exportExcel('factory')}
                  className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Excel
                </button>
              </div>
            </div>
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
          
          <h4 className="text-lg font-semibold mb-2">Factory Transaction History</h4>
          <TransactionTable transactions={data.factory.transactions} />
        </div>
      )}

      {/* Intersection View - when both party and factory are selected */}
      {data?.party && data?.factory && (
        <div className="mt-8">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold text-indigo-800">Intersection View (Matching Transactions)</h3>
                <p className="text-sm text-gray-600 mt-1">Shows only transactions where party name, factory name, vehicle number, and date match between party and factory records</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportPDF('intersection')}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  PDF
                </button>
                <button
                  onClick={() => exportExcel('intersection')}
                  className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Excel
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800">Combined Transaction Summary</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factory Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (₹)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const intersectionData = [];
                    let serialNo = 1;
                    
                    // Create intersection: only show transactions where both party and factory names match
                    const partyTransactions = data.party.transactions || [];
                    const factoryTransactions = data.factory.transactions || [];
                    
                    // Find matching transactions
                    partyTransactions.forEach(partyTx => {
                      const matchingFactoryTx = factoryTransactions.find(factoryTx => 
                        partyTx.party_name === factoryTx.party_name && 
                        partyTx.factory_name === factoryTx.factory_name &&
                        partyTx.vehicle_no === factoryTx.vehicle_no &&
                        partyTx.date === factoryTx.date
                      );
                      
                      if (matchingFactoryTx) {
                        intersectionData.push({
                          serialNo: serialNo++,
                          partyName: partyTx.party_name || '-',
                          factoryName: partyTx.factory_name || '-',
                          vehicleNo: partyTx.vehicle_no || '-',
                          weight: partyTx.weight || '-',
                          rate: partyTx.rate || '-',
                          totalAmount: partyTx.total_amount || 0,
                          type: 'intersection',
                          partyAmount: partyTx.total_amount || 0,
                          factoryAmount: matchingFactoryTx.total_amount || 0
                        });
                      }
                    });
                    
                    return intersectionData.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.serialNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {item.partyName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {item.factoryName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{item.vehicleNo}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.weight}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{item.rate}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">₹{item.totalAmount}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Matching Records: {(() => {
                  const partyTransactions = data.party.transactions || [];
                  const factoryTransactions = data.factory.transactions || [];
                  let matchCount = 0;
                  
                  partyTransactions.forEach(partyTx => {
                    const matchingFactoryTx = factoryTransactions.find(factoryTx => 
                      partyTx.party_name === factoryTx.party_name && 
                      partyTx.factory_name === factoryTx.factory_name &&
                      partyTx.vehicle_no === factoryTx.vehicle_no &&
                      partyTx.date === factoryTx.date
                    );
                    if (matchingFactoryTx) matchCount++;
                  });
                  
                  return matchCount;
                })()}</span>
                <span className="font-semibold">
                  Intersection Total: ₹{(() => {
                    const partyTransactions = data.party.transactions || [];
                    const factoryTransactions = data.factory.transactions || [];
                    let totalAmount = 0;
                    
                    partyTransactions.forEach(partyTx => {
                      const matchingFactoryTx = factoryTransactions.find(factoryTx => 
                        partyTx.party_name === factoryTx.party_name && 
                        partyTx.factory_name === factoryTx.factory_name &&
                        partyTx.vehicle_no === factoryTx.vehicle_no &&
                        partyTx.date === factoryTx.date
                      );
                      if (matchingFactoryTx) {
                        totalAmount += parseFloat(partyTx.total_amount) || 0;
                      }
                    });
                    
                    return totalAmount.toFixed(2);
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HisabTally;
