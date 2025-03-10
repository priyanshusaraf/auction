"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuctionStore } from "@/component/AuctionLogic";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfilePhotoMock from "./ProfilePhotoMock";
import { Button } from "@/components/ui/button";
import { Search, Moon, Sun } from "lucide-react";
import { socket } from "@/config/socketClient";
import dynamic from 'next/dynamic';

// Import Image component with ssr disabled
const ImageWithNoSSR = dynamic(() => import('next/image'), { ssr: false });

export default function PlayerSidebar({ darkMode = false, toggleDarkMode }) {
  const { isSignedIn } = useUser();
  const [searchQuery, setLocalSearchQuery] = useState("");
  const { availablePlayers, setSearchQuery, players } = useAuctionStore();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [localAvailablePlayers, setLocalAvailablePlayers] = useState([]);
  const [soldPlayerIds, setSoldPlayerIds] = useState(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile);
      }
    };
  }, []);

  // Initialize players data from store
  useEffect(() => {
    if (availablePlayers && availablePlayers.length > 0) {
      setLocalAvailablePlayers(availablePlayers);
      
      if (players && players.length > 0) {
        const soldIds = new Set(
          players.filter(p => p.sold).map(p => p.id)
        );
        setSoldPlayerIds(soldIds);
      }
    } else if (players && players.length > 0) {
      const available = players.filter((p) => !p.sold);
      setLocalAvailablePlayers(available);
      
      const soldIds = new Set(
        players.filter(p => p.sold).map(p => p.id)
      );
      setSoldPlayerIds(soldIds);
    }
  }, [availablePlayers, players]);

  // Socket updates
  useEffect(() => {
    if (socket) {
      const handleAuctionUpdate = (data) => {
        // Handle player updates
        if (data.playerData) {
          const playerId = data.playerData.id;
          
          if (data.type === "BID_ACCEPTED") {
            setSoldPlayerIds(prev => {
              const newSet = new Set(prev);
              newSet.add(playerId);
              return newSet;
            });
            
            // Remove from available list
            setLocalAvailablePlayers(prev => 
              prev.filter(p => p.id !== playerId)
            );
          } else if (data.type === "PLAYER_REMOVED") {
            setSoldPlayerIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(playerId);
              return newSet;
            });
            
            // Check if already in list
            const playerExists = localAvailablePlayers.some(p => p.id === playerId);
            
            if (!playerExists) {
              // Find the player in the complete players list
              const player = players.find(p => p.id === playerId);
              if (player) {
                // Add back to available list
                setLocalAvailablePlayers(prev => [...prev, {...player, sold: false}]);
              }
            }
          }
        }
      };

      socket.on("auctionUpdate", handleAuctionUpdate);
      return () => {
        socket.off("auctionUpdate", handleAuctionUpdate);
      };
    }
  }, [players, localAvailablePlayers]);

  // Filter players based on search
  const allPlayers = isSignedIn ? availablePlayers || [] : localAvailablePlayers;
  
  const filteredPlayers =
    searchQuery.trim() === ""
      ? allPlayers
      : allPlayers.filter((player) => {
          const query = searchQuery.toLowerCase();
          return (
            player.name.toLowerCase().includes(query) ||
            player.category.toLowerCase().includes(query) ||
            String(player.rating).includes(query) ||
            String(player.experience || "").toLowerCase().includes(query)
          );
        });

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (setSearchQuery) {
      setSearchQuery(value);
    }
  };

  // Check if a player is sold
  const isPlayerSold = (playerId) => {
    return soldPlayerIds.has(playerId);
  };

  return (
    <>
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl border-r border-gray-800 border-opacity-50 flex flex-col">
        {/* Header */}
        <div className="p-4 flex justify-between items-center mb-2">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400">
              Players
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {isSignedIn ? "Drag players to auction board" : "View available players"}
            </p>
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-300" />
            ) : (
              <Moon size={20} className="text-blue-300" />
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="px-4 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="Search by name, category, rating..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="bg-gray-800 bg-opacity-50 border-gray-700 text-gray-200 pl-10 py-5 h-10 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* If mobile and no search, show prompt */}
        {isMobile && isMounted && searchQuery.trim() === "" && (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-gray-300 font-medium">Search for players</p>
              <p className="text-gray-400 text-sm mt-2">
                Enter a name, category or rating to see available players
              </p>
            </div>
          </div>
        )}

        {/* Player List - Only show if not mobile or if there's a search query */}
        {(!isMobile || searchQuery.trim() !== "") && (
          <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
            <div className="space-y-3">
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => {
                  const soldStatus = isPlayerSold(player.id);
                  // Create a color variable based on category
                  let categoryColor;
                  switch (player.category) {
                    case 'A+':
                      categoryColor = 'bg-purple-700 text-purple-100';
                      break;
                    case 'A':
                      categoryColor = 'bg-indigo-700 text-indigo-100';
                      break;
                    case 'B':
                      categoryColor = 'bg-blue-700 text-blue-100';
                      break;
                    case 'C':
                      categoryColor = 'bg-green-700 text-green-100';
                      break;
                    case 'D':
                      categoryColor = 'bg-yellow-700 text-yellow-100';
                      break;
                    default:
                      categoryColor = 'bg-gray-700 text-gray-100';
                  }
                  
                  return (
                    <div
                      key={player.id}
                      draggable={isSignedIn && !soldStatus}
                      onDragStart={(e) =>
                        isSignedIn && !soldStatus && e.dataTransfer.setData("playerId", player.id)
                      }
                      onClick={() => setSelectedPlayer(player)}
                      className={`p-4 rounded-lg flex items-center gap-4 cursor-pointer 
                        ${soldStatus 
                          ? "bg-gray-800 bg-opacity-40 opacity-60" 
                          : "bg-gray-800 bg-opacity-40 backdrop-blur-sm hover:bg-opacity-60 hover:border-cyan-500 hover:border-opacity-50"} 
                        border border-gray-700 border-opacity-40 transition-all group`}
                    >
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br 
                          ${soldStatus 
                            ? "from-gray-600 to-gray-500" 
                            : "from-cyan-600 to-blue-600"} 
                          rounded-full opacity-0 ${soldStatus ? "" : "group-hover:opacity-30"} transition-opacity`}>
                        </div>
                        {isMounted && player.profilePhoto ? (
                          <ImageWithNoSSR
                            src={player.profilePhoto}
                            alt={player.name}
                            width={48}
                            height={48}
                            className={`rounded-full object-cover ring-2 
                              ${soldStatus 
                                ? "ring-gray-600" 
                                : "ring-gray-700 group-hover:ring-cyan-400"} transition-all`}
                          />
                        ) : (
                          <ProfilePhotoMock
                            name={player.name}
                            size={48}
                            className={`ring-2 
                              ${soldStatus 
                                ? "ring-gray-600" 
                                : "ring-gray-700 group-hover:ring-cyan-400"} transition-all`}
                          />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${soldStatus ? "text-gray-400" : "text-gray-200 group-hover:text-cyan-300"} truncate transition-colors`}>
                            {player.name}
                          </p>
                          {soldStatus && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                              Sold
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full 
                            ${soldStatus 
                              ? "bg-gray-700 text-gray-300" 
                              : categoryColor}`}>
                            {player.category}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            Rating: {player.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-gray-500" />
                  </div>
                  <p className="text-gray-400">No players match your search</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Try different keywords
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Player Details Modal */}
      <Dialog
        open={!!selectedPlayer}
        onOpenChange={(open) => !open && setSelectedPlayer(null)}
      >
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 text-gray-200">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full opacity-30"></div>
                    {isMounted && selectedPlayer.profilePhoto ? (
                      <ImageWithNoSSR
                        src={selectedPlayer.profilePhoto}
                        alt={selectedPlayer.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover ring-2 ring-cyan-500"
                      />
                    ) : (
                      <ProfilePhotoMock
                        name={selectedPlayer.name}
                        size={64}
                        className="ring-2 ring-cyan-500"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                      {selectedPlayer.name}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className="text-gray-400">
                        {selectedPlayer.category}
                      </span>
                      {isPlayerSold(selectedPlayer.id) && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                          Sold
                        </span>
                      )}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 border-opacity-40">
                  <p className="text-gray-400 text-sm mb-1">Experience</p>
                  <p className="text-xl font-medium text-gray-200">
                    {selectedPlayer.experience || "Rookie"}
                  </p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 border-opacity-40">
                  <p className="text-gray-400 text-sm mb-1">Previous Wins</p>
                  <p className="text-xl font-medium text-gray-200">
                    {selectedPlayer.wins || 0}
                  </p>
                </div>
                <div className="col-span-2 bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-gray-700 border-opacity-40">
                  <p className="text-gray-400 text-sm mb-1">Overall Rating</p>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-400 h-2.5 rounded-full"
                        style={{
                          width: `${(parseFloat(selectedPlayer.rating) / 10) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-cyan-300 font-medium">
                      {selectedPlayer.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-400 hover:from-cyan-600 hover:to-blue-500 text-gray-900 font-medium border-none"
                  onClick={() => setSelectedPlayer(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );