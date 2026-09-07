import { createTheme } from "@mui/material/styles";

// Tema MUI alinhado ao sistema de design do site (ink/paper/brass).
// Qualquer componente MUI (AppBar, Drawer, Card, TextField, Button...)
// passa a herdar essas cores e fontes automaticamente, em vez do azul
// padrão do Material UI — sem precisar sobrescrever cor por cor em
// cada arquivo que usa MUI (Admin, Login, filtros de busca, etc.).
export const theme = createTheme({
  palette: {
    primary: {
      main: "#14181F", // ink
      contrastText: "#F6F4EF",
    },
    secondary: {
      main: "#A6813C", // brass
      contrastText: "#F6F4EF",
    },
    background: {
      default: "#F6F4EF", // paper
      paper: "#FFFFFF",
    },
    text: {
      primary: "#14181F",
      secondary: "#6B6558", // stone
    },
    divider: "#E4E0D6", // line
  },
  typography: {
    fontFamily: '"Work Sans", sans-serif',
    h1: { fontFamily: '"Bricolage Grotesque", sans-serif' },
    h2: { fontFamily: '"Bricolage Grotesque", sans-serif' },
    h3: { fontFamily: '"Bricolage Grotesque", sans-serif' },
    h4: { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 600 },
    h5: { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: {
    radius: 0,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#14181F",
          boxShadow: "none",
          borderBottom: "1px solid rgba(246,244,239,0.14)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#F6F4EF",
          borderRight: "1px solid #E4E0D6",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: "1px solid #E4E0D6",
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: "none",
        },
        containedPrimary: {
          "&:hover": { backgroundColor: "#A6813C", boxShadow: "none" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
        notchedOutline: {
          borderColor: "#E4E0D6",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          "&.active": {
            backgroundColor: "rgba(166,129,60,0.1)",
            borderRight: "2px solid #A6813C",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});
