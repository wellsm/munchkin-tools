import { Link } from 'react-router-dom'
import { GAMES } from '@/games/registry'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border p-4">
        <h1 className="text-3xl font-bold">Game Tools</h1>
        <p className="text-muted-foreground text-base">Ferramentas auxiliares para jogos de mesa.</p>
      </header>
      <main className="p-4 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {GAMES.map((game) => {
          const Icon = game.icon

          return (
            <Link key={game.id} to={game.path} className="block">
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Icon className="size-10 text-primary" aria-hidden />
                  <div>
                    <CardTitle>{game.name}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          )
        })}
      </main>
    </div>
  )
}
