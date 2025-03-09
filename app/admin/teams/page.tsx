"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function AdminTeamsPage() {
  const [loading, setLoading] = useState(true);

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <AdminHeader title="Gerenciar Times" />
        <div className="p-4 text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Gerenciar Times" />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Times</CardTitle>
            <CardDescription>Componente do lado do cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <h3 className="text-blue-800 font-semibold mb-2">Modo Cliente</h3>
              <p className="text-blue-700">
                Esta página agora é renderizada inteiramente no cliente para evitar problemas de serialização.
                Os dados são estáticos apenas para fins de demonstração.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nome</th>
                    <th className="text-left p-2">Descrição</th>
                    <th className="text-left p-2">Membros</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Time de Marketing</td>
                    <td className="p-2">Equipe responsável por campanhas de marketing</td>
                    <td className="p-2">8</td>
                    <td className="p-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Time de Vendas</td>
                    <td className="p-2">Equipe responsável por vendas e relacionamento</td>
                    <td className="p-2">12</td>
                    <td className="p-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Time de Desenvolvimento</td>
                    <td className="p-2">Equipe de engenharia e desenvolvimento</td>
                    <td className="p-2">15</td>
                    <td className="p-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 