export const theme = {
  colors: {
    primary: '#2E7D32',       // Rich Agricultural Emerald Green
    primaryDark: '#1B4D1E',   // Deep Forest Green
    primaryLight: '#E8F5E9',  // Light Mint Green Background
    accentGold: '#F59E0B',    // Fair Price Gold Accent
    accentGoldLight: '#FEF3C7',
    
    // Status colors
    success: '#15803D',
    successLight: '#DCFCE7',
    warning: '#B45309',
    warningLight: '#FEF3C7',
    error: '#C53030',
    errorLight: '#FEE2E2',
    info: '#1E40AF',
    infoLight: '#DBEAFE',

    // Neutrals
    background: '#F4F8F4',
    surface: '#FFFFFF',
    surfaceSubtle: '#F8FAF8',
    textMain: '#1C2A1E',
    textMuted: '#5B6B5D',
    textSubtle: '#8E9D90',
    border: '#E2E8F0',
    borderLight: '#F0F4F1',
    divider: '#E8EFE9',

    gray: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },

    // Overlay
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },

  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 18,
      xl: 22,
      xxl: 26,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
  },
};
