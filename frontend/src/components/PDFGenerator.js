import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function PDFGenerator({ data }) {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Factory-wise Balance Summary', 14, 15);
    const tableColumn = ['Factory', 'Total Loading', 'Total Credit', 'Balance'];
    const tableRows = [];

    data.forEach((factory) => {
      const factoryData = [
        factory.name,
        factory.total_loading,
        factory.total_credit,
        factory.balance,
      ];
      tableRows.push(factoryData);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save('factory_summary.pdf');
  };

  return (
    <button onClick={generatePDF} disabled={!data || data.length === 0}>
      Export to PDF
    </button>
  );
}
