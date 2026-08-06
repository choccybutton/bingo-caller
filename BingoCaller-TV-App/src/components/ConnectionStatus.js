/**
 * Connection Status Component
 * Shows server connection status
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../styles/theme';

const ConnectionStatus = ({ connected = false, lastUpdate = null }) => {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    if (!lastUpdate) return;

    const updateTime = () => {
      const now = new Date();
      const diff = Math.floor((now - lastUpdate) / 1000);

      if (diff < 1) {
        setDisplayTime('just now');
      } else if (diff < 60) {
        setDisplayTime(`${diff}s ago`);
      } else {
        setDisplayTime(`${Math.floor(diff / 60)}m ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <View style={[styles.container, connected ? styles.connected : styles.disconnected]}>
      <View style={[styles.indicator, connected ? styles.indicatorOn : styles.indicatorOff]} />
      <View style={styles.content}>
        <Text style={styles.status}>
          {connected ? '🟢 Connected' : '🔴 Disconnected'}
        </Text>
        {lastUpdate && (
          <Text style={styles.time}>Last update: {displayTime}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  connected: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disconnected: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  indicatorOn: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  indicatorOff: {
    backgroundColor: COLORS.error,
  },
  content: {
    flex: 1,
  },
  status: {
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    color: COLORS.text,
  },
  time: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default ConnectionStatus;
