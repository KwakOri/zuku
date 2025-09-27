// Neumorphism Design Tokens
export const neumorphism = {
  shadows: {
    raised: {
      sm: '4px 4px 8px rgba(168, 173, 168, 0.25), -4px -4px 8px rgba(255, 255, 255, 0.8)',
      md: '8px 8px 16px rgba(168, 173, 168, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.85)',
      lg: '12px 12px 24px rgba(168, 173, 168, 0.35), -12px -12px 24px rgba(255, 255, 255, 0.9)',
      xl: '16px 16px 32px rgba(168, 173, 168, 0.4), -16px -16px 32px rgba(255, 255, 255, 0.95)',
    },
    inset: {
      sm: 'inset 4px 4px 8px rgba(168, 173, 168, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.7)',
      md: 'inset 8px 8px 16px rgba(168, 173, 168, 0.35), inset -8px -8px 16px rgba(255, 255, 255, 0.75)',
      lg: 'inset 12px 12px 24px rgba(168, 173, 168, 0.4), inset -12px -12px 24px rgba(255, 255, 255, 0.8)',
    },
    pressed: {
      sm: 'inset 2px 2px 4px rgba(168, 173, 168, 0.35), inset -2px -2px 4px rgba(255, 255, 255, 0.6)',
      md: 'inset 4px 4px 8px rgba(168, 173, 168, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.6)',
    }
  },
  backgrounds: {
    base: '#f5f6f5',
    light: '#fafbfa',
    dark: '#eff0ef',
  },
  borders: {
    radius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      full: '50%',
    }
  },
  spacing: {
    neu: {
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
    }
  }
} as const;

export type NeumorphismShadow = keyof typeof neumorphism.shadows.raised;
export type NeumorphismRadius = keyof typeof neumorphism.borders.radius;