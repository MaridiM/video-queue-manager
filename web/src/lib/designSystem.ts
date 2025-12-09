// Game Academy Design System Configuration
// Reference: https://adminrhs.github.io/Design-system/

export const designSystem = {
  colors: {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#2563EB',
      600: '#1D4ED8',
      700: '#1E40AF',
      800: '#1E3A8A',
      900: '#1E3A8A',
      default: '#2563EB',
      hover: '#3B82F6',
      active: '#1D4ED8',
    },
    secondary: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      default: '#6B7280',
      hover: '#9CA3AF',
      active: '#4B5563',
    },
    semantic: {
      success: {
        default: '#16A34A',
        hover: '#22C55E',
        active: '#15803D',
        light: '#D1FAE5',
        dark: '#065F46',
      },
      warning: {
        default: '#F97316',
        hover: '#FB923C',
        active: '#EA580C',
        light: '#FED7AA',
        dark: '#9A3412',
      },
      error: {
        default: '#DC2626',
        hover: '#EF4444',
        active: '#B91C1C',
        light: '#FEE2E2',
        dark: '#991B1B',
      },
      info: {
        default: '#0EA5E9',
        hover: '#38BDF8',
        active: '#0284C7',
        light: '#E0F2FE',
        dark: '#0C4A6E',
      },
    },
    background: {
      primary: '#f7fafc',
      secondary: '#ffffff',
      tertiary: '#edf2f7',
      paper: '#ffffff',
      surface: '#ffffff',
      hover: '#edf2f7',
      disabled: '#F3F4F6',
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096',
      tertiary: '#a0aec0',
      disabled: '#9CA3AF',
      inverse: '#ffffff',
      link: '#2563EB',
      linkHover: '#1D4ED8',
    },
    border: {
      default: '#e0e0e0',
      hover: '#cbd5e0',
      focus: '#2563EB',
      error: '#DC2626',
      disabled: '#E5E7EB',
    },
    department: {
      all: {
        default: '#4B5563',
        hover: '#6B7280',
        active: '#374151',
        background: 'rgba(75, 85, 99, 0.15)',
      },
      designers: {
        default: '#6D28D9',
        hover: '#7C3AED',
        active: '#5B21B6',
        background: 'rgba(109, 40, 217, 0.15)',
      },
      developers: {
        default: '#147857',
        hover: '#1FA97A',
        active: '#0F5C44',
        background: 'rgba(20, 120, 87, 0.15)',
      },
      managers: {
        default: '#DC2626',
        hover: '#EF4444',
        active: '#B91C1C',
        background: 'rgba(220, 38, 38, 0.15)',
      },
      marketers: {
        default: '#EC4899',
        hover: '#F472B6',
        active: '#DB2777',
        background: 'rgba(236, 72, 153, 0.15)',
      },
      videographers: {
        default: '#F97316',
        hover: '#FB923C',
        active: '#EA580C',
        background: 'rgba(249, 115, 22, 0.15)',
      },
    },
    priority: {
      critical: {
        color: '#dc2626',
        background: 'rgba(220, 38, 38, 0.15)',
        range: '80-100',
      },
      high: {
        color: '#ea580c',
        background: 'rgba(234, 88, 12, 0.15)',
        range: '60-79',
      },
      medium: {
        color: '#f59e0b',
        background: 'rgba(245, 158, 11, 0.15)',
        range: '40-59',
      },
      low: {
        color: '#84cc16',
        background: 'rgba(132, 204, 22, 0.15)',
        range: '20-39',
      },
      veryLow: {
        color: '#22c55e',
        background: 'rgba(34, 197, 94, 0.15)',
        range: '0-19',
      },
    },
  },
  typography: {
    fontFamily: {
      primary: 'Roboto',
      fallback: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
      monospace: "'Fira Code', 'Courier New', monospace",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    scale: 'linear',
    baseUnit: '4px',
    values: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      12: '48px',
      16: '64px',
      20: '80px',
      24: '96px',
    },
  },
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '6px',
    base: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
    button: '8px',
    card: '12px',
    modal: '12px',
    input: '8px',
    badge: '9999px',
    avatar: '50%',
  },
  shadows: {
    none: 'none',
    light: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    card: '0 2px 8px rgba(0, 0, 0, 0.10)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
    heavy: '0 10px 30px rgba(0, 0, 0, 0.15)',
    inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Helper functions
export const getDepartmentColor = (department: string) => {
  const deptMap: Record<string, keyof typeof designSystem.colors.department> = {
    DEV: 'developers',
    DGN: 'designers',
    MKT: 'marketers',
    VID: 'videographers',
    AID: 'all',
    SMM: 'all',
  };
  return designSystem.colors.department[deptMap[department] || 'all'];
};

export const getPriorityColor = (score: number) => {
  if (score >= 80) return designSystem.colors.priority.critical;
  if (score >= 60) return designSystem.colors.priority.high;
  if (score >= 40) return designSystem.colors.priority.medium;
  if (score >= 20) return designSystem.colors.priority.low;
  return designSystem.colors.priority.veryLow;
};
