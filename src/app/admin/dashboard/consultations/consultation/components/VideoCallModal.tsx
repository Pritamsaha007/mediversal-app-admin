import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  MessageSquare,
  Send,
  Paperclip,
  Smile,
} from "lucide-react";
import { getRTCToken } from "../service";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { getChatToken } from "../service";
import AgoraChat from "agora-chat";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  patientName: string;
  doctorName: string;
  doctorId: string;
  paitentId: string;
}

interface Message {
  id: string;
  sender: "doctor" | "patient";
  text: string;
  timestamp: Date;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  consultationId,
  patientName,
  doctorName,
  doctorId,
  paitentId,
}) => {
  const { token } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [rtcToken, setRtcToken] = useState<string>("");
  const [channelName, setChannelName] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const AGORA_CHAT_APP_KEY = "411397938#1602152";
  const chatClient = useRef<any>(null);
  const [isChatLoggedIn, setIsChatLoggedIn] = useState(false);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [uid, setUid] = useState<number>(Math.floor(Math.random() * 1000000));
  const AGORA_APP_ID = process.env.AGORA_APP_ID;
  useEffect(() => {
    if (isCallActive) {
      intervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCallActive]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (isOpen && !isCallActive && !isLoading) {
      initializeCall();
    }
  }, [isOpen]);

  const initializeCall = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await getRTCToken(consultationId, token);

      if (response.success) {
        setRtcToken(response.data.token);
        setChannelName(response.data.channelName);

        // Initialize Agora client
        const agoraClient = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });
        setClient(agoraClient);

        agoraClient.on("user-published", async (user, mediaType) => {
          await agoraClient.subscribe(user, mediaType);

          if (mediaType === "video") {
            setRemoteUsers((prevUsers) => {
              const exists = prevUsers.find((u) => u.uid === user.uid);
              return exists ? prevUsers : [...prevUsers, user];
            });
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }

          setRemoteUsers((prevUsers) => [...prevUsers, user]);
        });

        agoraClient.on("user-unpublished", (user) => {
          setRemoteUsers((prevUsers) =>
            prevUsers.filter((u) => u.uid !== user.uid)
          );
        });
        if (!AGORA_APP_ID) {
          throw new Error("AGORA_APP_ID is missing in environment variables");
        }
        await agoraClient.join(
          AGORA_APP_ID,
          response.data.channelName,
          response.data.token,
          uid
        );

        // Create and publish local tracks
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

        // Publish tracks first
        await agoraClient.publish([videoTrack, audioTrack]);

        // Then set state and play
        setLocalVideoTrack(videoTrack);
        setLocalAudioTrack(audioTrack);

        // Play local video immediately after setting state
        setTimeout(() => {
          if (localVideoRef.current && videoTrack) {
            videoTrack.play(localVideoRef.current);
          }
        }, 100);

        setIsCallActive(true);
        await initializeChat();
        toast.success("Call connected successfully!");
      }
    } catch (error) {
      console.error("Error initializing video call:", error);
      toast.error("Failed to start video call");
    } finally {
      setIsLoading(false);
    }
  };

  const initializeChat = async () => {
    if (!token) return;

    try {
      const userId = consultationId.substring(0, 6).toUpperCase();
      const response = await getChatToken(userId, token);
      console.log("Chat token response:", response);

      if (response.success) {
        chatClient.current.open({
          user: response.data.userId,
          accessToken: response.data.chatToken,
        });
        console.log("Chat initialized for user:", response.data.userId);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Failed to initialize chat");
    }
  };

  const endCall = async () => {
    try {
      if (chatClient.current && isChatLoggedIn) {
        chatClient.current.close();
        setIsChatLoggedIn(false);
      }

      if (localVideoTrack) {
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }
      if (localAudioTrack) {
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      if (client) {
        await client.leave();
        setClient(null);
      }

      setIsCallActive(false);
      setCallDuration(0);
      setRemoteUsers([]);
      toast("Call ended");
      onClose();
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Error ending call");
    }
  };

  const toggleVideo = async () => {
    try {
      if (localVideoTrack) {
        await localVideoTrack.setEnabled(!isVideoEnabled);
        setIsVideoEnabled(!isVideoEnabled);
        toast(isVideoEnabled ? "Video disabled" : "Video enabled");
      }
    } catch (error) {
      toast.error("Failed to toggle video");
    }
  };

  const toggleAudio = async () => {
    try {
      if (localAudioTrack) {
        await localAudioTrack.setEnabled(!isAudioEnabled);
        setIsAudioEnabled(!isAudioEnabled);
        toast(isAudioEnabled ? "Audio muted" : "Audio unmuted");
      }
    } catch (error) {
      toast.error("Failed to toggle audio");
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const sendMessage = async () => {
    if (messageInput.trim() && isChatLoggedIn) {
      try {
        const msgObj = AgoraChat.message.create({
          chatType: "singleChat",
          type: "txt",
          to: paitentId.substring(0, 6).toUpperCase(),
          msg: messageInput,
        });

        await chatClient.current.send(msgObj);

        const newMessage: Message = {
          id: Date.now().toString(),
          sender: "doctor",
          text: messageInput,
          timestamp: new Date(),
        };
        setMessages([...messages, newMessage]);
        setMessageInput("");
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (localVideoTrack) localVideoTrack.close();
      if (localAudioTrack) localAudioTrack.close();
      if (client) client.leave();
    };
  }, []);

  useEffect(() => {
    chatClient.current = new AgoraChat.connection({
      appKey: AGORA_CHAT_APP_KEY,
    });

    chatClient.current.addEventHandler("connection&message", {
      onConnected: () => {
        setIsChatLoggedIn(true);
        console.log("Chat connected successfully");
      },
      onDisconnected: () => {
        setIsChatLoggedIn(false);
        console.log("Chat disconnected");
      },
      onTextMessage: (msg: any) => {
        const newMessage: Message = {
          id: Date.now().toString() + Math.random(),
          sender: msg.from === consultationId ? "doctor" : "patient",
          text: msg.msg,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
      },
      onError: (err: any) => {
        console.error("Chat error:", err);
      },
    });

    return () => {
      if (chatClient.current) {
        chatClient.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (remoteUsers.length > 0 && remoteVideoRef.current) {
      const remoteUser = remoteUsers[0];
      if (remoteUser.videoTrack) {
        remoteUser.videoTrack.play(remoteVideoRef.current);
      }
    }
  }, [remoteUsers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex shadow-2xl">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {doctorName.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {doctorName}
                </h3>
                <p className="text-sm text-gray-500">Video Consultation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isCallActive && (
                <div className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  {formatDuration(callDuration)}
                </div>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          {/* Video Area */}
          <div className="flex-1 relative bg-black">
            {!isCallActive ? (
              // Connecting animation UI
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  {/* Animated pulse rings */}
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-[#0088B1] rounded-full animate-ping opacity-20"></div>
                    <div className="absolute inset-2 bg-[#0088B1] rounded-full animate-ping opacity-30 animation-delay-150"></div>
                    <div className="absolute inset-4 bg-[#0088B1] rounded-full animate-ping opacity-40 animation-delay-300"></div>
                    <div className="absolute inset-6 bg-[#0088B1] rounded-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-white animate-pulse" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold mb-3 animate-pulse">
                    {isLoading
                      ? "Connecting to " + patientName
                      : "Initializing call..."}
                  </h3>

                  {/* Animated dots */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce animation-delay-150"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-300"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce animation-delay-600"></div>
                  </div>

                  <p className="text-gray-400 text-sm">
                    Please wait while we establish the connection
                  </p>
                </div>
              </div>
            ) : (
              // Active call UI
              <div className="relative h-full">
                {/* Remote video (main) */}
                <div
                  ref={remoteVideoRef}
                  className="w-full h-full bg-black flex items-center justify-center"
                >
                  {remoteUsers.length === 0 && (
                    <div className="text-center text-white">
                      <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl font-bold">
                          {patientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xl font-semibold mb-2">
                        {patientName}
                      </p>
                      <p className="text-gray-400">Connected</p>
                    </div>
                  )}
                </div>

                {/* Local video (picture-in-picture) */}
                <div
                  ref={localVideoRef}
                  className="absolute bottom-4 right-4 w-40 h-50 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-[#0088B1]"
                >
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <div className="text-center">
                        <VideoOff className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-white text-sm font-medium">
                          Camera Off
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          {isCallActive && (
            <div className="bg-gray-900 px-6 py-6">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={toggleAudio}
                  className={`p-5 rounded-full transition-all ${
                    isAudioEnabled
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                  title={isAudioEnabled ? "Mute" : "Unmute"}
                >
                  {isAudioEnabled ? (
                    <Mic className="w-6 h-6" />
                  ) : (
                    <MicOff className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-5 rounded-full transition-all ${
                    isVideoEnabled
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                  title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {isVideoEnabled ? (
                    <Video className="w-6 h-6" />
                  ) : (
                    <VideoOff className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={endCall}
                  className="p-5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all"
                  title="End call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>

                <button
                  onClick={toggleChat}
                  className={`p-5 rounded-full transition-all ${
                    isChatOpen
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                  title="Toggle chat"
                  disabled={!isChatLoggedIn}
                >
                  <MessageSquare className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && isCallActive && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
                <button
                  onClick={toggleChat}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Live conversation with {patientName}
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "doctor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          message.sender === "doctor" ? "order-2" : "order-1"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.sender === "doctor"
                              ? "bg-[#0088B1] text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">
                            {message.text}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      {message.sender === "patient" && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 order-0 flex-shrink-0">
                          <span className="text-sm font-medium text-gray-600">
                            {patientName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 text-black py-3 pr-12 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0088B1] text-sm"
                  />
                  {/* <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <Smile className="w-5 h-5 text-gray-500" />
                  </button> */}
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-[#0088B1] hover:bg-[#006f8a] text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallModal;
