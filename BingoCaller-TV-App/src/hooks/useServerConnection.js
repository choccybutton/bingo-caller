/**
 * Server Connection Hook
 * Manages SSE (Server-Sent Events) connection to the bingo caller server
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

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
      clientIdRef.current = uuidv4();
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

  const connectToServer = useCallback(() => {
    if (!serverUrl) return;

    const url = `${serverUrl}/events?clientId=${clientIdRef.current}&role=display`;

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close?.();
      }

      // Create new connection
      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.addEventListener('state', (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.game) {
            updateGameState(payload.game);
            setLastUpdate(new Date());
          }
        } catch (error) {
          console.error('Error parsing state:', error);
        }
      });

      eventSourceRef.current.onerror = () => {
        setIsConnected(false);
        eventSourceRef.current?.close();
        scheduleReconnect();
      };

      setIsConnected(true);
    } catch (error) {
      console.error('Connection failed:', error);
      setIsConnected(false);
      scheduleReconnect();
    }
  }, [serverUrl, updateGameState, scheduleReconnect]);

  return {
    connectToServer,
    isConnected,
    lastUpdate,
  };
};
