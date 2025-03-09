"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  email: z.string().email({
    message: "Digite um e-mail válido.",
  }),
  password: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
})

// Componente para a parte que usa useSearchParams
function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const error = searchParams.get("error")

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro de autenticação",
        description: "E-mail ou senha inválidos. Tente novamente.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      console.log("Iniciando tentativa de login:", values.email);
      
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      })

      setIsLoading(false)
      
      console.log("Resposta do login:", res);

      if (!res?.error) {
        console.log("Login bem-sucedido, redirecionando para:", callbackUrl);
        router.push(callbackUrl)
        router.refresh()
      } else {
        console.error("Erro no login:", res.error);
        toast({
          title: "Erro de autenticação",
          description: `Falha no login: ${res.error}. Tente novamente.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Exceção durante login:", error);
      setIsLoading(false)
      toast({
        title: "Algo deu errado",
        description: `Ocorreu um erro ao fazer login: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente mais tarde.`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="nome@empresa.com" 
                    {...field} 
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="******" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Esconder senha" : "Mostrar senha"}
                    </span>
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        <Link
          href="/reset-password"
          className="underline underline-offset-4 hover:text-primary"
        >
          Esqueceu sua senha?
        </Link>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou
          </span>
        </div>
      </div>
      <div className="text-center text-sm">
        Não tem uma conta?{" "}
        <Link
          href="/register"
          className="underline underline-offset-4 hover:text-primary"
        >
          Registre-se
        </Link>
      </div>
    </div>
  );
}

// Componente de fallback para o Suspense
function LoginFormFallback() {
  return (
    <div className="grid gap-6">
      <div className="animate-pulse space-y-4">
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>
      <div className="text-center text-sm animate-pulse">
        <div className="h-4 w-32 mx-auto rounded bg-gray-200"></div>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
      </div>
      <div className="text-center text-sm animate-pulse">
        <div className="h-4 w-48 mx-auto rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bem-vindo ao CatoMetrics
        </h1>
        <p className="text-sm text-muted-foreground">
          Entre com seus dados para acessar o dashboard
        </p>
      </div>

      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  )
} 