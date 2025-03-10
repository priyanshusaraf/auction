// socket-diagnostic.ts
// Add this in a new file and import/call the diagnoseSocketIssues function in your AuctionPage component

import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

/**
 * Comprehensive Socket.IO connection diagnostics
 * Call this in your AuctionPage useEffect to debug connection issues
 */
export const diagnoseSocketIssues = () => {
  console.log("=== SOCKET.IO CONNECTION DIAGNOSTIC ===");

  // 1. Check environment variables
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log("NEXT_PUBLIC_API_URL:", apiUrl || "Not defined");

  // 2. Test direct connection to different variations of the URL
  const testUrls = [
    "http://localhost:5000",
    apiUrl || "http://localhost:5000",
    window.location.origin,
    "/", // Relative URL (connects to same origin)
  ];

  // Log network information
  console.log("Current origin:", window.location.origin);
  console.log("Current protocol:", window.location.protocol);

  // Test each possible URL
  testUrls.forEach((url, index) => {
    console.log(`Testing connection to URL ${index + 1}: ${url}`);

    const testSocket = io(url, {
      transports: ["websocket", "polling"],
      path: "/socket.io",
      timeout: 5000,
      reconnectionAttempts: 1,
      reconnectionDelay: 1000,
    });

    testSocket.on("connect", () => {
      console.log(`✅ SUCCESSFUL CONNECTION to ${url}!`);
      console.log(`Socket ID: ${testSocket.id}`);

      // Test ping-pong
      testSocket.emit("ping", { test: true, timestamp: Date.now() });

      // Set a timeout to close test connection
      setTimeout(() => {
        testSocket.disconnect();
        console.log(`Test connection to ${url} closed`);
      }, 5000);
    });

    testSocket.on("connect_error", (err) => {
      console.log(`❌ CONNECTION ERROR to ${url}: ${err.message}`);
    });

    testSocket.on("pong", (data) => {
      console.log(`✅ RECEIVED PONG from ${url}`, data);
    });
  });

  // 3. Check for common issues
  if (window.location.protocol === "https:" && apiUrl?.startsWith("http:")) {
    console.error(
      "❌ Mixed content issue detected: trying to connect to HTTP from HTTPS page"
    );
    toast.error("Socket connection issue: Mixed content");
  }

  if (!apiUrl) {
    console.warn(
      "⚠️ No NEXT_PUBLIC_API_URL defined, using default. This might cause issues."
    );
    toast.error("Socket config issue: Missing API URL");
  }
};

/**
 * Create a singleton socket that works
 * Call setupWorkingSocket() in your app and use the returned socket
 */
export const setupWorkingSocket = () => {
  // Try progressively more permissive options until one works
  const socketOptions = [
    // Option 1: Default with websocket first
    {
      transports: ["websocket", "polling"],
      path: "/socket.io",
    },
    // Option 2: Polling only
    {
      transports: ["polling"],
      path: "/socket.io",
    },
    // Option 3: Full options with longer timeouts
    {
      transports: ["websocket", "polling"],
      path: "/socket.io",
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 60000,
    },
  ];

  // Try to connect with first option set
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
  console.log("Attempting connection to:", apiUrl);

  const socket = io(apiUrl, socketOptions[0]);

  // Track connection attempts
  let optionIndex = 0;
  let reconnectInterval: any = null;

  socket.on("connect", () => {
    console.log("Socket connected successfully!");
    clearInterval(reconnectInterval);
    toast.success("Live updates connected");
  });

  socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);

    // If not connected after 5 seconds, try next option set
    if (!reconnectInterval) {
      reconnectInterval = setInterval(() => {
        if (socket.connected) {
          clearInterval(reconnectInterval);
          return;
        }

        optionIndex++;
        if (optionIndex < socketOptions.length) {
          console.log(`Trying connection option set ${optionIndex + 1}`);
          socket.disconnect();

          // Apply new options
          Object.keys(socketOptions[optionIndex]).forEach((key) => {
            (socket as any).io.opts[key] = (socketOptions[optionIndex] as any)[
              key
            ];
          });

          socket.connect();
        } else {
          clearInterval(reconnectInterval);
          toast.error("Could not establish live connection");
        }
      }, 5000);
    }
  });

  return socket;
};

/**
 * Check server connectivity
 * @param apiUrl The base API URL to test
 */
export const checkServerConnectivity = async (
  apiUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
) => {
  try {
    console.log("Testing server connectivity to:", apiUrl);

    // Test regular API endpoint
    const apiResponse = await fetch(`${apiUrl}/api/teams`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (apiResponse.ok) {
      console.log("✅ API endpoint reachable");
    } else {
      console.error("❌ API endpoint returned:", apiResponse.status);
    }

    return apiResponse.ok;
  } catch (error) {
    console.error("❌ Cannot reach server:", error);
    return false;
  }
};
