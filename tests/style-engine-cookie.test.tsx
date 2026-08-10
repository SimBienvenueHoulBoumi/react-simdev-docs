// Pourquoi : le moteur de style doit être lisible PAR LE SERVEUR, sinon le HTML
// part en Tailwind et la page se re-skinne en MUI après hydratation (mesuré :
// ~55 ms, sur chaque page). Ces tests verrouillent la lecture du cookie et le
// fait que le rendu serveur suive `initialEngine`.

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  EngineSwitch,
  engineFromCookie,
  StyleEngineProvider,
} from "~/lib/style-engine";

describe("engineFromCookie — même format côté serveur et client", () => {
  it("lit le moteur d'un en-tête Cookie", () => {
    expect(engineFromCookie("foundry-engine=mui")).toBe("mui");
    expect(engineFromCookie("foundry-engine=tailwind")).toBe("tailwind");
  });

  it("le trouve au milieu d'autres cookies", () => {
    expect(engineFromCookie("theme=dark; foundry-engine=mui; autre=1")).toBe("mui");
  });

  it("ne confond pas un cookie dont le nom se termine pareil", () => {
    expect(engineFromCookie("x-foundry-engine=mui")).toBeNull();
  });

  it("renvoie null sur une valeur inconnue, vide ou absente", () => {
    expect(engineFromCookie("foundry-engine=bootstrap")).toBeNull();
    expect(engineFromCookie("")).toBeNull();
    expect(engineFromCookie(null)).toBeNull();
    expect(engineFromCookie(undefined)).toBeNull();
  });
});

describe("StyleEngineProvider — rendu SERVEUR", () => {
  // C'est le rendu serveur qui compte : `initialEngine` alimente le
  // getServerSnapshot de useSyncExternalStore. En client, la valeur vient du
  // cookie du document — d'où renderToString ici, et pas render().
  const rendreServeur = (engine?: "tailwind" | "mui") =>
    renderToString(
      <StyleEngineProvider initialEngine={engine}>
        <EngineSwitch tailwind={<p>TW</p>} mui={<p>MUI</p>} />
      </StyleEngineProvider>,
    );

  it("émet déjà l'implémentation MUI quand le cookie dit MUI", () => {
    const html = rendreServeur("mui");
    expect(html).toContain("MUI");
    expect(html).not.toContain(">TW<");
  });

  it("émet Tailwind quand le cookie dit Tailwind", () => {
    expect(rendreServeur("tailwind")).toContain("TW");
  });

  it("retombe sur Tailwind sans cookie", () => {
    expect(rendreServeur()).toContain("TW");
  });
});
