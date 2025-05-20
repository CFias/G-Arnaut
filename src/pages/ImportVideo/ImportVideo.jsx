import React, { useEffect, useState } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Grid,
  Card,
} from "@mui/material";
import {
  AddCircle,
  AdminPanelSettings,
  KeyboardBackspace,
  ManageAccounts,
  Settings,
  ManageAccountsRounded,
  Article,
  Analytics,
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  const menuItems = [
    { text: "Início", icon: <KeyboardBackspace />, link: "/" },
    { text: "Importar Vídeo", icon: <AddCircle />, link: "/import-video" },
    { text: "Adicionar Produtos", icon: <AddCircle />, link: "/add-products" },
    { text: "Adicionar Post", icon: <AddCircle />, link: "/add-posts" },
    {
      text: "Gerenciar Produtos",
      icon: <AdminPanelSettings />,
      link: "/admin/manage-products",
    },
    { text: "Gerenciar Publicações", icon: <Article />, link: "/manage-posts" },
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
    {
      text: "Analytics Produtos",
      icon: <Analytics />,
      link: "/analytics-products",
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Painel Admin
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ marginRight: 1 }}>
              {userName}
            </Typography>
            <Avatar />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map(({ text, icon, link }) => (
              <ListItem
                button
                key={text}
                component={NavLink}
                to={link}
                sx={{ textDecoration: "none", color: "inherit" }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ padding: 3, textAlign: "center" }}>
              <Typography variant="h6" color="textSecondary">
                Total de Produtos
              </Typography>
              <Typography variant="h4" color="primary">
                {productCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ padding: 3, textAlign: "center" }}>
              <Typography variant="h6" color="textSecondary">
                Total de Posts
              </Typography>
              <Typography variant="h4" color="secondary">
                {postCount}
              </Typography>
            </Card>
          </Grid>
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
    </Box>
  );
};
