import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import logoBlanco from "@/assets/solvent-blanco.png.asset.json";

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-8 text-center text-sm sm:flex-row sm:justify-between sm:text-left">
        <a href="https://solventie.es/" target="_blank" rel="noopener" >
          <img src={logoBlanco.url} alt="Solvent Iniciativas Empresariales" className="h-8 w-auto" />
        </a>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 opacity-90">
          <a href="https://solventie.es/" target="_blank" rel="noopener" className="hover:text-primary">solventie.es</a>
          <Link to="/privacidad" className="hover:text-primary">{t.footPriv}</Link>
          <Link to="/aviso-legal" className="hover:text-primary">{t.footLegal}</Link>
        </nav>
        <p className="opacity-70">© {new Date().getFullYear()} Solvent Iniciativas Empresariales</p>
      </div>
    </footer>
  );
}
