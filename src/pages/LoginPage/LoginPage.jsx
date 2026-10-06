import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthShell from "./AuthShell";
import { login } from "../../services/FirebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import { isAdminUser } from "../../config/adminUsers";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const ERRORS = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/invalid-email": "Esse e-mail não parece válido.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  "auth/network-request-failed": "Sem conexão. Verifique a internet.",
};

export default function Login() {
  useDocumentTitle("Entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Já logado → vai direto para onde faz sentido
  useEffect(() => {
    if (currentUser) navigate(isAdminUser(currentUser) ? "/admin" : "/", { replace: true });
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { user } = await login(email.trim(), password);
      navigate(isAdminUser(user) ? "/admin" : "/", { replace: true });
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError(ERRORS[err?.code] || "Não foi possível entrar. Tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Área do corretor"
      subtitle="Entre para gerenciar imóveis e leads."
      aside={
        <>
          <h2>Novo por aqui?</h2>
          <p>Crie sua conta para salvar buscas e acompanhar imóveis.</p>
          <Link className="btn btn--white" to="/register">Criar conta</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="form-error" role="alert">{error}</div>}
        <label className="field">
          <span className="field-label">E-mail</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label className="field">
          <span className="field-label">Senha</span>
          <span className="password-wrap">
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={loading || !email || !password}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </AuthShell>
  );
}
