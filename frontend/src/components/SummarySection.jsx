// import React from 'react';

// export const SummaryCard = ({ title, total, paidOrReceived, remaining }) => {
//   return (
//     <div className="bg-gray-50 border rounded-lg p-4 shadow-sm w-full md:w-64">
//       <h4 className="text-lg font-semibold mb-3">{title}</h4>
//       <div className="text-gray-700">
//         <p>
//           <span className="font-semibold">Total:</span> ₹ {total}
//         </p>
//         <p>
//           <span className="font-semibold">{paidOrReceived.label}:</span> ₹ {paidOrReceived.value}
//         </p>
//         <p>
//           <span className="font-semibold">Remaining:</span> ₹ {remaining}
//         </p>
//       </div>
//     </div>
//   );
// };

// const SummarySection = ({ label, total, paidOrReceived, remaining }) => {
//   return (
//     <div className="flex flex-wrap gap-4 my-6">
//       <SummaryCard
//         title={label}
//         total={total}
//         paidOrReceived={paidOrReceived}
//         remaining={remaining}
//       />
//     </div>
//   );
// };

// export default SummarySection;
