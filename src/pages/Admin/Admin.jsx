import React, { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Typography,
  IconButton,
  Avatar,
  AppBar,
  Toolbar,
  InputBase,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AddCircleOutline,
  ManageAccountsOutlined,
  KeyboardBackspace,
  SettingsOutlined,
  Search,
  PersonOutlineOutlined,
  VideoCallOutlined,
  ArticleOutlined,
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
  Tooltip,
} from "chart.js";
import "./styles.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const drawerWidth = 260;

export const Admin = () => {
  const [productCount, setProductCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const { userName } = useAuth();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [totalProducts, totalPosts] = await Promise.all([
          getProductCount(),
          getPostCount(),
        ]);
        setProductCount(totalProducts);
        setPostCount(totalPosts);
      } catch (error) {
        console.error("Erro ao buscar contagens do dashboard:", error);
      }
    };
    fetchCounts();
  }, []);

  const chartData = {
    labels: ["Produtos", "Posts"],
    datasets: [
      {
        label: "Contagem",
        data: [productCount, postCount],
        backgroundColor: ["#14181F", "#A6813C"],
        borderRadius: 0,
        maxBarThickness: 64,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#14181F",
        titleFont: { family: "Work Sans" },
        bodyFont: { family: "Work Sans" },
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "Work Sans", size: 13 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#E4E0D6" },
        ticks: { font: { family: "Work Sans", size: 12 } },
      },
    },
  };

  const sideLinks = [
    {
      text: "Importar vídeo",
      icon: <VideoCallOutlined />,
      link: "/import-video",
    },
    {
      text: "Adicionar produto",
      icon: <AddCircleOutline />,
      link: "/add-products",
    },
    { text: "Adicionar post", icon: <ArticleOutlined />, link: "/add-posts" },
    {
      text: "Gerenciar produtos",
      icon: <ManageAccountsOutlined />,
      link: "/admin/manage-products",
    },
    {
      text: "Gerenciar posts",
      icon: <ManageAccountsOutlined />,
      link: "/manage-posts",
    },
    {
      text: "Gerenciar usuários",
      icon: <PersonOutlineOutlined />,
      link: "/manage-users",
    },
    { text: "Configurações", icon: <SettingsOutlined />, link: "/settings" },
    {
      text: "Editar perfil",
      icon: <PersonOutlineOutlined />,
      link: "/edit-profile",
    },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            edge="start"
            component={NavLink}
            to="/"
            sx={{ color: "#F6F4EF" }}
          >
            <KeyboardBackspace />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              background: "rgba(246,244,239,0.08)",
              border: "1px solid rgba(246,244,239,0.14)",
              padding: "8px 14px",
              width: "100%",
              maxWidth: 360,
            }}
          >
            <Search sx={{ fontSize: 18, color: "#A8A296" }} />
            <InputBase
              placeholder="Pesquisar..."
              sx={{ color: "#F6F4EF", fontSize: 14, width: "100%" }}
            />
          </Box>

          <NavLink
            to="/edit-profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginLeft: 16,
              textDecoration: "none",
            }}
          >
            <Typography
              sx={{ color: "#F6F4EF", fontSize: 14, fontWeight: 500 }}
            >
              {userName}
            </Typography>
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: "#A6813C", fontSize: 14 }}
            >
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </Avatar>
          </NavLink>
        </Toolbar>
      </AppBar>

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
        <Box sx={{ overflow: "auto", pt: 2 }}>
          <List>
            {sideLinks.map((item) => (
              <ListItemButton
                key={item.text}
                component={NavLink}
                to={item.link}
                className={({ isActive }) => (isActive ? "active" : "")}
                sx={{ py: 1.4, px: 3 }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: "#6B6558" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: 14.5 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          marginLeft: `${drawerWidth}px`,
          marginTop: "64px",
          background: "#F6F4EF",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ p: 3 }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1 }}>
                Total de produtos
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Bricolage Grotesque",
                  fontWeight: 700,
                  fontSize: 40,
                }}
              >
                {productCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ p: 3 }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1 }}>
                Total de posts
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Bricolage Grotesque",
                  fontWeight: 700,
                  fontSize: 40,
                  color: "#A6813C",
                }}
              >
                {postCount}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card sx={{ p: 3 }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
                Estatísticas visuais
              </Typography>
              <Box sx={{ height: 240 }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
