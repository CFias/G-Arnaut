import { Navbar } from "../Navbar/Navbar";
import { CtaBanner, Footer } from "../Footer/Footer";
import { CookieConsent } from "../CookieConsent/CookieConsent";

/** Header + conteúdo + CTA escuro + rodapé, comum a todas as páginas públicas. */
export default function PublicLayout({ children, cta = true }) {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo">{children}</main>
      {cta && <CtaBanner />}
      <Footer />
      <CookieConsent />
    </>
  );
}
