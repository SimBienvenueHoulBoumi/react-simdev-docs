import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { NavigationProgress } from "./components/layout/navigation-progress";
import { engineFromCookie, StyleEngineProvider } from "./lib/style-engine";
import { MuiThemeProvider } from "./lib/mui-theme";
import "./app.css";

// Le moteur de style est lu ICI, côté serveur, pour que le HTML parte déjà dans
// la bonne implémentation. Sans ça la page peignait en Tailwind puis se
// re-skinnait en MUI après hydratation (mesuré : ~55 ms, sur chaque page).
export function loader({ request }: Route.LoaderArgs) {
  return {
    engine: engineFromCookie(request.headers.get("Cookie")) ?? ("tailwind" as const),
  };
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;500;600&display=swap",
  },
];

// Applique le thème avant le premier paint pour éviter le flash clair/sombre.
// Le SSR émet .dark par défaut ; on retire la classe si l'utilisateur veut clair.
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem("theme");
    var dark = t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
  try {
    // Migration : le moteur vivait dans localStorage, le serveur ne peut pas le
    // lire. On le recopie une fois dans le cookie ; dès le chargement suivant le
    // SSR rend la bonne implémentation et le re-skin disparaît définitivement.
    if (!/(?:^|;\s*)foundry-engine=/.test(document.cookie)) {
      var e = localStorage.getItem("foundry-engine");
      if (e === "mui" || e === "tailwind") {
        document.cookie = "foundry-engine=" + e + ";path=/;max-age=31536000;samesite=lax";
      }
    }
  } catch (e) {}
})();
`;

export function Layout({ children }: { children: React.ReactNode }) {
  // suppressHydrationWarning : la classe dark est pilotée par le script
  // anti-flash avant l'hydration, React ne doit pas la réconcilier.
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <StyleEngineProvider initialEngine={loaderData.engine}>
      <MuiThemeProvider>
        {/* Indicateur global : toute navigation qui dépasse le seuil se voit */}
        <NavigationProgress />
        <Outlet />
      </MuiThemeProvider>
    </StyleEngineProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "Une erreur inattendue est survenue.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Erreur";
    details =
      error.status === 404
        ? "La page demandée est introuvable."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1 className="text-2xl font-bold">{message}</h1>
      <p className="text-muted-foreground">{details}</p>
      {stack && (
        <pre className="code-scroll w-full overflow-x-auto rounded-lg border bg-muted p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}