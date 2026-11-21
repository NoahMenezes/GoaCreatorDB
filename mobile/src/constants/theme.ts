export const Colors = {
  dark: {
    // GoaCreatorDB Visual Identity: Charcoal, Obsidian, and Crimson Red
    primary: '#EF1717',
    primaryHover: '#D61212',
    deepRed: '#B90F19',
    primaryLight: 'rgba(239, 23, 23, 0.12)',
    primaryBorder: 'rgba(239, 23, 23, 0.35)',

    // Secondary & Highlights
    secondary: '#111214',
    accent: '#EF1717',
    gold: '#F59E0B',
    goldLight: 'rgba(245, 158, 11, 0.12)',
    goldBorder: 'rgba(245, 158, 11, 0.28)',

    // Premium Charcoal & Black Surfaces (edge-to-edge full-screen)
    background: '#090909',
    card: '#111214',
    surface: '#17191C',
    border: '#22252A',
    borderSubtle: '#191A20',

    // High Contrast Typography
    text: '#F5F5F5',
    textSecondary: '#A1A1AA',
    textMuted: '#686B78',
    textInverse: '#090909',

    tagFood: '#EF1717',
    tagFoodBg: 'rgba(239, 23, 23, 0.14)',
    tagStay: '#3B82F6',
    tagStayBg: 'rgba(59, 130, 246, 0.14)',
    tagNight: '#A855F7',
    tagNightBg: 'rgba(168, 85, 247, 0.14)',
    tagTravel: '#10B981',
    tagTravelBg: 'rgba(16, 185, 129, 0.14)',

    badgeBarter: '#EF1717',
    badgeBarterBg: 'rgba(239, 23, 23, 0.12)',
    badgePaid: '#F59E0B',
    badgePaidBg: 'rgba(245, 158, 11, 0.12)',

    tabBarBackground: '#090909',
    tabBarBorder: '#1A1B20',
    tabBarActive: '#EF1717',
    tabBarInactive: '#717482',
  },
  light: {
    primary: '#EF1717',
    primaryHover: '#D61212',
    deepRed: '#B90F19',
    primaryLight: 'rgba(239, 23, 23, 0.12)',
    primaryBorder: 'rgba(239, 23, 23, 0.35)',

    secondary: '#111214',
    accent: '#EF1717',
    gold: '#F59E0B',
    goldLight: 'rgba(245, 158, 11, 0.12)',
    goldBorder: 'rgba(245, 158, 11, 0.28)',

    // Pure Dark-First architecture across both themes
    background: '#090909',
    card: '#111214',
    surface: '#17191C',
    border: '#22252A',
    borderSubtle: '#191A20',

    text: '#F5F5F5',
    textSecondary: '#A1A1AA',
    textMuted: '#686B78',
    textInverse: '#090909',

    tagFood: '#EF1717',
    tagFoodBg: 'rgba(239, 23, 23, 0.14)',
    tagStay: '#3B82F6',
    tagStayBg: 'rgba(59, 130, 246, 0.14)',
    tagNight: '#A855F7',
    tagNightBg: 'rgba(168, 85, 247, 0.14)',
    tagTravel: '#10B981',
    tagTravelBg: 'rgba(16, 185, 129, 0.14)',

    badgeBarter: '#EF1717',
    badgeBarterBg: 'rgba(239, 23, 23, 0.12)',
    badgePaid: '#F59E0B',
    badgePaidBg: 'rgba(245, 158, 11, 0.12)',

    tabBarBackground: '#090909',
    tabBarBorder: '#1A1B20',
    tabBarActive: '#EF1717',
    tabBarInactive: '#717482',
  },
} as const;

export type ThemeColors = typeof Colors.dark;

// Precision sharp corners (ZERO rounded borders everywhere)
export const Radius = {
  none: 0,
  xs: 0,
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  full: 0,
} as const;

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
    letterSpacing: -0.6,
  },
  h1: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
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
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
};
