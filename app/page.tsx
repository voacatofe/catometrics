import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link 
              href="/" 
              className="mr-6 flex items-center space-x-2"
            >
              <span className="font-bold text-xl">CatoMetrics</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/features" className="transition-colors hover:text-foreground/80">
                Recursos
              </Link>
              <Link href="/pricing" className="transition-colors hover:text-foreground/80">
                Preços
              </Link>
              <Link href="/about" className="transition-colors hover:text-foreground/80">
                Sobre
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center">
              <Link href="/login">
                <Button variant="ghost" className="mr-2">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button>Criar Conta</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Dashboards de métricas simplificados para o seu negócio
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Visualize suas métricas de mídia e vendas em tempo real. Compartilhe com seu time e tome decisões baseadas em dados.
            </p>
            <div className="space-x-4">
              <Link href="/register">
                <Button size="lg" className="px-8">Começar Agora</Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg">
                  Saiba Mais
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              Simplifique a análise dos seus dados
            </h2>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Acesse relatórios personalizados, compartilhe insights com sua equipe e transforme dados em decisões estratégicas.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="space-y-2">
                <h3 className="font-bold">Dashboards Personalizados</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize seus dados de forma personalizada e adaptada ao seu negócio.
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="space-y-2">
                <h3 className="font-bold">Gerenciamento de Times</h3>
                <p className="text-sm text-muted-foreground">
                  Compartilhe dashboards com sua equipe e defina permissões de acesso.
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-6">
              <div className="space-y-2">
                <h3 className="font-bold">Tomada de Decisão</h3>
                <p className="text-sm text-muted-foreground">
                  Utilize dados em tempo real para tomar decisões estratégicas fundamentadas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} CatoMetrics. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Termos
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
} 