// Pourquoi : page d'accueil — le portail vers le catalogue et l'app.
// Simple : pas de contenu propre, deux portes.

import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export function meta() {
  return [
    { title: "react-foundry — banque de composants React" },
    { name: "description", content: "Comprenez, copiez, adaptez : la banque de composants React copiables, branchée sur vos données." },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-8 p-6">
      <header className="text-center">
        <p className="font-mono text-sm text-muted-foreground">react-foundry</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          La banque de composants React
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Comprenez le concept, copiez le code, branchez vos données. Chaque fiche
          vit sous deux habillages — Tailwind ou Material UI — pour le même contrat
          de props.
        </p>
      </header>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Le catalogue</CardTitle>
              <Badge variant="success" className="ml-auto">24 fiches</Badge>
            </div>
            <CardDescription>
              Primitives, notions, données, recettes — par intention ou par recherche.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/foundry"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Parcourir le catalogue →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>L'application</CardTitle>
            <CardDescription>
              La démo vivante : un taskmanager réel branché sur l'API mock, montrant
              loader, action, filtres par URL et confirmation de suppression.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/tasks"
              className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
            >
              Ouvrir les tâches →
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}