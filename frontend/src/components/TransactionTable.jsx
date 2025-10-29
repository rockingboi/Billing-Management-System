import React from 'react';
import { Calendar, Truck, Weight, DollarSign, FileText } from 'lucide-react';
import { formatCurrency } from '../utils/formatter';

const getRowStyle = (type) => {
  switch (type) {
    case 'party_transaction':
      return 'border-l-4 border-l-blue-500';
    case 'party_payment':
      return 'border-l-4 border-l-green-500';
    case 'factory_transaction':
      return 'border-l-4 border-l-orange-500';
    case 'factory_payment':
      return 'border-l-4 border-l-purple-500';
    default:
      return '';
  }
};

const TransactionTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No transactions available</p>
        <p className="text-gray-400 text-sm mt-2">Transactions will appear here once data is available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="modern-table">
          <thead>
            <tr>
              <th className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span>#</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Date</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <span>Party</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <span>Factory</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <Truck size={16} />
                  <span>Vehicle</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <Weight size={16} />
                  <span>Weight</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  <span>Rate</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <span>Moisture</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <span>Rejection</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <span>Duplex</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <span>First</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <span>Second</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <span>Third</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  <span>Amount</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} />
                  <span>Remaining</span>
                </div>
              </th>
              <th>
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>Remarks</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr 
                key={idx} 
                className={`${getRowStyle(tx.type)} hover:bg-gray-50`}
              >
                <td className="text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    {tx.serial_number ?? idx + 1}
                  </span>
                </td>
                <td className="font-medium">
                  {tx.date ? (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.party_name ? (
                    <span className="text-sm font-medium text-gray-900">
                      {tx.party_name}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.factory_name ? (
                    <span className="text-sm font-medium text-gray-900">
                      {tx.factory_name}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.vehicle_no ? (
                    <span className="font-mono text-sm text-gray-900">
                      {tx.vehicle_no}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.weight ? (
                    <span className="text-sm font-medium text-gray-900">
                      {tx.weight} kg
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.rate ? (
                    <span className="text-sm font-medium text-gray-900">
                      ₹{tx.rate}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.moisture !== undefined && tx.moisture !== null ? (
                    <span className="text-sm text-gray-900">
                      {tx.moisture}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.rejection !== undefined && tx.rejection !== null ? (
                    <span className="text-sm text-gray-900">
                      {tx.rejection}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.duplex !== undefined && tx.duplex !== null ? (
                    <span className="text-sm text-gray-900">
                      {tx.duplex}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.first !== undefined && tx.first !== null ? (
                    <span className="text-sm text-gray-900">
                      {tx.first}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.second !== undefined && tx.second !== null ? (
                    <span className="text-sm text-gray-900">
                      {tx.second}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.third !== undefined && tx.third !== null ? (
                    <span className="text-sm text-gray-900">
                      {tx.third}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(
                      tx.total_amount ||
                      tx.amount_paid ||
                      tx.amount_received ||
                      0
                    )}
                  </span>
                </td>
                <td>
                  {tx.remaining_amount !== undefined ? (
                    <span className={`font-semibold ${
                      tx.remaining_amount > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(tx.remaining_amount)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>
                  {tx.remarks ? (
                    <span className="text-sm text-gray-600">
                      {tx.remarks}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
};

export default TransactionTable;
