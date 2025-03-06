import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link href="/" className="flex items-center">
          <span className="font-bold text-xl">CatoMetrics</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center py-12">
        <main className="w-full max-w-md mx-auto px-4 sm:px-6">
          {children}
        </main>
      </div>
      <div className="py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} CatoMetrics. Todos os direitos reservados.
      </div>
    </div>
  )
} 