// Pourquoi : test exemplaire « composant générique » (spec §12) — le
// DataList ne connaît pas la forme des données : deux formes radicalement
// différentes prouvent l'adaptabilité, plus les quatre états (spec §5.1).

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StyleEngineProvider } from "~/lib/style-engine";
import { DataList } from "~/components/patterns/data-list";

// Forme 1 : des tâches { id, titre }
const tasks = [
  { id: 1, titre: "Déployer" },
  { id: 2, titre: "Notifier" },
];

// Forme 2 : des utilisateurs { uid, nom, actif }
const users = [
  { uid: "a1", nom: "Alice", actif: true },
  { uid: "b2", nom: "Bob", actif: false },
];

// Le DataList rend Skeleton (façade EngineSwitch) en chargement :
// le test doit couvrir le provider du moteur de style.
function renderList(ui: React.ReactNode) {
  return render(<StyleEngineProvider>{ui}</StyleEngineProvider>);
}

describe("data-list — deux formes de données", () => {
  it("rend des tâches via getKey/renderItem", () => {
    renderList(
    <DataList
        items={tasks}
        getKey={(t) => t.id}
        renderItem={(t) => <span>{t.titre}</span>}
        empty={<p>Aucune tâche</p>}
      />,
    );
    expect(screen.getByText("Déployer")).toBeInTheDocument();
    expect(screen.getByText("Notifier")).toBeInTheDocument();
  });

  it("rend des utilisateurs d'une autre forme sans changer le composant", () => {
    renderList(
    <DataList
        items={users}
        getKey={(u) => u.uid}
        renderItem={(u) => (
          <span>
            {u.nom} {u.actif ? "✓" : "✗"}
          </span>
        )}
        empty={<p>Personne</p>}
      />,
    );
    expect(screen.getByText("Alice ✓")).toBeInTheDocument();
    expect(screen.getByText("Bob ✗")).toBeInTheDocument();
  });
});

describe("data-list — quatre états", () => {
  it("chargement : skeletons avec aria-busy (items null)", () => {
    renderList(
    <DataList<{ id: number; titre: string }> items={null} getKey={(t) => t.id} renderItem={(t) => <span>{t.titre}</span>} empty={<p>Vide</p>} />,
    );
    expect(screen.getByLabelText("Chargement")).toHaveAttribute("aria-busy", "true");
  });

  it("erreur : role=alert avec le message real", () => {
    renderList(
    <DataList
        items={undefined as { id: number; titre: string }[] | null | undefined}
        error={new Error("Connexion refusée")}
        getKey={(t) => t.id}
        renderItem={(t) => <span>{t.titre}</span>}
        empty={<p>Vide</p>}
      />,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Connexion refusée");
  });

  it("vide : rend le contenu empty passé en prop", () => {
    renderList(
    <DataList<{ id: number; titre: string }> items={[]} getKey={(t) => t.id} renderItem={(t) => <span>{t.titre}</span>} empty={<p>Rien à afficher</p>} />,
    );
    expect(screen.getByText("Rien à afficher")).toBeInTheDocument();
  });

  it("succès : rend une liste <ul> avec les clés stables", () => {
    renderList(
    <DataList
        items={tasks}
        getKey={(t) => t.id}
        renderItem={(t) => <span>{t.titre}</span>}
        empty={<p>Vide</p>}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Déployer");
  });
});