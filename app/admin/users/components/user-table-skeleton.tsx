import { Skeleton } from "@/components/ui/skeleton";

export default function UserTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Nome</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Perfil</th>
            <th className="text-left p-2">Criado em</th>
            <th className="text-left p-2">Último login</th>
            <th className="text-left p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">
                <Skeleton className="h-5 w-32" />
              </td>
              <td className="p-2">
                <Skeleton className="h-5 w-48" />
              </td>
              <td className="p-2">
                <Skeleton className="h-5 w-16" />
              </td>
              <td className="p-2">
                <Skeleton className="h-5 w-24" />
              </td>
              <td className="p-2">
                <Skeleton className="h-5 w-24" />
              </td>
              <td className="p-2">
                <Skeleton className="h-5 w-24" />
              </td>
              <td className="p-2">
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 