import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import AuthShell from "../LoginPage/AuthShell";
import { db, signup } from "../../services/FirebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

function passwordStrength(pw) {
  if (pw.length < 8) return "Muito fraca";
  const score = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  return score === 4 ? "Forte" : score === 3 ? "Média" : "Fraca";
}

const ERRORS = {
  "auth/email-already-in-use": "Este e-mail já está em uso.",
  "auth/invalid-email": "Esse e-mail não parece válido.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/network-request-failed": "Sem conexão. Verifique a internet.",
};

export default function Register() {
  useDocumentTitle("Criar conta");
  const [userName, setUserNameInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUserName } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { user } = await signup(email.trim(), password);
      await setDoc(doc(db, "users", user.uid), { userName: userName.trim(), email: email.trim() });
      setUserName?.(userName.trim());
      navigate("/");
    } catch (err) {
      console.error("Erro ao registrar usuário:", err);
      setError(ERRORS[err?.code] || "Não foi possível criar a conta. Tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  const strength = password ? passwordStrength(password) : "";

  return (
    <AuthShell
      title="Criar conta"
      aside={
        <>
          <h2>Já tem conta?</h2>
          <p>Entre para continuar de onde parou.</p>
          <Link className="btn btn--white" to="/login">Entrar</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <label className="field">
          <span className="field-label">Nome</span>
          <input className="input" value={userName} onChange={(e) => setUserNameInput(e.target.value)} autoComplete="name" required />
        </label>
        <label className="field">
          <span className="field-label">E-mail</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label className="field">
          <span className="field-label">Senha</span>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
          {strength && <span className="field-hint">Força da senha: {strength}</span>}
        </label>
        <label className="field">
          <span className="field-label">Confirme a senha</span>
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            aria-invalid={confirmPassword && confirmPassword !== password ? "true" : undefined}
            required
          />
        </label>
        <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={loading}>
          {loading ? "Criando…" : "Criar conta"}
        </button>
      </form>
    </AuthShell>
  );
}
