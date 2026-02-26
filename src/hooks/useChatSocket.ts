/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "../types/chat/chat";
import { BASE_URL } from "../config/env.config";
import useUserStore from "../store/user/user";
import { getRoomMessages } from "../features/chat/chats.loaders";

export const useChatSocket = (roomId: string | null) => {
  // User data
  const user = useUserStore((state) => state.user);
  const token = useUserStore((state) => state.token);

  const userId = useMemo(() => user?._id, [user]);
  const userRole = useMemo(() => user?.role, [user]);

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | undefined>(undefined);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map(),
  );
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const roomIdRef = useRef<string | null>(roomId);
  const messagesRef = useRef<ChatMessage[]>([]);
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Update roomId ref
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  // Keep messages ref in sync for loadOlderMessages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Event handlers
  const handleConnectError = useCallback((err: Error) => {
    console.error("❌ Connection error:", err.message);

    if (err.message.includes("auth") || err.message.includes("token")) {
      setError(`Authentication error: ${err.message}`);
    } else {
      setTimeout(() => setError(null), 3000);
    }
  }, []);

  const handleRoomJoined = useCallback((data: any) => {
    console.log("🚪 Room joined:", data.roomName);

    if (data.roomId === roomIdRef.current) {
      const history = data.history || [];
      setMessages(history);
      setOnlineUsers(data.onlineUsers || []);
      setUnreadCount(0);
      setHasMoreOlder(history.length >= 30);
    }
  }, []);

  const handleNewMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => {
        const isDuplicate = prev.some((m) => m._id === message._id);
        if (isDuplicate) return prev;

        if (message._id.startsWith("temp-")) {
          return prev.map((m) => (m._id === message._id ? message : m));
        }

        return [...prev, message];
      });

      if (message.user_id?._id !== userId) {
        setUnreadCount((count) => count + 1);
      }
    },
    [userId],
  );

  const handleUserTyping = useCallback((data: any) => {
    if (data.roomId !== roomIdRef.current) return;

    setTypingUsers((prev) => {
      const next = new Map(prev);

      if (data.typing) {
        next.set(data.user.id, data.user.nickname);

        // Clear existing timeout
        const existingTimeout = typingTimeoutsRef.current.get(data.user.id);
        if (existingTimeout) clearTimeout(existingTimeout);

        // Set new timeout
        const timeout = setTimeout(() => {
          setTypingUsers((current) => {
            const updated = new Map(current);
            updated.delete(data.user.id);
            return updated;
          });
          typingTimeoutsRef.current.delete(data.user.id);
        }, 3000);

        typingTimeoutsRef.current.set(data.user.id, timeout);
      } else {
        next.delete(data.user.id);
        const existingTimeout = typingTimeoutsRef.current.get(data.user.id);
        if (existingTimeout) clearTimeout(existingTimeout);
        typingTimeoutsRef.current.delete(data.user.id);
      }

      return next;
    });
  }, []);

  const handleUserJoined = useCallback((data: any) => {
    if (data.roomId !== roomIdRef.current) return;
    const user = data.user;
    const id = user?._id ?? user?.id;

    setOnlineUsers((prev) => {
      const exists = prev.find((u) => (u._id ?? (u as any).id) === id);
      return exists ? prev : [...prev, { ...user, _id: id }];
    });
  }, []);

  const handleUserLeft = useCallback((data: any) => {
    if (data.roomId !== roomIdRef.current) return;
    const id = data.user?._id ?? data.user?.id;

    setOnlineUsers((prev) => prev.filter((u) => (u._id ?? (u as any).id) !== id));
  }, []);

  const handleError = useCallback((errorData: any) => {
    const msg = errorData?.message ?? errorData?.error ?? String(errorData);
    if (msg.toLowerCase().includes("room not found")) {
      return;
    }
    console.error("Socket error:", errorData);
    setError(msg || "Socket error");
  }, []);

  // Setup socket connection
  useEffect(() => {
    if (!token || !userId) return;

    console.log("🔄 Setting up socket for user:", userId);

    // Clean up old socket
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      if (socketRef.current.connected) {
        socketRef.current.disconnect();
      }
    }

    // Create new socket
    const socket = io(BASE_URL || "http://localhost:8000", {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Store socket reference
    socketRef.current = socket;

    // Attach event listeners
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
      setSocketId(socket.id);
      setError(null);

      if (roomIdRef.current) {
        console.log("Joining room after connect:", roomIdRef.current);
        socket.emit("join_room", roomIdRef.current);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setIsConnected(false);
      setSocketId(undefined);
    });

    socket.on("connect_error", handleConnectError);
    socket.on("room_joined", handleRoomJoined);
    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("message_deleted", (data: { messageId: string; roomId?: string }) => {
      if (data.roomId && data.roomId !== roomIdRef.current) return;
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
    });
    socket.on("error", handleError);

    // Set initial connection state
    setIsConnected(socket.connected);
    setSocketId(socket.id || undefined);

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up socket connection");
      socket.removeAllListeners();
      if (socket.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [
    token,
    userId,
    handleConnectError,
    handleRoomJoined,
    handleNewMessage,
    handleUserTyping,
    handleUserJoined,
    handleUserLeft,
    handleError,
  ]);

  // Handle room changes - THIS IS CORRECT, IGNORE ESLINT WARNING
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !roomId) return;

    console.log("🔄 Switching to room:", roomId);

    // Store current typing timeouts for cleanup
    const currentTimeouts = new Map(typingTimeoutsRef.current);

    // Clear previous room data - THIS IS NECESSARY!
    setOnlineUsers([]);
    setTypingUsers(new Map());

    // Join new room
    socket.emit("join_room", roomId);

    // Cleanup function
    return () => {
      console.log("🚪 Leaving room:", roomId);

      if (socket?.connected) {
        socket.emit("leave_room", roomId);
      }

      // Clear stored timeouts
      currentTimeouts.forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
      currentTimeouts.clear();

      // Also clear from ref
      typingTimeoutsRef.current.clear();
    };
  }, [roomId]);

  // Derived values
  const typingUsersArray = useMemo(
    () => Array.from(typingUsers.entries()).map(([id, name]) => ({ id, name })),
    [typingUsers],
  );

  const connectionStatus = useMemo(
    () => ({
      socketId,
      connected: isConnected,
      roomId,
    }),
    [isConnected, roomId, socketId],
  );

  // Methods
  const sendMessage = useCallback(
    (content: string, repliedTo?: string) => {
      const socket = socketRef.current;
      if (
        !socket?.connected ||
        !roomIdRef.current ||
        !content.trim() ||
        !user
      ) {
        setError("Cannot send message");
        return;
      }

      // Optimistic message
      const optimisticMsg: ChatMessage = {
        _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        room_id: roomIdRef.current,
        content: content.trim(),
        user_id: user as any,
        message_type: "text",
        moderation_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isOptimistic: true,
        replied_to: repliedTo,
      };

      // Add immediately
      setMessages((prev) => [...prev, optimisticMsg]);

      // Send with ack
      socket.emit(
        "send_message",
        {
          roomId: roomIdRef.current,
          content: content.trim(),
          replied_to: repliedTo,
        },
        (ack: any) => {
          if (!ack?.success) {
            setMessages((prev) =>
              prev.filter((m) => m._id !== optimisticMsg._id),
            );
            setError(ack?.error || "Failed to send message");
            setTimeout(() => setError(null), 5000);
          }
        },
      );
    },
    [user],
  );

  const startTyping = useCallback(() => {
    if (socketRef.current?.connected && roomIdRef.current) {
      socketRef.current.emit("typing_start", roomIdRef.current);
    }
  }, []);

  const stopTyping = useCallback(() => {
    if (socketRef.current?.connected && roomIdRef.current) {
      socketRef.current.emit("typing_stop", roomIdRef.current);
    }
  }, []);

  const reconnect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      setError(null);
      socketRef.current.connect();
    }
  }, []);

  const deleteMessage = useCallback(
    (messageId: string) => {
      const socket = socketRef.current;
      if (
        !socket?.connected ||
        !roomIdRef.current ||
        !userRole?.includes("admin")
      ) {
        console.warn("No permission to delete message");
        return;
      }

      socket.emit(
        "admin_delete_message",
        { roomId: roomIdRef.current, messageId },
        (response: any) => {
          if (response?.success) {
            setMessages((prev) => prev.filter((m) => m._id !== messageId));
          } else {
            setError(response?.error || "Failed to delete message");
          }
        },
      );
    },
    [userRole],
  );

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadOlderMessages = useCallback(async () => {
    const rId = roomIdRef.current;
    const list = messagesRef.current;
    const beforeId = list[0]?._id;
    if (!rId || !beforeId || loadingOlder || !hasMoreOlder) return;
    setLoadingOlder(true);
    try {
      const res = await getRoomMessages(rId, { limit: 30, before: beforeId });
      const older = res.data || [];
      if (older.length > 0) {
        setMessages((prev) => [...older, ...prev]);
      }
      setHasMoreOlder(res.hasMore ?? false);
    } catch (err) {
      console.error("Failed to load older room messages:", err);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasMoreOlder]);

  // Component cleanup
  useEffect(() => {
    return () => {
      console.log("🏁 Cleaning up chat socket");

      const socket = socketRef.current;
      if (socket) {
        socket.removeAllListeners();
        if (socket.connected) {
          socket.disconnect();
        }
        socketRef.current = null;
      }

      // Clear all timeouts
      typingTimeoutsRef.current.forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
      typingTimeoutsRef.current.clear();
    };
  }, []);

  return {
    // State
    messages,
    isConnected,
    socketId,
    typingUsers: typingUsersArray,
    onlineUsers,
    error,
    unreadCount,
    hasMoreOlder,
    loadingOlder,

    // Methods
    sendMessage,
    startTyping,
    stopTyping,
    reconnect,
    deleteMessage,
    clearUnread,
    clearError,
    loadOlderMessages,

    // Derived state
    connectionStatus,
  };
};
