import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../../assets/image/garnaut-gray-logo.png";
import WhiteLogo from "../../assets/image/garnaut-white-logo.png";
import "./styles.css";

/** Moldura comum de Login e Cadastro. */
export default function AuthShell({ title, subtitle, children, aside }) {
  return (
    <div className="auth">
      <div className="auth-main">
        <Link to="/" className="auth-back">
          <ArrowLeft size={16} /> Voltar ao site
        </Link>
        <div className="auth-box">
          <img src={Logo} alt="" width={56} height={56} className="auth-logo" />
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
          {children}
        </div>
      </div>
      <aside className="auth-aside">
        <img src={WhiteLogo} alt="" width={120} height={120} />
        {aside}
      </aside>
    </div>
  );
}
