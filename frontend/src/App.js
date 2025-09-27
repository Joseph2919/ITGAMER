import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import ReCAPTCHA from 'react-google-recaptcha';
import PuzzleGame from "./components/GameBoard";
import WalletConnect from "./components/WalletConnect";
import Leaderboard from "./components/Leaderboard";
import CryptoFlip from "./components/CryptoFlip";
import './App.css';

const SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Demo key

function App() {
const [wallet, setWallet] = useState(null);
  const [score, setScore] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null); // Google user
  const [flipScore, setFlipScore] = useState(null);
  const [activeTab, setActiveTab] = useState("puzzle"); // NEW: track active tab

const fetchLeaderboard = async () => {
    try {
      const res = await fetch("http://localhost:8080/leaderboard");
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  // ✅ Phantom Wallet connect
  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect({ onlyIfTrusted: false });
        setWallet(resp.publicKey.toString());
        console.log("Connected wallet:", resp.publicKey.toString());
      } catch (err) {
        console.error("Wallet connection rejected:", err);
      }
    } else {
      alert("❌ Phantom Wallet not found. Please install it: https://phantom.app/");
    }
  };

  // ✅ Phantom Wallet disconnect
  const disconnectWallet = async () => {
    if (window.solana) {
      await window.solana.disconnect();
      setWallet(null);
      console.log("Wallet disconnected");
    }
  };

  // ✅ Auto-connect on page load if trusted before
  useEffect(() => {
    if (window.solana && window.solana.isPhantom) {
      window.solana.connect({ onlyIfTrusted: true })
        .then(resp => setWallet(resp.publicKey.toString()))
        .catch(() => console.log("User not connected yet"));
    }
  }, []);

  const handleSubmit = async () => {
    if (!captchaVerified) return alert("Please verify reCAPTCHA.");
    if (!wallet) return alert("Connect wallet first.");
    if (!score) return alert("Enter your score.");

    const res = await fetch("http://localhost:8080/submit-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet, score }),
    });

    const result = await res.json();
    alert(`✅ ${result.message} for wallet ${result.wallet}`);
    await fetchLeaderboard();
  };

  // Google login handlers
  const handleLogin = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser(decoded);
    console.log("Google User:", decoded);
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className={darkMode ? "dark min-h-screen bg-gray-900 text-white p-6" : "min-h-screen bg-gray-100 text-gray-900 p-6"}>
      {/* Header with Title, Google Sign-in, and Dark Mode toggle */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🧠 ItGamer Puzzle Score Submitter</h2>
        <div className="flex items-center gap-4">
          {/* 🔑 Google Login Section */}
          {!user ? (
            <div className="border rounded px-2 py-1 bg-white dark:bg-gray-800 shadow-sm">
              <GoogleLogin
                onSuccess={handleLogin}
                onError={() => console.log("Login Failed")}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img src={user.picture} alt="profile" className="w-8 h-8 rounded-full" />
              <span className="text-sm">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
              >
                Logout
              </button>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition"
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>

      {/* ✅ Phantom Wallet Section */}
      <WalletConnect
        wallet={wallet}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
      />

      {/* TAB SWITCHER */}
      <div className="flex space-x-4 mb-6 justify-center">
        <button
          className={`px-4 py-2 rounded flex items-center gap-2 ${activeTab === "puzzle" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          onClick={() => setActiveTab("puzzle")}
        >
          🧩 <span>Puzzle</span>
        </button>
        <button
          className={`px-4 py-2 rounded flex items-center gap-2 ${activeTab === "flip" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          onClick={() => setActiveTab("flip")}
        >
          🪙 <span>Crypto Flip</span>
        </button>
        <button
          className={`px-4 py-2 rounded flex items-center gap-2 ${activeTab === "leaderboard" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          onClick={() => setActiveTab("leaderboard")}
        >
          🏆 <span>Leaderboard</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      {activeTab === "puzzle" && (
        <>
          <PuzzleGame
            onGameOver={async (finalScore) => {
              alert(`Puzzle completed! Your score: ${finalScore}`);
              setScore(finalScore);

              const res = await fetch("http://localhost:8080/submit-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet, score: finalScore })
              });

              const result = await res.json();
              alert(`✅ ${result.message} for wallet ${result.wallet}`);
              await fetchLeaderboard();
            }}
          />
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="Enter your score"
            className="block mb-4 px-3 py-2 border rounded w-full text-black"
          />
          <ReCAPTCHA sitekey={SITE_KEY} onChange={() => setCaptchaVerified(true)} />
          <button
            onClick={handleSubmit}
            disabled={!captchaVerified}
            className={`mt-4 px-4 py-2 rounded ${captchaVerified ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"}`}
          >
            Submit Score
          </button>
        </>
      )}

      {activeTab === "flip" && (
        <CryptoFlip
          wallet={wallet}
          lastReward={score}
          onGameOver={async (flipResult) => {
            setFlipScore(flipResult);
            if (flipResult > 0) {
              alert(`CryptoFlip win! You earned ${flipResult} points.`);
              const res = await fetch("http://localhost:8080/submit-score", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet, score: flipResult })
              });
              const result = await res.json();
              alert(`✅ ${result.message} for wallet ${result.wallet}`);
              await fetchLeaderboard();
            } else {
              alert("CryptoFlip lost! Better luck next time.");
            }
          }}
        />
      )}

      {activeTab === "leaderboard" && (
        <Leaderboard leaderboard={leaderboard} />
      )}
    </div>
  );
}

export default App;