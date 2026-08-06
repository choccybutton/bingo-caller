/**
 * TV App Theme & Styles
 * Optimized for large screens and TV viewing
 */

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Color palette
export const COLORS = {
  background: '#1e1e1e',
  surface: '#2a2a2a',
  surfaceDark: '#1a1a1a',
  primary: '#4CAF50', // Green
  primaryDark: '#45a049',
  secondary: '#2196F3', // Blue
  secondaryDark: '#0b7dda',
  accent: '#FF9800', // Orange
  accentRed: '#f44336', // Red
  text: '#ffffff',
  textSecondary: '#999999',
  textMuted: '#666666',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#FF9800',
  border: '#333333',
  ballUncalled: '#555555',
  ballCalled: '#4CAF50',
  ballCalledGlow: 'rgba(76, 175, 80, 0.8)',
};

// Font sizes optimized for TV (10 feet viewing distance)
export const FONT_SIZES = {
  tiny: 16,
  small: 24,
  medium: 32,
  large: 48,
  xlarge: 64,
  xxlarge: 96,
  xxxlarge: 128,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

// Shadow (subtle for TV)
export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};

// TV screen dimensions (common aspect ratios)
export const TV_SCREEN = {
  width: screenWidth,
  height: screenHeight,
  aspectRatio: screenWidth / screenHeight,
  // Common TV resolutions
  is4K: screenWidth >= 3840,
  isFullHD: screenWidth >= 1920 && screenWidth < 3840,
  isHD: screenWidth < 1920,
};

// Calculate responsive sizes based on screen width
export const getResponsiveSize = (baseSize) => {
  const scale = screenWidth / 1920; // Assume 1920 as base (Full HD)
  return Math.round(baseSize * scale);
};

// Ball grid item size calculation
export const getBallSize = () => {
  // Calculate based on screen width, leaving space for margins
  const availableWidth = screenWidth - 40; // 20px padding on each side
  const ballsPerRow = 9; // For 90-ball bingo
  const ballSize = availableWidth / ballsPerRow;
  return Math.floor(ballSize * 0.95); // 95% to leave gaps
};

// Export theme object
export const theme = {
  colors: COLORS,
  fonts: FONT_SIZES,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadow: SHADOW,
  screen: TV_SCREEN,
};

export default theme;
