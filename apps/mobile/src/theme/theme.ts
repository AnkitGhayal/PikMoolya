export const theme = {
  colors: {
    primary: '#15803D',       // Forest Green (matches web --primary)
    primaryDark: '#166534',   // Deep Forest Green (matches web --primary-hover)
    primaryLight: '#F0FDF4',  // Light Mint Green (matches web --primary-light)
    primaryTint: '#DCFCE7',   // Mint Tint (matches web --primary-tint)
    primaryBorder: '#BBF7D0', // Mint Border (matches web --primary-border)
    accentGold: '#D97706',    // Harvest Amber (matches web --accent)
    accentGoldLight: '#FFFBEB',
    accentGoldTint: '#FEF3C7',
    
    // Status colors
    success: '#16A34A',
    successLight: '#F0FDF4',
    warning: '#EA580C',
    warningLight: '#FFF7ED',
    error: '#DC2626',
    errorLight: '#FEF2F2',
    info: '#0284C7',
    infoLight: '#F0F9FF',

    // Neutrals
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    textMain: '#0F172A',
    textMuted: '#334155',
    textSubtle: '#64748B',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    divider: '#E2E8F0',

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
