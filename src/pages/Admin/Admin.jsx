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
  Button,
  Box,
} from "@mui/material";
import {
  AddCircle,
  AdminPanelSettings,
  KeyboardBackspace,
  ManageAccounts,
  Settings,
  Search,
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

// Register the chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

  return (
    <>
      {/* AppBar - Header Section */}
      <AppBar position="static" color="primary" elevation={3}>
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
            style={{ display: "flex", alignItems: "center", marginLeft: 16 }}
          >
            <Typography variant="body1" sx={{ marginRight: 1 }}>
              {userName}
            </Typography>
            <Avatar />
          </NavLink>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 4 }}>
        <Grid container spacing={4}>
          {/* Metrics Section */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 3,
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Total de Produtos
              </Typography>
              <Typography variant="h4" color="primary">
                {productCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 3,
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Total de Posts
              </Typography>
              <Typography variant="h4" color="secondary">
                {postCount}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              elevation={3}
              component={NavLink}
              to="/import-video"
              sx={{
                textDecoration: "none",
                textAlign: "center",
                padding: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                borderRadius: 2,
                transition: "transform 0.2s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <AddCircle color="primary" />
              <Typography
                variant="body1"
                sx={{ marginTop: 2, color: "inherit" }}
              >
                Importar vídeo do YouTube
              </Typography>
            </Card>
          </Grid>

          {/* Admin Action Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <CardAction
              title="Adicionar Produtos"
              icon={<AddCircle />}
              link="/add-products"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <CardAction
              title="Adicionar Post"
              icon={<AddCircle />}
              link="/add-posts"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <CardAction
              title="Gerenciar Produtos"
              icon={<AdminPanelSettings />}
              link="/admin/manage-products"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <CardAction
              title="Gerenciar Publicações"
              icon={<AdminPanelSettings />}
              link="/manage-posts"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <CardAction
              title="Gerenciar Usuários"
              icon={<ManageAccounts />}
              link="/manage-users"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <CardAction
              title="Configurações"
              icon={<Settings />}
              link="/settings"
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

// Admin Card Action Component
const CardAction = ({ title, icon, link }) => (
  <Card
    component={NavLink}
    to={link}
    sx={{
      textDecoration: "none",
      textAlign: "center",
      padding: 3,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
      backgroundColor: "#f5f5f5",
      borderRadius: 2,
      transition: "transform 0.2s ease",
      "&:hover": { transform: "scale(1.05)" },
    }}
  >
    {icon}
    <Typography variant="body1" sx={{ marginTop: 2, color: "inherit" }}>
      {title}
    </Typography>
  </Card>
);
