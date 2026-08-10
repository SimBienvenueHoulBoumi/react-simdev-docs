// Pourquoi : colorateur syntaxique minimaliste, côté client ET serveur (pur, aucun DOM).
// Volontairement frugal : commentaires, chaînes, mots-clés — assez pour la lisibilité.
// Hors v1 : coloration dans l'éditeur (textarea monospace, spec §7).

interface Token {
  type: "text" | "comment" | "string" | "keyword" | "punctuation";
  value: string;
}

const KEYWORDS = new Set([
  "import", "export", "from", "return", "function", "const", "let", "var",
  "if", "else", "for", "while", "async", "await", "new", "typeof", "interface",
  "type", "extends", "as", "switch", "case", "default", "break", "continue",
  "try", "catch", "throw", "null", "undefined", "true", "false", "this",
  "class", "in", "of", "using", "yield", "void", "delete", "instanceof",
]);

function scan(value: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = value.length;

  const push = (type: Token["type"], start: number, end: number) => {
    const text = value.slice(start, end);
    if (type === "text" && KEYWORDS.has(text)) {
      tokens.push({ type: "keyword", value: text });
    } else {
      tokens.push({ type, value: text });
    }
  };

  while (i < n) {
    const ch = value[i];
    const next = value[i + 1];

    // Commentaire sur une ligne
    if (ch === "/" && next === "/") {
      let end = value.indexOf("\n", i);
      if (end === -1) end = n;
      push("comment", i, end);
      i = end;
      continue;
    }
    // Commentaire bloc
    if (ch === "/" && next === "*") {
      let end = value.indexOf("*/", i + 2);
      if (end === -1) end = n;
      else end += 2;
      push("comment", i, end);
      i = end;
      continue;
    }
    // Chaîne simple
    if (ch === '"' || ch === "'" || ch === "`") {
      let end = i + 1;
      let escaped = false;
      while (end < n) {
        const c = value[end];
        if (c === "\\" && !escaped) {
          escaped = true;
          end++;
          continue;
        }
        if (c === ch && !escaped) {
          end++;
          break;
        }
        if (ch === "`" && c === "\n") break; // template non fermé
        escaped = false;
        end++;
      }
      push("string", i, end);
      i = end;
      continue;
    }
    // Mot : mots-clés (meilleure précision sur les identifiants)
    if (/[A-Za-z_$]/.test(ch)) {
      let end = i + 1;
      while (end < n && /[A-Za-z0-9_$]/.test(value[end])) end++;
      push("text", i, end);
      i = end;
      continue;
    }
    // Ponctuation courante
    if ("{}()[]<>;,.=+-*/%&|!:?@#".includes(ch)) {
      push("punctuation", i, i + 1);
      i++;
      continue;
    }
    push("text", i, i + 1);
    i++;
  }
  return tokens;
}

// Rendu en HTML (utilisé par le CodeBlock). Ne touche jamais au DOM directement.
export function highlightToHtml(code: string): string {
  return scan(code)
    .map((t) => {
      switch (t.type) {
        case "comment":
          return `<span class="text-muted-foreground/70 italic">${escapeHtml(t.value)}</span>`;
        case "string":
          return `<span class="text-emerald-600 dark:text-emerald-400">${escapeHtml(t.value)}</span>`;
        case "keyword":
          return `<span class="text-purple-600 dark:text-purple-400 font-medium">${escapeHtml(t.value)}</span>`;
        case "punctuation":
          return `<span class="text-muted-foreground">${escapeHtml(t.value)}</span>`;
        default:
          return escapeHtml(t.value);
      }
    })
    .join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}