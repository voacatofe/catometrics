"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function AdminDashboardsPage() {
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
        <AdminHeader title="Gerenciar Dashboards" />
        <div className="p-4 text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Gerenciar Dashboards" />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
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
                    <th className="text-left p-2">Time</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">URL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Dashboard de Marketing</td>
                    <td className="p-2">Time de Marketing</td>
                    <td className="p-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                    <td className="p-2">
                      <a 
                        href="#" 
                        className="text-blue-600 hover:underline"
                      >
                        https://app.exemplo.com/dashboard/marketing
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Dashboard de Vendas</td>
                    <td className="p-2">Time de Vendas</td>
                    <td className="p-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                    <td className="p-2">
                      <a 
                        href="#" 
                        className="text-blue-600 hover:underline"
                      >
                        https://app.exemplo.com/dashboard/vendas
                      </a>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Dashboard de Operações</td>
                    <td className="p-2">Time de Operações</td>
                    <td className="p-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inativo
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="text-gray-500">Indisponível</span>
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