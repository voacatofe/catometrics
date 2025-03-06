import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-xl font-semibold mb-4">Bem-vindo, {session?.user?.name}!</h2>
        <p className="text-muted-foreground mb-6">
          Este é o seu dashboard de métricas. Aqui você pode visualizar e analisar seus dados.
        </p>
        <div className="aspect-video w-full rounded-lg border overflow-hidden">
          <iframe
            src={process.env.LOOKER_STUDIO_URL || "https://lookerstudio.google.com/embed/reporting/placeholder"}
            className="w-full h-full"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  )
} 