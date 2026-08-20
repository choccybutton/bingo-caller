/**
 * Server Connection Hook
 * Manages SSE (Server-Sent Events) connection to the bingo caller server
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';

// Simple UUID v4 generator that doesn't require crypto.getRandomValues()
// This works on Android TV where crypto APIs aren't available
const generateClientId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useServerConnection = (serverUrl, gameState) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const eventSourceRef = useRef(null);
  const clientIdRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const updateGameState = gameState?.updateGameState;

  // Generate or retrieve client ID
  useEffect(() => {
    if (!clientIdRef.current) {
      clientIdRef.current = generateClientId();
    }
  }, []);

  // Main connection logic
  useEffect(() => {
    if (!serverUrl || !updateGameState) return;

    const connectToServer = () => {
      try {
        // Build URL with client info
        const url = `${serverUrl}/events?clientId=${clientIdRef.current}&role=display`;

        console.log('Connecting to server:', url);

        // Use XMLHttpRequest for better compatibility with RN
        // Note: EventSource doesn't work as well on Android, so we use a custom implementation
        connectWithFetch(url);
      } catch (error) {
        console.error('Connection error:', error);
        setIsConnected(false);
        scheduleReconnect();
      }
    };

    const connectWithFetch = (url) => {
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          setIsConnected(true);
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          const processStream = () => {
            reader.read().then(({ done, value }) => {
              if (done) {
                setIsConnected(false);
                scheduleReconnect();
                return;
              }

              try {
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                lines.forEach((line) => {
                  if (line.startsWith('data: ')) {
                    const jsonData = line.replace('data: ', '').trim();
                    if (jsonData) {
                      const payload = JSON.parse(jsonData);
                      if (payload.type === 'state' && payload.game) {
                        updateGameState(payload.game);
                        setLastUpdate(new Date());
                      }
                    }
                  }
                });

                processStream();
              } catch (error) {
                console.error('Error processing stream:', error);
                processStream();
              }
            });
          };

          processStream();
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          setIsConnected(false);
          scheduleReconnect();
        });
    };

    connectToServer();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close?.();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [serverUrl, updateGameState]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect...');
      // Trigger reconnection by updating serverUrl
    }, 3000);
  }, []);

  return {
    connectToServer: () => {
      // Manual reconnect trigger - just needs to re-run the effect
      // The useEffect handles all connection logic
      console.log('Manual reconnection triggered');
    },
    isConnected,
    lastUpdate,
  };
};
