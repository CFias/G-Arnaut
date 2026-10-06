import { Link } from "react-router-dom";
import PublicLayout from "../../components/PublicLayout/PublicLayout";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Página não encontrada");
  return (
    <PublicLayout>
      <section className="container section">
        <div className="empty-box">
          <strong>Esta página não existe</strong>
          <p>O endereço pode ter mudado. Comece pelos imóveis disponíveis.</p>
          <div className="empty-actions">
            <Link to="/imoveis" className="btn btn--primary">Ver imóveis</Link>
            <Link to="/" className="btn btn--outline">Página inicial</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
