/**
 * Game Display Component
 * Shows the last called number with large, clear text
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, SHADOW, BORDER_RADIUS } from '../styles/theme';

const GameDisplay = ({ lastNumber, lastNumberName, status }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {lastNumber !== null ? (
          <>
            <Text style={styles.label}>Called</Text>
            <Text style={styles.number}>{lastNumber}</Text>
            <Text style={styles.name}>{lastNumberName}</Text>
          </>
        ) : (
          <Text style={styles.waitingText}>Waiting for first number...</Text>
        )}
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOW.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  number: {
    fontSize: FONT_SIZES.xxxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: FONT_SIZES.xxxlarge * 1.1,
  },
  name: {
    fontSize: FONT_SIZES.large,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  waitingText: {
    fontSize: FONT_SIZES.large,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    backgroundColor: COLORS.secondaryDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: SPACING.lg,
  },
  statusText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default GameDisplay;
