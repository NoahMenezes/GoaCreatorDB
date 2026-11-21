export const Colors = {
  light: {
    primary: '#0C4E40',
    primaryHover: '#093D32',
    primaryLight: '#E6F4F0',
    primaryBorder: '#B2DFD4',
    secondary: '#167D65',
    accent: '#B9E4D2',
    gold: '#B98A2C',
    goldLight: '#FEF9EE',
    goldBorder: '#F6E5B8',

    background: '#FFFFFF',
    card: '#FFFFFF',
    surface: '#F8F9FA',
    border: '#E5E7EB',
    borderSubtle: '#F0F0F0',

    text: '#141414',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',

    tagFood: '#DC2626',
    tagFoodBg: '#FEF2F2',
    tagStay: '#2563EB',
    tagStayBg: '#EFF6FF',
    tagNight: '#7C3AED',
    tagNightBg: '#F5F3FF',
    tagTravel: '#059669',
    tagTravelBg: '#ECFDF5',

    badgeBarter: '#0C4E40',
    badgeBarterBg: '#E8F5F1',
    badgePaid: '#D97706',
    badgePaidBg: '#FEF3C7',

    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabBarActive: '#0C4E40',
    tabBarInactive: '#9CA3AF',
  },
  dark: {
    primary: '#167D65',
    primaryHover: '#1B9E7F',
    primaryLight: '#123930',
    primaryBorder: '#1F5245',
    secondary: '#2C5F53',
    accent: '#B9E4D2',
    gold: '#C9A227',
    goldLight: '#2C2512',
    goldBorder: '#4E421F',

    background: '#0A0A0A',
    card: '#141414',
    surface: '#1A1A1A',
    border: '#272727',
    borderSubtle: '#1F1F1F',

    text: '#F5F5F4',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    textInverse: '#141414',

    tagFood: '#F87171',
    tagFoodBg: '#3E1919',
    tagStay: '#60A5FA',
    tagStayBg: '#192C4E',
    tagNight: '#A78BFA',
    tagNightBg: '#2D1B4E',
    tagTravel: '#34D399',
    tagTravelBg: '#143B2A',

    badgeBarter: '#34D399',
    badgeBarterBg: '#143B2A',
    badgePaid: '#FBBF24',
    badgePaidBg: '#3B2E14',

    tabBarBackground: '#121212',
    tabBarBorder: '#272727',
    tabBarActive: '#34D399',
    tabBarInactive: '#71717A',
  },
} as const;

export type ThemeColors = typeof Colors.light;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Fonts = {
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  rounded: 'normal',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

export const BottomTabInset = 60;
export const MaxContentWidth = 800;

export const Typography = {
  hero: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  smallBold: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
};
