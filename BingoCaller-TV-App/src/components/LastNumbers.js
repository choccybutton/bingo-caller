/**
 * Last Numbers Component
 * Displays the last 5 called numbers
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOW } from '../styles/theme';

const LastNumbers = ({ numbers = [] }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Last 5 Called</Text>
      <View style={styles.content}>
        {numbers.length === 0 ? (
          <Text style={styles.emptyText}>No numbers yet</Text>
        ) : (
          numbers.map((number, index) => (
            <View key={index} style={styles.ball}>
              <Text style={styles.ballNumber}>{number}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.large,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    justifyContent: 'center',
    gap: SPACING.lg,
    ...SHADOW.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  ball: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.lg,
  },
  ballNumber: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default LastNumbers;
