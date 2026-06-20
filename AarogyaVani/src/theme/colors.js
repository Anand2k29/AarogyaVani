export const colors = {
  primary: '#E91E63',     // Magenta/Dark Pink for primary buttons
  primaryLight: '#FF4081',// Lighter pink for hover/active states
  background: '#FFF0F5',  // Soft pink background
  surface: '#FFFFFF',     // White cards
  text: '#333333',        // Dark text for readability
  textSecondary: '#666666',
  border: '#F48FB1',      // Soft border
  error: '#B00020',
};

export const typography = {
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.surface,
  }
};
