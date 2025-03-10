// auction/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuctionStore } from "@/component/AuctionLogic";
import TeamCard from "@/component/TeamCard";
import PlayerSidebar from "@/component/PlayerSidebar";
import {
  socket,
  connectSocket,
  forceReconnect,
  isSocketConnected,
} from "@/config/socketClient";
import { Toaster } from "react-hot-toast";
import { Sun, Moon, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { toast } from "react-hot-toast";
// Import the diagnostic function - uncomment if you create this file
// import { diagnoseSocketIssues } from "../lib/socket-diagnostic";

export default function AuctionPage() {
  const { isSignedIn } = useUser();
  const {
    teams,
    players,
    loading,
    error,
    fetchInitialData,
    updateTeamData,
    markPlayerAsSold,
  } = useAuctionStore();

  // Add local state to track teams for non-authenticated users
  const [localTeams, setLocalTeams] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [socketStatus, setSocketStatus] = useState("disconnected");

  // Initialize with data from store
  useEffect(() => {
    if (teams.length > 0) {
      setLocalTeams(teams);
    }
  }, [teams]);

  // Initialize data and socket connection
  useEffect(() => {
    // Load initial data from server
    fetchInitialData();

    // For debugging: Diagnose socket connection issues
    // Comment this out in production
    // diagnoseSocketIssues();

    // Initial socket connection
    if (!socket) {
      console.error("Socket not available - check your socketClient.ts file");
    } else {
      console.log("Setting up socket in AuctionPage");
      connectSocket();

      // Set initial status
      setSocketStatus(socket.connected ? "connected" : "disconnected");

      // Setup event handlers
      const handleConnect = () => {
        console.log("Socket connected event in AuctionPage");
        setSocketStatus("connected");
      };

      const handleDisconnect = () => {
        console.log("Socket disconnected event in AuctionPage");
        setSocketStatus("disconnected");
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);

      // Setup periodic status check
      const statusCheckInterval = setInterval(() => {
        const currentStatus = isSocketConnected()
          ? "connected"
          : "disconnected";
        if (currentStatus !== socketStatus) {
          setSocketStatus(currentStatus);
        }
      }, 5000);

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        clearInterval(statusCheckInterval);
      };
    }
  }, [fetchInitialData]);

  // Handle socket updates
  useEffect(() => {
    if (!socket) return;

    const handleAuctionUpdate = (data) => {
      console.log("Socket update received in AuctionPage:", data);
      setLastUpdate(new Date().toISOString());

      // For team updates
      if (data.teamData) {
        // Update local teams array directly
        setLocalTeams((prevTeams) =>
          prevTeams.map((t) => (t.id === data.teamData.id ? data.teamData : t))
        );

        // Only update store if authenticated
        if (isSignedIn) {
          updateTeamData(data.teamData);
        }
      }

      // For player updates - we only update the store if authenticated
      if (data.playerData && isSignedIn) {
        if (data.type === "BID_ACCEPTED") {
          markPlayerAsSold(
            data.playerData.id,
            data.playerData.teamId,
            data.playerData.bidAmount
          );
        } else if (data.type === "PLAYER_REMOVED") {
          markPlayerAsSold(data.playerData.id, null, undefined);
        }
      }
    };

    socket.on("auctionUpdate", handleAuctionUpdate);

    return () => {
      socket.off("auctionUpdate", handleAuctionUpdate);
    };
  }, [isSignedIn, updateTeamData, markPlayerAsSold]);

  // Update availablePlayers in the store when players change
  useEffect(() => {
    if (players && players.length > 0) {
      // Filter out sold players for the available players list
      const availablePlayers = players.filter((player) => !player.sold);

      // Update availablePlayers in the store
      useAuctionStore.setState({ availablePlayers });
    }
  }, [players]);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    // Apply dark mode to document
    if (typeof document !== "undefined") {
      if (newMode) {
        document.documentElement.classList.add("dark");
        document.body.classList.add("bg-gray-900");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("bg-gray-900");
      }
    }
  };

  // Force socket reconnection
  const handleReconnect = () => {
    toast.success("Attempting to reconnect...");
    forceReconnect();

    // Update status after a delay
    setTimeout(() => {
      setSocketStatus(isSocketConnected() ? "connected" : "disconnected");
    }, 2000);
  };

  // Effect to initialize dark mode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("darkMode") === "true";
      setDarkMode(savedMode);

      if (savedMode) {
        document.documentElement.classList.add("dark");
        document.body.classList.add("bg-gray-900");
      }
    }
  }, []);

  // Effect to save dark mode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", darkMode.toString());
    }
  }, [darkMode]);

  if (loading) {
    return (
      <div className={`p-10 text-center ${darkMode ? "text-gray-200" : ""}`}>
        Loading auction data...
      </div>
    );
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  }

  // Use localTeams for rendering to ensure updates for all users
  const teamsToRender = localTeams.length > 0 ? localTeams : teams;

  return (
    <div
      className={`flex h-screen ${darkMode ? "bg-gray-900 text-white" : ""}`}
    >
      <Toaster position="top-right" />

      {/* Use PlayerSidebar */}
      <PlayerSidebar darkMode={darkMode} />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1
            className={`text-3xl font-bold ${
              darkMode
                ? "text-blue-300"
                : "bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent"
            }`}
          >
            Player Auction
          </h1>

          <div className="flex items-center space-x-2">
            {/* Connection Status Indicator */}
            <div className="flex items-center">
              {socketStatus === "connected" ? (
                <Wifi
                  size={18}
                  className={`${
                    darkMode ? "text-green-400" : "text-green-500"
                  } mr-2`}
                />
              ) : (
                <WifiOff
                  size={18}
                  className={`${
                    darkMode ? "text-red-400" : "text-red-500"
                  } mr-2`}
                />
              )}

              <span
                className={`text-xs ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {socketStatus === "connected" ? "Live" : "Offline"}
              </span>

              {socketStatus === "disconnected" && (
                <button
                  onClick={handleReconnect}
                  className={`ml-2 p-1.5 rounded-full ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  title="Reconnect"
                >
                  <RefreshCw
                    size={14}
                    className={darkMode ? "text-gray-300" : "text-gray-600"}
                  />
                </button>
              )}
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } transition-colors duration-200`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-300" />
              ) : (
                <Moon size={20} className="text-blue-700" />
              )}
            </button>
          </div>
        </div>

        <h2
          className={`text-xl font-semibold mb-4 ${
            darkMode ? "text-gray-200" : "text-gray-600"
          }`}
        >
          Teams
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teamsToRender.map((team) => (
            <TeamCard key={team.id} team={team} darkMode={darkMode} />
          ))}
        </div>

        {/* Socket status indicator */}
        {lastUpdate && (
          <div
            className={`fixed bottom-4 right-4 ${
              darkMode ? "bg-gray-800" : "bg-black"
            } bg-opacity-70 text-white p-2 rounded text-xs z-10`}
          >
            Last Update: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
