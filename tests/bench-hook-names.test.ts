// Pourquoi : verrouille le contrat de nommage du panneau de hooks (design §5.2).
// Le point critique n'est pas de trouver les noms — c'est de REFUSER d'en
// inventer quand l'appariement n'est plus garanti.

import { describe, expect, it } from "vitest";
import { extractHookNames } from "~/components/layout/bench-hook-names";

describe("extractHookNames — formes canoniques", () => {
  it("relève la valeur et le setter d'un useState déstructuré", () => {
    const naming = extractHookNames(`const [count, setCount] = useState(0);`);
    expect(naming.values.get("useState")).toEqual(["count"]);
    expect(naming.setters.get("useState")).toEqual(["setCount"]);
  });

  it("relève l'état et le dispatch d'un useReducer", () => {
    const naming = extractHookNames(`const [state, dispatch] = useReducer(r, 0);`);
    expect(naming.values.get("useReducer")).toEqual(["state"]);
    expect(naming.setters.get("useReducer")).toEqual(["dispatch"]);
  });

  it("relève l'état et le démarreur d'un useTransition", () => {
    const naming = extractHookNames(`const [pending, start] = useTransition();`);
    expect(naming.values.get("useTransition")).toEqual(["pending"]);
    expect(naming.setters.get("useTransition")).toEqual(["start"]);
  });

  it("relève les affectations simples (useMemo, useRef, useContext)", () => {
    const naming = extractHookNames(`
      const square = useMemo(() => n * n, [n]);
      const box = useRef(null);
      const theme = useContext(ThemeCtx);
    `);
    expect(naming.values.get("useMemo")).toEqual(["square"]);
    expect(naming.values.get("useRef")).toEqual(["box"]);
    expect(naming.values.get("useContext")).toEqual(["theme"]);
  });

  it("suit l'ordre textuel quand un kind est appelé plusieurs fois", () => {
    const naming = extractHookNames(`
      const [label, setLabel] = useState("a");
      const [count, setCount] = useState(0);
    `);
    expect(naming.values.get("useState")).toEqual(["label", "count"]);
    expect(naming.setters.get("useState")).toEqual(["setLabel", "setCount"]);
  });

  it("traverse un préfixe de namespace (React.useState, ReactScope.useState)", () => {
    const naming = extractHookNames(`
      const [a, setA] = ReactScope.useState(1);
      const b = React.useMemo(() => a, [a]);
    `);
    expect(naming.values.get("useState")).toEqual(["a"]);
    expect(naming.values.get("useMemo")).toEqual(["b"]);
  });

  it("garde une place pour les appels sans affectation (useEffect)", () => {
    const naming = extractHookNames(`
      useEffect(() => {}, []);
      const [c, setC] = useState(0);
    `);
    expect(naming.values.get("useEffect")).toEqual([undefined]);
    expect(naming.values.get("useState")).toEqual(["c"]);
  });

  it("ne compte pas un hook en commentaire", () => {
    const naming = extractHookNames(`
      // const [vieux, setVieux] = useState(0);
      /* const [mort, setMort] = useState(1); */
      const [c, setC] = useState(2);
    `);
    expect(naming.values.get("useState")).toEqual(["c"]);
  });
});

describe("extractHookNames — repli conservateur", () => {
  it("renvoie un nommage vide dès que deux fonctions appellent des hooks", () => {
    const naming = extractHookNames(`
      function Parent() {
        const [todos, setTodos] = useState([]);
        return <Child onAdd={setTodos} />;
      }
      function Child({ onAdd }) {
        const [draft, setDraft] = useState("");
        return <input value={draft} />;
      }
    `);
    expect(naming.values.size).toBe(0);
    expect(naming.setters.size).toBe(0);
  });

  it("nomme quand même un composant unique contenant des handlers fléchés", () => {
    // Les handlers en minuscule ne scindent pas le composant : sinon un hook
    // déclaré APRÈS un handler ferait basculer à tort dans le repli.
    const naming = extractHookNames(`
      function Demo() {
        const [a, setA] = useState(0);
        const onClick = () => setA(a + 1);
        const [b, setB] = useState("x");
        return <button onClick={onClick}>{a}{b}</button>;
      }
    `);
    expect(naming.values.get("useState")).toEqual(["a", "b"]);
  });

  it("renvoie un nommage vide sur un code sans hook", () => {
    const naming = extractHookNames(`return <p>bonjour</p>;`);
    expect(naming.values.size).toBe(0);
  });
});
