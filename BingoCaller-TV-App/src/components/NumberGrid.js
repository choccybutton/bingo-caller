/**
 * Number Grid Component
 * Displays all bingo balls with called/uncalled states
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const NumberGrid = ({ gameType = 90, calledNumbers = [] }) => {
  const ballSize = useMemo(() => {
    const availableWidth = screenWidth - 40; // 20px padding on each side
    const ballsPerRow = 9;
    return Math.floor((availableWidth / ballsPerRow) * 0.95);
  }, []);

  const numbers = useMemo(() => {
    return Array.from({ length: gameType }, (_, i) => i + 1);
  }, [gameType]);

  const renderBall = (number) => {
    const isCalled = calledNumbers.includes(number);
    return (
      <View
        key={number}
        style={[
          styles.ball,
          {
            width: ballSize,
            height: ballSize,
            borderRadius: ballSize / 2,
          },
          isCalled ? styles.ballCalled : styles.ballUncalled,
        ]}
      >
        <Text
          style={[
            styles.ballNumber,
            { fontSize: Math.max(FONT_SIZES.medium, ballSize * 0.4) },
            isCalled ? styles.numberCalled : styles.numberUncalled,
          ]}
        >
          {number}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Numbers</Text>
      <View style={styles.grid}>
        {numbers.map((num) => renderBall(num))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  ball: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  ballUncalled: {
    backgroundColor: COLORS.ballUncalled,
    borderColor: 'rgba(0, 0, 0, 0.5)',
  },
  ballCalled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  ballNumber: {
    fontWeight: 'bold',
    color: COLORS.text,
  },
  numberUncalled: {
    color: COLORS.textMuted,
  },
  numberCalled: {
    color: COLORS.text,
  },
});

export default NumberGrid;
