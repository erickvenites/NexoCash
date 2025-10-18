// src/utils/theme.ts
export const theme = {
  colors: {
    // Backgrounds - Tons de preto e cinza escuro
    background: {
      primary: '#000000',
      secondary: '#0a0a0a',
      tertiary: '#141414',
      card: '#1a1a1a',
    },
    
    // Cores de destaque - sutis e elegantes
    primary: '#3b82f6',      // Azul suave
    success: '#10b981',      // Verde suave
    warning: '#f59e0b',      // Laranja suave
    error: '#ef4444',        // Vermelho suave
    info: '#8b5cf6',         // Roxo suave
    
    // Texto
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
      muted: '#71717a',
      disabled: '#52525b',
    },
    
    // Bordas
    border: {
      default: '#27272a',
      light: '#3f3f46',
      focus: '#3b82f6',
    },
    
    // Inputs
    input: {
      background: '#0a0a0a',
      border: '#27272a',
      text: '#ffffff',
      placeholder: '#71717a',
    },
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const getGradientText = (colors: string[]) => ({
  background: `linear-gradient(135deg, ${colors.join(', ')})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});