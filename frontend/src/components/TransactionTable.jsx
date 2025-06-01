import React from "react";

function TransactionTable({ transactions }) {
  if (!transactions) {
    return <p className="text-gray-500">Loading transactions...</p>;
  }

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return <p className="text-gray-500">No transactions available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-300 rounded">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 border text-left">Date</th>
            <th className="px-4 py-2 border text-right">Party</th>
            <th className="px-4 py-2 border text-right">Factory</th>
            <th className="px-4 py-2 border text-right">Weight (kg)</th>
            <th className="px-4 py-2 border text-right">Rate (₹)</th>
            <th className="px-4 py-2 border text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, index) => {
            const {
              date,
              party_name = "-",
              factory_name = "-",
              weight,
              rate,
              amount,
            } = txn;

            const formattedDate = date
              ? new Date(date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "-";

            const calculatedAmount =
              amount ??
              (typeof rate === "number" &&
              typeof weight === "number"
                ? rate * weight
                : 0);

            return (
              <tr
                key={txn.id || `${date}-${party_name}-${factory_name}-${index}`}
                className="text-center border-t hover:bg-gray-50"
              >
                <td className="px-4 py-2 border text-left">{formattedDate}</td>
                <td className="px-4 py-2 border text-right">{party_name}</td>
                <td className="px-4 py-2 border text-right">{factory_name}</td>
                <td className="px-4 py-2 border text-right">{weight || "-"}</td>
                <td className="px-4 py-2 border text-right">{rate || "-"}</td>
                <td className="px-4 py-2 border text-right">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(calculatedAmount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
