import "./App.css";
import { QueryProvider } from "./app/providers/QueryProvider";

const modules = [
  "Articles",
  "Categories",
  "Clients",
  "Fournisseurs",
  "Commandes clients",
  "Commandes fournisseurs",
  "Ventes",
  "Mouvements de stock",
  "Entreprise",
];

function App() {
  return (
    <QueryProvider>
      <main className="app-shell">
        <section className="welcome">
          <p className="eyebrow">Gestion de stock</p>
          <h1>Base frontend prête pour les modules métier</h1>
          <p className="lead">
            Le projet est maintenant organisé en architecture feature-first pour
            construire progressivement les fonctionnalités de gestion de stock.
          </p>
        </section>

        <section className="modules" aria-labelledby="modules-title">
          <div className="section-heading">
            <p className="eyebrow">Modules</p>
            <h2 id="modules-title">Domaines fonctionnels</h2>
          </div>

          <ul className="module-grid">
            {modules.map((module) => (
              <li key={module}>{module}</li>
            ))}
          </ul>
        </section>
      </main>
    </QueryProvider>
  );
}

export default App;
