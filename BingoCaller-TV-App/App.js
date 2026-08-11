/**
 * Bingo Caller TV Display App
 * Displays live bingo numbers on Android TV, Fire TV, Google TV
 *
 * Features:
 * - Live ball grid with called numbers
 * - Large last-called number display
 * - Last 5 numbers display
 * - Game status indicator
 * - Server connection via SSE
 * - Text-to-speech announcements
 * - TV remote control support
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TVEventHandler,
  useFocusEffect,
} from 'react-native';
import * as Speech from 'expo-speech';
import GameDisplay from './src/components/GameDisplay';
import StatusBar from './src/components/StatusBar';
import NumberGrid from './src/components/NumberGrid';
import LastNumbers from './src/components/LastNumbers';
import ConnectionStatus from './src/components/ConnectionStatus';
import { useGameState } from './src/hooks/useGameState';
import { useServerConnection } from './src/hooks/useServerConnection';
import { COLORS, FONT_SIZES } from './src/styles/theme';

const App = () => {
  const [serverUrl, setServerUrl] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const tvEventHandler = useRef(null);

  // Game state management
  const gameState = useGameState();
  const { connectToServer, isConnected, lastUpdate } = useServerConnection(serverUrl, gameState);

  // Initialize TV event handler for remote control
  useEffect(() => {
    const enableTVEventHandler = () => {
      tvEventHandler.current = new TVEventHandler();
      tvEventHandler.current.enable(handleTVEvent);
    };

    enableTVEventHandler();

    return () => {
      if (tvEventHandler.current) {
        tvEventHandler.current.disable();
      }
    };
  }, []);

  // Handle TV remote events
  const handleTVEvent = (evt) => {
    if (evt.eventType === 'right') {
      // Volume up, brightness up, etc.
      console.log('Right button pressed');
    } else if (evt.eventType === 'left') {
      // Volume down, brightness down, etc.
      console.log('Left button pressed');
    } else if (evt.eventType === 'up') {
      console.log('Up button pressed');
    } else if (evt.eventType === 'down') {
      console.log('Down button pressed');
    } else if (evt.eventType === 'playPause') {
      console.log('Play/Pause pressed');
    } else if (evt.eventType === 'select') {
      // Could be used for settings menu
      console.log('Select pressed');
    }
  };

  // Auto-connect on load
  useEffect(() => {
    if (!isConfigured) {
      attemptAutoConnect();
    }
  }, []);

  // Try to auto-detect server URL from local network
  const attemptAutoConnect = async () => {
    setConnecting(true);
    setConnectionError(null);

    try {
      // Try common local server IPs
      const commonIPs = [
        'http://192.168.1.1:3000',
        'http://192.168.0.1:3000',
        'http://localhost:3000',
        'http://10.0.0.1:3000',
      ];

      for (const ip of commonIPs) {
        try {
          const response = await fetch(`${ip}/api/state`, { timeout: 2000 });
          if (response.ok) {
            setServerUrl(ip);
            setIsConfigured(true);
            connectToServer();
            break;
          }
        } catch (e) {
          // Try next IP
        }
      }

      if (!isConfigured) {
        setConnectionError('Could not auto-detect server. Please configure manually.');
      }
    } catch (error) {
      setConnectionError(`Connection failed: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  };

  // Initialize text-to-speech
  useEffect(() => {
    // expo-speech auto-initializes on Android
    // Set default voice properties if needed
    Speech.getAvailableVoicesAsync().then((voices) => {
      console.log('Available voices:', voices.length);
    });
  }, []);

  // Speak number when new one is called
  useEffect(() => {
    if (gameState.lastNumber && gameState.callAnnouncer?.shouldSpeak) {
      const name = gameState.callAnnouncer.getNumberName(gameState.lastNumber);
      Speech.speak(`${name}, number ${gameState.lastNumber}`, {
        language: 'en-GB',
        rate: 0.9,
        pitch: 1.0,
      });
    }
  }, [gameState.lastNumber]);

  if (!isConfigured || connecting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {connecting ? 'Connecting to server...' : 'Initializing...'}
          </Text>
          {connectionError && (
            <Text style={styles.errorText}>{connectionError}</Text>
          )}
          <Text style={styles.infoText}>
            Make sure the server is running and this device is on the same WiFi network.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Connection Status */}
        <ConnectionStatus connected={isConnected} lastUpdate={lastUpdate} />

        {/* Main Display Area */}
        {gameState.gameRunning ? (
          <>
            {/* Last Called Number - Large Display */}
            <GameDisplay
              lastNumber={gameState.lastNumber}
              lastNumberName={gameState.lastNumberName}
              status={gameState.status}
            />

            {/* Number Grid */}
            <NumberGrid
              gameType={gameState.gameType}
              calledNumbers={gameState.calledNumbers}
            />

            {/* Last 5 Numbers */}
            <LastNumbers numbers={gameState.lastFive} />

            {/* Status Bar */}
            <StatusBar
              status={gameState.status}
              calledCount={gameState.calledCount}
              remainingCount={gameState.remainingCount}
            />
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>⏳ Waiting for game to start...</Text>
            <Text style={styles.waitingSubText}>
              No active bingo game detected
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.large,
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.medium,
    marginTop: 20,
    textAlign: 'center',
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.small,
    marginTop: 10,
    textAlign: 'center',
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xlarge,
    marginBottom: 10,
  },
  waitingSubText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
  },
});

export default App;
