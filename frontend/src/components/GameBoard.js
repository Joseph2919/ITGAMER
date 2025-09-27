import React, { useState, useEffect } from "react";

const cardsArray = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍍"];

function shuffle(array) {
  return [...array, ...array]
    .sort(() => Math.random() - 0.5)
    .map((item, index) => ({ id: index, value: item, flipped: false, matched: false }));
}

export default function PuzzleGame({ onGameOver }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    setCards(shuffle(cardsArray));
  }, []);

  const handleClick = (id) => {
    const newCards = [...cards];
    const clickedCard = newCards.find(c => c.id === id);

    if (clickedCard.flipped || clickedCard.matched || flipped.length === 2) return;

    clickedCard.flipped = true;
    setFlipped([...flipped, clickedCard]);

    if (flipped.length === 1) {
      setMoves(moves + 1);
      const [first] = flipped;
      if (first.value === clickedCard.value) {
        // Match found
        first.matched = true;
        clickedCard.matched = true;
        setFlipped([]);

        // Check if all matched
        if (newCards.every(c => c.matched || c.id === clickedCard.id)) {
          const finalScore = Math.max(10, 100 - moves * 5);
          setTimeout(() => onGameOver(finalScore), 500);
        }
      } else {
        // No match → flip back
        setTimeout(() => {
          first.flipped = false;
          clickedCard.flipped = false;
          setFlipped([]);
          setCards([...newCards]);
        }, 800);
      }
    }

    setCards([...newCards]);
  };

  return (
    <div className="p-4 ">
      <h3 className="text-xl font-bold mb-4, puzzle-tile">🎮 Memory Puzzle</h3>
      <p className="mb-2">Moves: {moves}</p>
      <div className="grid grid-cols-4 gap-3 puzzle-board" >
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={`w-16 h-16 flex items-center justify-center text-2xl rounded-lg cursor-pointer 
              ${card.flipped || card.matched ? "bg-blue-400 text-white" : "bg-gray-300 dark:bg-gray-700"}`}
          >
            {card.flipped || card.matched ? card.value : "❓"}
          </div>
        ))}
      </div>
    </div>
  );
}
