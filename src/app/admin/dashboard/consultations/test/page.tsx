"use client";

import { useState, useEffect, useRef } from "react";
import AgoraChat from "agora-chat";

export default function Home() {
  const appKey = "411397938#1602152";

  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [peerId, setPeerId] = useState("");
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const chatClient = useRef<any>(null);

  const addLog = (log: string) => {
    setLogs((prev) => [...prev, log]);
  };

  const handleLogin = () => {
    if (!userId || !token) {
      addLog("Please enter userId and token");
      return;
    }

    chatClient.current.open({
      user: userId,
      accessToken: token,
    });
  };

  const handleLogout = () => {
    chatClient.current.close();
    setIsLoggedIn(false);
    setUserId("");
    setToken("");
    setPeerId("");
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      addLog("Please enter a message");
      return;
    }

    try {
      const msgObj = AgoraChat.message.create({
        chatType: "singleChat",
        type: "txt",
        to: peerId,
        msg: message,
      });

      await chatClient.current.send(msgObj);
      addLog(`Message sent to ${peerId}: ${message}`);
      setMessage("");
    } catch (err: any) {
      addLog(`Message send failed: ${err.message}`);
    }
  };

  useEffect(() => {
    chatClient.current = new AgoraChat.connection({
      appKey,
    });

    chatClient.current.addEventHandler("connection&message", {
      onConnected: () => {
        setIsLoggedIn(true);
        addLog(`User ${userId} connected successfully`);
      },
      onDisconnected: () => {
        setIsLoggedIn(false);
        addLog("User disconnected");
      },
      onTextMessage: (msg: any) => {
        addLog(`${msg.from}: ${msg.msg}`);
      },
      onTokenWillExpire: () => addLog("Token will expire soon"),
      onTokenExpired: () => addLog("Token expired"),
      onError: (err: any) => addLog(`Error: ${err.message}`),
    });
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white flex flex-col gap-4">
      <h2 className="text-xl text-black font-semibold text-center">
        For Test Purpose Only
      </h2>

      {!isLoggedIn ? (
        <>
          <div>
            <label className="font-medium text-black">User ID</label>
            <input
              className="w-full text-black border px-3 py-2 rounded mt-1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
          </div>

          <div>
            <label className="font-medium text-black">Token</label>
            <input
              className="w-full text-black border px-3 py-2 rounded mt-1"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter token"
            />
          </div>

          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg text-black font-medium">Welcome, {userId}</h3>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>

          <div>
            <label className="font-medium text-black">Reciver User ID</label>
            <input
              className="w-full text-black border px-3 py-2 rounded mt-1"
              value={peerId}
              onChange={(e) => setPeerId(e.target.value)}
              placeholder="Enter peer user ID"
            />
          </div>

          <div>
            <label className="font-medium text-black">Message</label>
            <div className="flex gap-2 mt-1">
              <input
                className="flex-1 text-black border px-3 py-2 rounded"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type message"
              />
              <button
                className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}

      <h3 className="text-lg font-semibold text-black">Outputs</h3>
      <div className="h-64 overflow-y-auto border p-3 text-green-600 rounded text-sm bg-gray-50">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
