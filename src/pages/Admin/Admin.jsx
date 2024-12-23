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
  TextField,
  Button,
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
import Logo from "../../assets/image/garnaut-gray-logo.png";
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
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const { userName } = useAuth();

  // Função para extrair o ID do vídeo do YouTube a partir da URL
  const extractVideoId = (url) => {
    const match = url.match(
      /(?:https?:\/\/(?:www\.)?youtube\.com(?:\/(?:v|e(?:mbed)?)\/|\S*\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : "";
  };

  // Gráfico de barras - Dados
  const chartData = {
    labels: ["Produtos", "Posts"], // Labels no eixo X
    datasets: [
      {
        label: "Contagem", // Título da barra
        data: [productCount, postCount], // Dados para as barras
        backgroundColor: ["#1A528F", "#3175B6"], // Cores para as barras
        borderRadius: 10, // Arredondar as bordas das barras
      },
    ],
  };

  // Opções do gráfico
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

  useEffect(() => {
    const fetchCounts = async () => {
      const totalProducts = await getProductCount();
      const totalPosts = await getPostCount();
      setProductCount(totalProducts);
      setPostCount(totalPosts);
    };
    fetchCounts();
  }, []);

  return (
    <>
      {/* Navigation */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <NavLink to="/" style={{ display: "flex", alignItems: "center" }}>
            <img
              src={Logo}
              alt="Logo"
              style={{ height: 40, marginRight: 16 }}
            />
          </NavLink>
          <IconButton
            edge="start"
            color="inherit"
            component={NavLink}
            to="/admin"
          >
            <KeyboardBackspace />
          </IconButton>
          <InputBase
            placeholder="Pesquisar..."
            startAdornment={<Search style={{ marginRight: 8 }} />}
            style={{
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
            <Typography variant="body1" style={{ marginRight: 8 }}>
              {userName}
            </Typography>
            <Avatar />
          </NavLink>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Grid container spacing={4} style={{ padding: 24 }}>
        {/* Metrics Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6">Total de Produtos</Typography>
              <Typography variant="h4" color="primary">
                {productCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6">Total de Posts</Typography>
              <Typography variant="h4" color="secondary">
                {postCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Estatísticas */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estatísticas de Produtos e Posts
              </Typography>
              <Bar data={chartData} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>

        {/* Nova opção para importar vídeo */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={3}
            component={NavLink}
            to="/import-video"
            style={{
              textDecoration: "none",
              textAlign: "center",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <AddCircle color="primary" />
            <Typography
              variant="body1"
              style={{ marginTop: 8, color: "inherit" }}
            >
              Importar vídeo do YouTube
            </Typography>
          </Card>
        </Grid>

        {/* Outras opções de administração */}
        {[
          {
            title: "Adicione novos imóveis",
            icon: <AddCircle color="primary" />,
            link: "/add-products",
          },
          {
            title: "Adicione um novo post para o blog",
            icon: <AddCircle color="primary" />,
            link: "/add-posts",
          },
          {
            title: "Gerenciar produtos",
            icon: <AdminPanelSettings color="secondary" />,
            link: "/admin/manage-products",
          },
          {
            title: "Gerenciar publicações",
            icon: <AdminPanelSettings color="secondary" />,
            link: "/manage-posts",
          },
          {
            title: "Gerenciar usuários",
            icon: <ManageAccounts color="success" />,
            link: "/manage-users",
          },
          {
            title: "Configurações",
            icon: <Settings color="action" />,
            link: "/settings",
          },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              elevation={3}
              component={NavLink}
              to={item.link}
              style={{
                textDecoration: "none",
                textAlign: "center",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              {item.icon}
              <Typography
                variant="body1"
                style={{ marginTop: 8, color: "inherit" }}
              >
                {item.title}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
};
