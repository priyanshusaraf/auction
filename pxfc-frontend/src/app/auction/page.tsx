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
import { RefreshCw, Wifi, WifiOff, Menu, X, GripVertical } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDrag } from "@/hooks/useDrag";
// Import dynamic from next/dynamic for client-side only components
import dynamic from "next/dynamic";

// Import Image component with ssr disabled
const ImageWithNoSSR = dynamic(() => import("next/image"), { ssr: false });

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

  // Local state
  const [localTeams, setLocalTeams] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [draggingSidebar, setDraggingSidebar] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Add mounted state check
  const sidebarRef = useRef(null);
  const dragHandleRef = useRef(null);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize with data from store
  useEffect(() => {
    if (teams.length > 0) {
      setLocalTeams(teams);
    }
  }, [teams]);

  // Initialize data and socket connection
  useEffect(() => {
    fetchInitialData();

    if (!socket) {
      console.error("Socket not available - check your socketClient.ts file");
    } else {
      console.log("Setting up socket in AuctionPage");
      connectSocket();

      setSocketStatus(socket.connected ? "connected" : "disconnected");

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

      // For player updates
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
      const availablePlayers = players.filter((player) => !player.sold);
      useAuctionStore.setState({ availablePlayers });
    }
  }, [players]);

  // Implement basic drag handle for sidebar
  useEffect(() => {
    const handleDragStart = (e) => {
      if (e.target !== dragHandleRef.current) return;
      setDraggingSidebar(true);
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    };

    const handleDragMove = (e) => {
      if (!draggingSidebar) return;
      const newWidth = e.clientX;
      if (newWidth > 250 && newWidth < 500) {
        setSidebarWidth(newWidth);
      }
    };

    const handleDragEnd = () => {
      setDraggingSidebar(false);
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };

    const dragHandle = dragHandleRef.current;
    if (dragHandle) {
      dragHandle.addEventListener("mousedown", handleDragStart);
    }

    return () => {
      if (dragHandle) {
        dragHandle.removeEventListener("mousedown", handleDragStart);
      }
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, [draggingSidebar]);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

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

    setTimeout(() => {
      setSocketStatus(isSocketConnected() ? "connected" : "disconnected");
    }, 2000);
  };

  // Effect to initialize dark mode from localStorage - only run on client
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

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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

  // Use localTeams for rendering
  const teamsToRender = localTeams.length > 0 ? localTeams : teams;

  return (
    <div
      className={`flex h-screen ${darkMode ? "bg-gray-900 text-white" : ""}`}
    >
      <Toaster position="top-right" />

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-full ${
            darkMode ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          {sidebarOpen ? (
            <X
              size={24}
              className={darkMode ? "text-gray-200" : "text-gray-800"}
            />
          ) : (
            <Menu
              size={24}
              className={darkMode ? "text-gray-200" : "text-gray-800"}
            />
          )}
        </button>
      </div>

      {/* Sidebar with drag handle for desktop */}
      <div
        ref={sidebarRef}
        className={`fixed md:relative z-30 h-full transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ width: `${sidebarWidth}px` }}
      >
        <PlayerSidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

        {/* Drag handle - visible only on desktop */}
        <div
          ref={dragHandleRef}
          className="hidden md:flex absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 w-4 h-24 
                   items-center justify-center cursor-col-resize z-40"
        >
          <div
            className={`w-1 h-24 rounded-full ${
              darkMode ? "bg-gray-600" : "bg-gray-300"
            } flex items-center justify-center`}
          >
            <GripVertical
              size={12}
              className={darkMode ? "text-gray-400" : "text-gray-500"}
            />
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto mt-14 md:mt-0">
        <div className="flex justify-between items-center mb-6">
          <h1
            className={`text-2xl md:text-3xl font-bold ${
              darkMode
                ? "text-blue-300"
                : "bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent"
            }`}
          >
            Player Auction
          </h1>

          <div className="flex items-center space-x-3">
            {/* Only render logo after component is mounted (client-side) */}
            {isMounted && (
              <div className="h-8 w-8 md:h-10 md:w-10 relative flex items-center">
                <ImageWithNoSSR
                  src="/assets/logo.png"
                  alt="Tournament Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  onError={(e) => {
                    // Fallback if image not found
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

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
                } hidden sm:inline`}
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
          </div>
        </div>

        <h2
          className={`text-xl font-semibold mb-4 ${
            darkMode ? "text-gray-200" : "text-gray-600"
          }`}
        >
          Teams
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {teamsToRender.map((team) => (
            <TeamCard key={team.id} team={team} darkMode={darkMode} />
          ))}
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
  {teamsToRender.map((team) => (
    <TeamCard key={team.id} team={team} darkMode={darkMode} />
  ))}
</div> */}

        {/* Last update indicator */}
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
