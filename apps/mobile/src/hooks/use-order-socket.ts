import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(`${process.env.EXPO_PUBLIC_SERVER_URL}/orders`, {
      transports: ['websocket'], // force real WebSocket — skip HTTP long-polling
      autoConnect: false, // we connect manually when a screen needs it
    });
  }
  return socket;
}

export function useOrderSocket(orderId: string | null) {
  const [orderUpdate, setOrderUpdate] = useState<Record<
    string,
    unknown
  > | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const s = getSocket();
    s.connect(); // open the WebSocket connection
    s.emit('join:order', orderId); // tell server to put us in order:<orderId> room

    // runs when server emits 'order:updated' — only accept updates for THIS order
    const handler = (data: { id?: string }) => {
      if (data.id === orderId) setOrderUpdate(data);
    };

    s.on('order:updated', handler);

    // cleanup on unmount — remove listener + disconnect to prevent memory leaks
    return () => {
      s.off('order:updated', handler);
      s.disconnect();
    };
  }, [orderId]);

  return orderUpdate;
}

export function useRestaurantSocket(restaurantId: string | null) {
  const [orderUpdate, setOrderUpdate] = useState<Record<
    string,
    unknown
  > | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const s = getSocket();
    s.connect();
    s.emit('join:restaurant', restaurantId);

    // any order update for this restaurant triggers a refetch
    const handler = (data: Record<string, unknown>) => {
      setOrderUpdate(data);
    };

    s.on('order:updated', handler);

    return () => {
      s.off('order:updated', handler);
      s.disconnect();
    };
  }, [restaurantId]);

  return orderUpdate; // screen calls invalidateQueries when this changes
}

export function useDriverLocationSocket(orderId: string | null) {
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const s = getSocket();
    if (!s.connected) s.connect();
    s.emit('join:order', orderId);

    const handler = (data: { latitude: number; longitude: number }) => {
      setDriverLocation({
        latitude: data.latitude,
        longitude: data.longitude,
      });
    };

    s.on('driver:location', handler);

    return () => {
      s.off('driver:location', handler);
    };
  }, [orderId]);

  return driverLocation;
}
