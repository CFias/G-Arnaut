import { createTheme } from '@mui/material/styles';

/**
 * Tokens do handoff v3 "clean" (README → Design Tokens).
 * Use `tokens` direto em sx/styled quando o valor não couber na palette do MUI.
 */
export const tokens = {
  color: {
    ink: '#0F1B33',
    primary: '#1F3F8F',
    primaryHover: '#18336F',
    primaryTint: '#EAF0FB',
    gold: '#B8914A',
    goldLight: '#D8B978',
    goldDark: '#8C6A2C',
    goldTint: '#F3ECDD',
    goldTintText: '#7A5A22',
    bg: '#FFFFFF',
    bgSoft: '#F5F6F8',
    inputBg: '#F8F9FB',
    border: '#E7E9EE',
    borderInput: '#E2E5EB',
    borderStrong: '#D5D9E0',
    divider: '#EEF0F3',
    muted: '#5E6678',
    muted2: '#7A8293',
    successBg: '#E2F0E6',
    successText: '#2B6340',
    error: '#A13A2A',
    selection: '#DCE6F8',
  },
  radius: {
    control: 10, // botões e inputs
    card: 14, // card de imóvel
    block: 16, // hero, busca, blocos grandes, drawer
    menu: 12, // dropdown
    badge: 6,
    pill: 999, // chips de filtro, toggles
  },
  shadow: {
    search: '0 24px 60px -28px rgba(15,27,51,.35)',
    cardHover: '0 16px 36px -20px rgba(15,27,51,.28)',
    dropdown: '0 18px 40px -20px rgba(15,27,51,.3)',
  },
  layout: {
    container: 1200,
    hero: 1400,
    gutter: 24,
    headerHeight: 64,
  },
  placeholder: 'repeating-linear-gradient(135deg,#E9ECF0 0 10px,#F1F3F6 10px 20px)',
  font: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

const c = tokens.color;
const r = tokens.radius;

export const theme = createTheme({
  // md = 900px já é o breakpoint principal do projeto
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },

  palette: {
    mode: 'light',
    primary: { main: c.primary, dark: c.primaryHover, light: c.primaryTint, contrastText: '#FFFFFF' },
    secondary: { main: c.gold, dark: c.goldDark, light: c.goldLight, contrastText: '#FFFFFF' },
    success: { main: c.successText, light: c.successBg, contrastText: '#FFFFFF' },
    error: { main: c.error, contrastText: '#FFFFFF' },
    text: { primary: c.ink, secondary: c.muted, disabled: c.muted2 },
    background: { default: c.bg, paper: c.bg },
    divider: c.divider,
    grey: { 50: c.inputBg, 100: c.bgSoft, 200: c.divider, 300: c.border, 400: c.borderStrong, 500: c.muted2, 600: c.muted },
    action: { hover: c.bgSoft, selected: c.primaryTint, focus: c.primaryTint },
  },

  shape: { borderRadius: r.control },

  // Sem sombras padrão do Material: todas zeradas.
  // As 3 sombras do design ficam em `tokens.shadow` e são aplicadas pontualmente.
  shadows: Array(25).fill('none'),

  typography: {
    fontFamily: tokens.font,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    // H1 do hero
    h1: { fontSize: 'clamp(34px, 4.6vw, 58px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.03em' },
    // H1 de páginas internas (listagem / detalhe)
    h2: { fontSize: 'clamp(27px, 3.1vw, 42px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.025em' },
    // H2 de seção
    h3: { fontSize: 'clamp(24px, 2.6vw, 30px)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h4: { fontSize: 20, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h5: { fontSize: 17, fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: 15, fontWeight: 600, lineHeight: 1.3 },
    subtitle1: { fontSize: 17, lineHeight: 1.6 },
    subtitle2: { fontSize: 13, fontWeight: 600, lineHeight: 1.4 }, // labels de form
    body1: { fontSize: 15, lineHeight: 1.65 },
    body2: { fontSize: 14, lineHeight: 1.6 },
    caption: { fontSize: 12, lineHeight: 1.5, color: c.muted },
    overline: { fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', lineHeight: 1.4, textTransform: 'uppercase', color: c.goldDark }, // eyebrow
    button: { fontSize: 14, fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
  },

  transitions: {
    duration: { shortest: 150, shorter: 200, short: 250, standard: 250, complex: 300, enteringScreen: 250, leavingScreen: 200 },
  },

  components: {
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: r.control,
          minHeight: 44,
          padding: '0 20px',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'background-color .2s, border-color .2s, color .2s',
          '&:hover': { boxShadow: 'none' },
        },
        sizeSmall: { minHeight: 36, padding: '0 14px', fontSize: 13 },
        sizeLarge: { minHeight: 48, padding: '0 28px' },
        containedPrimary: {
          '&:hover': { backgroundColor: c.primaryHover },
        },
        outlined: {
          borderColor: c.borderStrong,
          color: c.ink,
          backgroundColor: '#FFFFFF',
          '&:hover': { borderColor: c.primary, color: c.primary, backgroundColor: '#FFFFFF' },
        },
        text: {
          color: c.ink,
          '&:hover': { backgroundColor: c.bgSoft },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: r.control,
          color: c.ink,
          '&:hover': { backgroundColor: c.bgSoft },
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: { fontSize: 14, color: c.ink },
        input: {
          '&::placeholder': { color: c.muted2, opacity: 1 },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: r.control,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: c.borderInput },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.borderStrong },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.primary, borderWidth: 1 },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: c.error },
        },
        input: { padding: '13px 14px' },
        inputSizeSmall: { padding: '9px 12px' },
      },
    },

    MuiInputLabel: {
      defaultProps: { shrink: true },
      styleOverrides: {
        root: { fontSize: 13, fontWeight: 600, color: c.ink, '&.Mui-focused': { color: c.ink } },
      },
    },

    MuiFormLabel: {
      styleOverrides: {
        root: { fontSize: 13, fontWeight: 600, color: c.ink, '&.Mui-focused': { color: c.ink } },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: { marginLeft: 0, fontSize: 12, '&.Mui-error': { color: c.error } },
      },
    },

    MuiSelect: {
      defaultProps: {
        MenuProps: { PaperProps: { sx: { mt: 0.75 } } },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: r.block },
        outlined: { borderColor: c.border },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: r.card, border: `1px solid ${c.border}`, overflow: 'hidden' },
      },
    },

    MuiPopover: {
      styleOverrides: {
        paper: { borderRadius: r.menu, border: `1px solid ${c.border}`, boxShadow: tokens.shadow.dropdown },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: { borderRadius: r.menu, border: `1px solid ${c.border}`, boxShadow: tokens.shadow.dropdown },
        list: { padding: 6 },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: 14,
          borderRadius: 8,
          minHeight: 40,
          '&:hover': { backgroundColor: c.bgSoft },
          '&.Mui-selected': { backgroundColor: c.primaryTint, color: c.primary, fontWeight: 600 },
          '&.Mui-selected:hover': { backgroundColor: c.primaryTint },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: r.pill, fontSize: 13, fontWeight: 600, height: 34 },
        filled: { backgroundColor: c.bgSoft, color: c.ink },
        colorPrimary: { backgroundColor: c.primary, color: '#FFFFFF' },
        outlined: { borderColor: c.borderInput, backgroundColor: '#FFFFFF' },
        deleteIcon: { fontSize: 16 },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44 },
        indicator: { height: 2, backgroundColor: c.primary },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: 13,
          fontWeight: 600,
          minHeight: 44,
          padding: '0 14px',
          color: c.muted2,
          '&.Mui-selected': { color: c.ink },
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: { borderRadius: `${r.block}px 0 0 ${r.block}px`, borderLeft: `1px solid ${c.border}` },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: r.block },
      },
    },

    MuiBackdrop: {
      styleOverrides: {
        root: { backgroundColor: 'rgba(15,27,51,.4)' },
        invisible: { backgroundColor: 'transparent' },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: c.ink, fontSize: 12, fontWeight: 500, borderRadius: 8, padding: '6px 10px' },
      },
    },

    MuiSnackbarContent: {
      styleOverrides: {
        root: { backgroundColor: c.ink, color: '#FFFFFF', borderRadius: r.control, fontSize: 14, fontWeight: 500 },
      },
    },

    MuiDivider: {
      styleOverrides: { root: { borderColor: c.divider } },
    },

    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${c.divider}`, fontSize: 14 },
        head: { fontSize: 12, fontWeight: 600, color: c.muted, backgroundColor: c.bgSoft },
      },
    },

    // Toggles (Mobiliado, Aceita pet, Destaque): trilho pílula, sem sombra no thumb
    MuiSwitch: {
      styleOverrides: {
        root: { width: 44, height: 26, padding: 0 },
        switchBase: {
          padding: 3,
          '&.Mui-checked': {
            transform: 'translateX(18px)',
            color: '#FFFFFF',
            '& + .MuiSwitch-track': { backgroundColor: c.primary, opacity: 1 },
          },
          // <Switch color="secondary" /> → dourado (toggle "Destaque")
          '&.Mui-checked.MuiSwitch-colorSecondary + .MuiSwitch-track': { backgroundColor: c.gold },
        },
        thumb: { width: 20, height: 20, boxShadow: 'none' },
        track: { borderRadius: r.pill, backgroundColor: c.borderStrong, opacity: 1, transition: 'background-color .2s' },
      },
    },

    MuiLink: {
      defaultProps: { underline: 'none' },
      styleOverrides: {
        root: { color: c.primary, fontWeight: 600, '&:hover': { color: c.ink } },
      },
    },

    MuiSkeleton: {
      styleOverrides: { root: { backgroundColor: c.bgSoft } },
    },
  },
});

export default theme;
