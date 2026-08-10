// Pourquoi : verrouille les nouveaux comportements d'UI du banc (spec §8
// « Nouveaux tests de banc ») — l'indicateur d'état, l'invite de premier
// lancement, et le rechargement du code au changement d'expérience.
// On rend le panneau RÉEL (bench-panel / bench) : le code passe par Sucrase
// et new Function, comme en production.

import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BenchPanel, { type BenchExperiment } from "~/components/layout/bench-panel";
import { Bench } from "~/components/layout/bench";

// Un programme exécutable par le banc dont le texte RENDU (« rendu n°0 »)
// diffère du texte SOURCE (« rendu n°{c} ») : on distingue ainsi le rendu du
// code affiché dans l'éditeur.
const CODE_DEMO = `function Demo() {
  const [c, setC] = React.useState(0);
  return <p id="rendu-banc">rendu n°{c}</p>;
}
return <Demo />;`;

function renderPanel() {
  return render(<BenchPanel code={CODE_DEMO} data={""} scope={{ React }} />);
}

function statusText(): string {
  const status = screen.getByRole("status");
  return status.textContent ?? "";
}

describe("banc d'essai — indicateur d'état", () => {
  it("passe à « modifié » quand le code est édité après exécution", async () => {
    renderPanel();
    expect(statusText()).toContain("jamais exécuté");

    fireEvent.click(screen.getByRole("button", { name: "▶ Exécuter ⌘↵" }));
    expect(await screen.findByText("rendu n°0")).toBeInTheDocument();
    expect(statusText()).toContain("à jour");

    fireEvent.change(screen.getByLabelText("Code JSX du banc d'essai"), {
      target: { value: CODE_DEMO.replace("useState(0)", "useState(1)") },
    });
    expect(statusText()).toContain("modifié");
  });
});

describe("banc d'essai — invite de premier lancement", () => {
  it("s'affiche tant que rien n'a été exécuté, puis disparaît à la première exécution", async () => {
    renderPanel();
    expect(screen.getByText(/Appuyez sur Exécuter/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "▶ Exécuter ⌘↵" }));
    expect(await screen.findByText("rendu n°0")).toBeInTheDocument();
    expect(screen.queryByText(/Appuyez sur Exécuter/)).not.toBeInTheDocument();
  });
});

describe("banc d'essai — changement d'expérience", () => {
  const EXPERIMENTS: BenchExperiment[] = [
    {
      id: "exp-a",
      label: "Expérience A",
      thesis: "La thèse de A",
      code: `return <p>contenu de A</p>;`,
    },
    {
      id: "exp-b",
      label: "Expérience B",
      thesis: "La thèse de B",
      code: `function Demo() {
  const [v, setV] = React.useState("B");
  return <p>contenu de {v}</p>;
}
return <Demo />;`,
    },
  ];

  it("recharge le code (et la thèse) correspondant à l'expérience choisie", async () => {
    render(
      <Bench
        code={EXPERIMENTS[0].code}
        data={""}
        scope={{ React }}
        experiments={EXPERIMENTS}
      />,
    );

    // Déplier le banc (chargement paresseux de bench-panel)
    fireEvent.click(screen.getByRole("button", { name: /Banc d'essai/ }));
    const editor = await screen.findByLabelText("Code JSX du banc d'essai");
    expect(editor).toHaveValue(EXPERIMENTS[0].code);
    expect(screen.getByText("La thèse de A")).toBeInTheDocument();

    // Changer d'onglet : le panneau se remonte avec le code de B
    fireEvent.click(screen.getByRole("tab", { name: "Expérience B" }));
    await waitFor(() => {
      expect(screen.getByLabelText("Code JSX du banc d'essai")).toHaveValue(
        EXPERIMENTS[1].code,
      );
      expect(screen.getByText("La thèse de B")).toBeInTheDocument();
    });
  });
});