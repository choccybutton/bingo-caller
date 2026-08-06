/**
 * Status Bar Component
 * Shows game status and call counts
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOW } from '../styles/theme';

const StatusBar = ({ status = 'Ready', calledCount = 0, remainingCount = 0 }) => {
  return (
    <View style={styles.container}>
      <StatusItem label="Status" value={status} />
      <View style={styles.divider} />
      <StatusItem label="Called" value={calledCount} />
      <View style={styles.divider} />
      <StatusItem label="Remaining" value={remainingCount} />
    </View>
  );
};

const StatusItem = ({ label, value }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOW.md,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.primary,
  },
  divider: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
});

export default StatusBar;
