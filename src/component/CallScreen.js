import React, { useEffect, useRef, useState, useCallback } from "react";
import { Modal, Button, View, Text, ActivityIndicator, StyleSheet } from "react-native";

const CallScreen = ({
  show,
  onHide,
  senderId,
  receiverId,
  callerName,
  receiverName,
  socketRef,
  isInitiator = false,
}) => {
  const pendingCandidates = useRef([]);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerSocketId, setCallerSocketId] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callerId, setCallerId] = useState(null);

  // Kiểm tra hỗ trợ WebRTC
  useEffect(() => {
    if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("Trình duyệt không hỗ trợ gọi video");
      setCallStatus("error");
    }
    if (isInitiator) {
      setCallerId(senderId);
    }
  }, [senderId, isInitiator]);

  // Thiết lập RTCPeerConnection
  const setupPeerConnection = useCallback(
    (pc, targetUserId) => {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate to:", targetUserId, event.candidate);
          socketRef.current.emit("relay-signal", {
            targetUserId,
            signal: {
              type: "candidate",
              candidate: event.candidate,
            },
          });
        }
      };

      pc.ontrack = (event) => {
        console.log("Received remote stream with tracks:", event.streams[0]?.getTracks().map(t => t.kind));
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.play().catch((err) => {
            console.error("Remote video play error:", err);
            setErrorMessage("Không thể phát video từ xa");
          });
        } else {
          console.warn("No remote stream or video ref available");
          setErrorMessage("Không nhận được luồng video từ xa");
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        if (pc.connectionState === "connected") {
          setCallStatus("connected");
        } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setErrorMessage("Kết nối thất bại");
          setCallStatus("error");
          endCall();
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState);
        if (pc.iceConnectionState === "failed") {
          console.log("Restarting ICE");
          pc.restartIce();
        }
      };

      pc.onsignalingstatechange = () => {
        console.log("Signaling state:", pc.signalingState);
      };
    },
    [socketRef]
  );

  // Kết thúc cuộc gọi
  const endCall = useCallback(
    (isRemote = false) => {
      console.log("Ending call, isRemote:", isRemote);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current.srcObject = null;
      }

      const targetUserId = isInitiator ? receiverId : callerId;
      if (socketRef.current && targetUserId && !isRemote) {
        console.log("Sending end-call to:", targetUserId);
        socketRef.current.emit("end-call", { targetUserId });
      }

      setIncomingCall(false);
      setCallerSocketId(null);
      setCallStatus("idle");
      pendingCandidates.current = [];
      onHide();
    },
    [onHide, socketRef, isInitiator, receiverId, callerId]
  );

  // Bắt đầu cuộc gọi
  const startCall = useCallback(async () => {
    if (peerConnectionRef.current) {
      console.warn("Đã có PeerConnection hiện tại");
      return;
    }
    try {
      setCallStatus("calling");

      const pc = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { 
              urls: "turn:your-turn-server.com",
              username: "user",
              credential: "pass" 
            }
          ]
      });
      peerConnectionRef.current = pc;
      setupPeerConnection(pc, receiverId);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("Local stream acquired for caller:", stream.getTracks().map(t => t.kind));
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch((err) => {
          console.error("Local video play error:", err);
          setErrorMessage("Không thể phát video cục bộ");
        });
      }
      stream.getTracks().forEach((track) => {
        console.log("Adding track to caller:", track.kind, track);
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("Sending offer to:", receiverId, "offer:", { type: offer.type, sdp: offer.sdp });

      socketRef.current.emit("call-user", {
        senderId,
        receiverId,
        offer,
      });
    } catch (err) {
      console.error("Start call error:", err);
      setErrorMessage("Không thể truy cập camera/microphone: " + err.message);
      setCallStatus("error");
      endCall();
    }
  }, [receiverId, senderId, setupPeerConnection, socketRef, endCall]);

  // Xử lý cuộc gọi đến
  const handleIncomingCall = useCallback(
    async (offer, incomingCallerId) => {
      if (peerConnectionRef.current) {
        console.warn("Đã có PeerConnection hiện tại, từ chối cuộc gọi đến");
        return;
      }
      try {
        setCallStatus("ringing");
        setIncomingCall(true);
        setCallerId(incomingCallerId);

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { 
                  urls: "turn:your-turn-server.com",
                  username: "user",
                  credential: "pass" 
                }
              ]
        });
        peerConnectionRef.current = pc;
        setupPeerConnection(pc, incomingCallerId);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Local stream acquired for receiver:", stream.getTracks().map(t => t.kind));
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch((err) => {
            console.error("Local video play error:", err);
            setErrorMessage("Không thể phát video cục bộ");
          });
        }
        stream.getTracks().forEach((track) => {
          console.log("Adding track to receiver:", track.kind, track);
          pc.addTrack(track, stream);
        });

        console.log("Setting remote description with offer:", { type: offer.type, sdp: offer.sdp });
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
      } catch (err) {
        console.error("Handle incoming call error:", err);
        setErrorMessage("Không thể thiết lập kết nối: " + err.message);
        setCallStatus("error");
        endCall();
      }
    },
    [setupPeerConnection, endCall]
  );

  // Trả lời cuộc gọi
  const answerCall = useCallback(async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc || pc.signalingState !== "have-remote-offer") {
        throw new Error("PeerConnection không ở trạng thái phù hợp: " + pc?.signalingState);
      }
      if (!callerId) {
        throw new Error("callerId không hợp lệ");
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log("Sending answer to:", callerId, "answer:", { type: answer.type, sdp: answer.sdp });

      socketRef.current.emit("relay-signal", {
        targetUserId: callerId,
        signal: answer,
      });

      // Áp dụng các ICE candidate đang chờ
      while (pendingCandidates.current.length > 0) {
        const candidate = pendingCandidates.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("Applied pending ICE candidate in answerCall");
        } catch (err) {
          console.error("Error applying pending candidate:", err);
        }
      }

      setIncomingCall(false);
      setCallStatus("connected");
    } catch (err) {
      console.error("Answer call error:", err);
      setErrorMessage("Không thể trả lời cuộc gọi: " + err.message);
      setCallStatus("error");
      endCall();
    }
  }, [callerId, socketRef, endCall]);

  // Tự động gọi startCall khi là người khởi tạo
  useEffect(() => {
    if (show && isInitiator && callStatus === "idle") {
      startCall();
    }
  }, [show, isInitiator, startCall, callStatus]);

  // Xử lý socket
  useEffect(() => {
    if (!socketRef.current) {
      console.warn("Socket không tồn tại");
      return;
    }
    const socket = socketRef.current;

    socket.on("incoming-call", ({ senderId, offer, callerSocketId }) => {
      console.log("Received incoming-call from:", senderId, "with offer:", { type: offer.type, sdp: offer.sdp });
      setCallerSocketId(callerSocketId);
      handleIncomingCall(offer, senderId);
    });

    socket.on("call-error", ({ message }) => {
      console.error("Call error:", message);
      setErrorMessage(message || "Lỗi cuộc gọi");
      setCallStatus("error");
    });

    socket.on("call-ended", () => {
      console.log("Cuộc gọi đã kết thúc bởi người kia");
      endCall(true);
    });

    socket.on("signal", async ({ signal }) => {
      if (!signal || !signal.type) {
        console.warn("Invalid signal received:", signal);
        return;
      }

      const pc = peerConnectionRef.current;
      if (!pc || pc.connectionState === "closed") {
        console.warn("PeerConnection không hợp lệ hoặc đã đóng");
        return;
      }

      try {
        console.log("Processing signal:", signal.type, { type: signal.type, sdp: signal.sdp || signal.candidate });
        switch (signal.type) {
          case "offer":
            if (pc.signalingState !== "stable") {
              console.warn("Nhận offer khi signalingState không phải stable:", pc.signalingState);
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            console.log("Set remote description (offer)");
            break;
          case "answer":
            if (pc.signalingState !== "have-local-offer") {
              console.warn("Invalid signaling state for answer:", pc.signalingState);
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            console.log("Set remote description (answer)");
            // Áp dụng các ICE candidate đang chờ
            while (pendingCandidates.current.length > 0) {
              const candidate = pendingCandidates.current.shift();
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
                console.log("Applied pending ICE candidate after answer");
              } catch (err) {
                console.error("Error applying pending candidate:", err);
              }
            }
            break;
          case "candidate":
            if (pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
              console.log("Added ICE candidate:", signal.candidate);
            } else {
              console.log("Storing pending candidate:", signal.candidate);
              pendingCandidates.current.push(signal.candidate);
            }
            break;
          default:
            console.warn("Loại signal không được hỗ trợ:", signal.type);
        }
      } catch (err) {
        console.error("Lỗi xử lý signal:", err);
        setErrorMessage("Lỗi xử lý tín hiệu WebRTC: " + err.message);
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-error");
      socket.off("call-ended");
      socket.off("signal");
    };
  }, [socketRef, handleIncomingCall, endCall]);

  return (
    <Modal
      visible={show}
      onRequestClose={() => endCall(false)}
      transparent
      animationType="slide"
    >
      <View style={styles.container}>
        <View style={styles.videoContainer}>
          {/* Video từ xa */}
          <video
            ref={remoteVideoRef}
            style={styles.remoteVideo}
            autoPlay
            playsInline
            muted={false}
          />
          {/* Video cục bộ */}
          <video
            ref={localVideoRef}
            style={styles.localVideo}
            autoPlay
            playsInline
            muted
          />
        </View>
        <View style={styles.controls}>
          <Text style={styles.statusText}>
            {callStatus === "ringing"
              ? `Cuộc gọi từ ${callerName || "Người gọi"}`
              : callStatus === "calling"
              ? `Đang gọi ${receiverName || "Người nhận"}...`
              : callStatus === "connected"
              ? "Đang kết nối"
              : "Cuộc gọi video"}
          </Text>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <View style={styles.buttonContainer}>
            <Button title="Kết thúc" onPress={() => endCall(false)} />
            {callStatus === "ringing" && (
              <Button title="Trả lời" onPress={answerCall} />
            )}
            {callStatus === "calling" && (
              <ActivityIndicator size="small" color="blue" />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "space-between",
  },
  videoContainer: {
    flex: 1,
    position: "relative",
  },
  remoteVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  localVideo: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 100,
    height: 150,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    objectFit: "cover",
  },
  controls: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  statusText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default CallScreen;