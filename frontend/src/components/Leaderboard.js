import React from "react";

const Leaderboard = ({ leaderboard }) => (
  <div>
    <h3 className="text-xl font-semibold mt-8">🏆 Leaderboard</h3>
    <table className="table-auto border-collapse border border-gray-400 mt-4 w-full leaderboard-table">
      <thead>
        <tr className="bg-gray-200 dark:bg-gray-700">
          <th className="border px-4 py-2">Wallet</th>
          <th className="border px-4 py-2">Score</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard.map((entry, idx) => (
          <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-800">
            <td className="border px-4 py-2">{`${entry.wallet.slice(0, 4)}...${entry.wallet.slice(-4)}`}</td>
            <td className="border px-4 py-2 text-center">{entry.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Leaderboard;