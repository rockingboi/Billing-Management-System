// import React from "react";

// const FilterPanel = ({ filters, setFilters, parties, factories }) => {
//   return (
//     <div className="mb-6 p-4 bg-gray-50 rounded shadow flex flex-wrap gap-6 items-end">
//       {/* Party Dropdown */}
//       <div className="flex flex-col">
//         <label htmlFor="party" className="mb-1 font-semibold">Party</label>
//         <select
//           id="party"
//           className="border px-3 py-2 rounded"
//           value={filters.partyId || ""}
//           onChange={(e) =>
//             setFilters((prev) => ({
//               ...prev,
//               partyId: e.target.value ? parseInt(e.target.value) : null,
//             }))
//           }
//         >
//           <option value="">All Parties</option>
//           {parties.map((p) => (
//             <option key={p.id} value={p.id}>{p.name}</option>
//           ))}
//         </select>
//       </div>

//       {/* Factory Dropdown */}
//       <div className="flex flex-col">
//         <label htmlFor="factory" className="mb-1 font-semibold">Factory</label>
//         <select
//           id="factory"
//           className="border px-3 py-2 rounded"
//           value={filters.factoryId || ""}
//           onChange={(e) =>
//             setFilters((prev) => ({
//               ...prev,
//               factoryId: e.target.value ? parseInt(e.target.value) : null,
//             }))
//           }
//         >
//           <option value="">All Factories</option>
//           {factories.map((f) => (
//             <option key={f.id} value={f.id}>{f.name}</option>
//           ))}
//         </select>
//       </div>

//       {/* Start Date */}
//       <div className="flex flex-col">
//         <label htmlFor="startDate" className="mb-1 font-semibold">Start Date</label>
//         <input
//           id="startDate"
//           type="date"
//           className="border px-3 py-2 rounded"
//           value={filters.startDate || ""}
//           onChange={(e) =>
//             setFilters((prev) => ({ ...prev, startDate: e.target.value }))
//           }
//         />
//       </div>

//       {/* End Date */}
//       <div className="flex flex-col">
//         <label htmlFor="endDate" className="mb-1 font-semibold">End Date</label>
//         <input
//           id="endDate"
//           type="date"
//           className="border px-3 py-2 rounded"
//           value={filters.endDate || ""}
//           onChange={(e) =>
//             setFilters((prev) => ({ ...prev, endDate: e.target.value }))
//           }
//         />
//       </div>
//     </div>
//   );
// };

// export default FilterPanel;
