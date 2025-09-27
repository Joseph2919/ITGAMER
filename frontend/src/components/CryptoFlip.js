import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

const choices = ["Heads", "Tails"];

export default function CryptoFlip({ wallet, lastReward = 0, onGameOver }) {
  const [bet, setBet] = useState(Math.floor(lastReward * 0.1));
  const [choice, setChoice] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setBet(Math.floor(lastReward * 0.1));
  }, [lastReward]);

  const handleFlip = () => {
    if (!wallet) {
      alert("Connect your wallet first!");
      return;
    }
    if (!choice) {
      alert("Please choose Heads or Tails first!");
      return;
    }
    if (bet < 1) {
      alert("Bet amount must be at least 1.");
      return;
    }

    setFlipping(true);
    setResult(null);
    setShowConfetti(false);

    setTimeout(() => {
      const outcomes = ["Heads", "Tails"];
      const flipResult = outcomes[Math.floor(Math.random() * outcomes.length)];
      setResult(flipResult);
      setFlipping(false);

      const win = flipResult === choice;
      if (win) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000); // Hide confetti after 3s
      }
      onGameOver(win ? bet * 2 : 0);
    }, 1800);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-yellow-50 rounded-3xl shadow-2xl max-w-md mx-auto relative">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
      <h3 className="text-3xl font-extrabold mb-4 text-purple-700 drop-shadow">🪙 Crypto Flip</h3>

      {/* Bet Amount */}
      <div className="mb-2">
        <span className="font-semibold text-purple-700">Bet (10% of last reward): </span>
        <input
          type="number"
          value={bet}
          min={1}
          readOnly
          className="px-3 py-1 border-2 border-purple-300 rounded-lg bg-gray-100 w-24 text-center font-bold text-purple-700"
        />
      </div>

      {/* Choice Buttons */}
      <div className="flex gap-6 mb-6 mt-2">
        {choices.map((c) => (
          <button
            key={c}
            onClick={() => setChoice(c)}
            className={`px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-200 border-2 ${
              choice === c
                ? "bg-yellow-400 text-white border-yellow-500 scale-110"
                : "bg-white text-purple-700 border-purple-200 hover:bg-yellow-100"
            }`}
            disabled={flipping}
          >
            {c === "Heads" ? "🪙 Heads" : "🪙 Tails"}
          </button>
        ))}
      </div>

      {/* Coin Animation */}
      <motion.div
        className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-extrabold text-white shadow-2xl mb-4 border-4 border-yellow-300"
        style={{
          background: flipping
            ? "linear-gradient(135deg, #facc15 40%, #f59e42 100%)"
            : result === "Heads"
            ? "linear-gradient(135deg, #facc15 60%, #fffbe6 100%)"
            : result === "Tails"
            ? "linear-gradient(135deg, #a78bfa 60%, #f3e8ff 100%)"
            : "linear-gradient(135deg, #facc15 40%, #f59e42 100%)",
        }}
        animate={{
          rotateY: flipping ? [0, 360, 720, 1080] : 0,
          scale: flipping ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      >
        {!flipping && !result && "?"}
        {!flipping && result === "Heads" && "🪙"}
        {!flipping && result === "Tails" && "🪙"}
      </motion.div>

      {/* Flip Button */}
      <button
        onClick={handleFlip}
        disabled={flipping || !wallet || bet < 1}
        className="mt-2 px-10 py-3 rounded-full bg-green-500 text-white font-bold text-lg shadow-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50"
      >
        {flipping ? "Flipping..." : "Flip Coin"}
      </button>

      {/* Result */}
      {result && !flipping && (
        <div className="mt-6 text-2xl font-bold">
          {result === choice ? (
            <p className="text-green-600 drop-shadow">🎉 You won! It’s {result}! 🎉</p>
          ) : (
            <p className="text-red-600 drop-shadow">😢 You lost! It’s {result}! 😢</p>
          )}
        </div>
      )}
    </div>
  );
}