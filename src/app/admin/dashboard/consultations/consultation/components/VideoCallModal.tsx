import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Settings,
} from "lucide-react";
import { getRTCToken } from "../service/consultationService";
import { useAdminStore } from "@/app/store/adminStore";
import toast from "react-hot-toast";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  patientName: string;
  doctorName: string;
}

const AGORA_APP_ID = "71fe8d0ae7c145ae9e288271571e5006";

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  consultationId,
  patientName,
  doctorName,
}) => {
  const { token } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [rtcToken, setRtcToken] = useState<string>("");
  const [channelName, setChannelName] = useState<string>("");

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [uid, setUid] = useState<number>(Math.floor(Math.random() * 1000000));

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

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

        // Set up event listeners
        agoraClient.on("user-published", async (user, mediaType) => {
          await agoraClient.subscribe(user, mediaType);

          if (mediaType === "video" && remoteVideoRef.current) {
            user.videoTrack?.play(remoteVideoRef.current);
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

        // Join the channel
        await agoraClient.join(
          AGORA_APP_ID,
          response.data.channelName,
          response.data.token,
          uid
        );

        // Create and publish local tracks
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

        setLocalVideoTrack(videoTrack);
        setLocalAudioTrack(audioTrack);

        // Play local video
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }

        // Publish tracks
        await agoraClient.publish([videoTrack, audioTrack]);

        setIsCallActive(true);
        toast.success("Call connected successfully!");
      }
    } catch (error) {
      console.error("Error initializing video call:", error);
      toast.error("Failed to start video call");
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = async () => {
    try {
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

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (localVideoTrack) localVideoTrack.close();
      if (localAudioTrack) localAudioTrack.close();
      if (client) client.leave();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Video Consultation
              </h3>
              <p className="text-sm text-gray-600">
                {patientName} • Dr. {doctorName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isCallActive && (
              <div className="text-sm font-medium text-gray-600">
                {formatDuration(callDuration)}
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Area */}
        <div className="relative bg-gray-900 h-96">
          {!isCallActive ? (
            // Pre-call UI
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Ready to start consultation?
                </h3>
                <p className="text-gray-300 mb-6">
                  Click the button below to connect with {patientName}
                </p>
                <button
                  onClick={initializeCall}
                  disabled={isLoading}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Connecting..." : "Start Call"}
                </button>
              </div>
            </div>
          ) : (
            // Active call UI
            <div className="relative h-full">
              {/* Remote video (main) */}
              <div
                ref={remoteVideoRef}
                className="w-full h-full bg-gray-800 flex items-center justify-center"
              >
                {remoteUsers.length > 0 ? null : (
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold">
                        {patientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-lg font-medium">{patientName}</p>
                    <p className="text-gray-300">Waiting to connect...</p>
                  </div>
                )}
              </div>

              {/* Local video (picture-in-picture) */}
              <div
                ref={localVideoRef}
                className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white"
              >
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <VideoOff className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {isCallActive && (
          <div className="flex items-center justify-center gap-4 p-6 bg-gray-50">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-colors ${
                isAudioEnabled
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-colors ${
                isVideoEnabled
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={endCall}
              className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            <button className="p-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Call Info */}
        <div className="px-4 pb-4 text-xs text-gray-500">
          Channel: {channelName} • Consultation ID: {consultationId}
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
