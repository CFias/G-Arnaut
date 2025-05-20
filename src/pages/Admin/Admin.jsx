import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar,
  AppBar,
  Toolbar,
  InputBase,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AddCircle,
  AdminPanelSettings,
  KeyboardBackspace,
  ManageAccounts,
  Settings,
  Search,
  ManageAccountsRounded,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { getProductCount, getPostCount } from "../../services/FirebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Sidebar width
const drawerWidth = 240;

export const Admin = () => {
  const [productCount, setProductCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const { userName } = useAuth();

  useEffect(() => {
    const fetchCounts = async () => {
      const totalProducts = await getProductCount();
      const totalPosts = await getPostCount();
      setProductCount(totalProducts);
      setPostCount(totalPosts);
    };
    fetchCounts();
  }, []);

  const chartData = {
    labels: ["Produtos", "Posts"],
    datasets: [
      {
        label: "Contagem",
        data: [productCount, postCount],
        backgroundColor: ["#1A528F", "#3175B6"],
        borderRadius: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Estatísticas de Produtos e Posts",
      },
    },
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  };

  // Links e ícones da sidebar
  const sideLinks = [
    { text: "Importar Vídeo", icon: <AddCircle />, link: "/import-video" },
    { text: "Adicionar Produto", icon: <AddCircle />, link: "/add-products" },
    { text: "Adicionar Post", icon: <AddCircle />, link: "/add-posts" },
    {
      text: "Gerenciar Produtos",
      icon: <AdminPanelSettings />,
      link: "/admin/manage-products",
    },
    {
      text: "Gerenciar Posts",
      icon: <AdminPanelSettings />,
      link: "/manage-posts",
    },
    {
      text: "Gerenciar Usuários",
      icon: <ManageAccounts />,
      link: "/manage-users",
    },
    { text: "Configurações", icon: <Settings />, link: "/settings" },
    {
      text: "Editar Perfil",
      icon: <ManageAccountsRounded />,
      link: "/edit-profile",
    },
  ];

  return (
    <>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" component={NavLink} to="/">
            <KeyboardBackspace />
          </IconButton>
          <InputBase
            placeholder="Pesquisar..."
            startAdornment={<Search />}
            sx={{
              backgroundColor: "white",
              borderRadius: 8,
              padding: "4px 12px",
              marginLeft: "auto",
              flexGrow: 1,
              maxWidth: 400,
            }}
          />
          <NavLink
            to="/profile"
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: 16,
              color: "white",
            }}
          >
            <Typography variant="body1" sx={{ marginRight: 1 }}>
              {userName}
            </Typography>
            <Avatar />
          </NavLink>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {sideLinks.map((item, index) => (
              <ListItem
                button
                key={item.text}
                component={NavLink}
                to={item.link}
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          marginLeft: `${drawerWidth}px`,
          marginTop: "64px", // altura do AppBar
        }}
      >
        <Grid container spacing={4}>
          {/* Cards de contagem */}
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ textAlign: "center", padding: 3 }}>
              <Typography variant="h6" color="textSecondary">
                Total de Produtos
              </Typography>
              <Typography variant="h4" color="primary">
                {productCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ textAlign: "center", padding: 3 }}>
              <Typography variant="h6" color="textSecondary">
                Total de Posts
              </Typography>
              <Typography variant="h4" color="secondary">
                {postCount}
              </Typography>
            </Card>
          </Grid>

          {/* Gráfico */}
          <Grid item xs={12} md={12} lg={6}>
            <Card sx={{ padding: 3 }}>
              <Typography
                variant="h6"
                color="textSecondary"
                sx={{ marginBottom: 2 }}
              >
                Estatísticas Visuais
              </Typography>
              <Bar data={chartData} options={chartOptions} />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
