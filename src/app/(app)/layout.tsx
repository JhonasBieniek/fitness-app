import { BottomNav } from '@/shared/ui/bottom-nav'

/**
 * Casca da área autenticada. Largura travada em `max-w-md` porque o app é feito
 * para o celular: esticar as listas em um monitor largo não melhora nada e só
 * afasta o conteúdo do canto onde a pessoa está olhando.
 *
 * O layout não lê a sessão de propósito. Um `await` no topo daqui segura o
 * `{children}` inteiro: a página só começava a buscar os dados dela depois de
 * uma ida ao Supabase que o proxy já tinha feito no mesmo request. Quem barra
 * acesso anônimo é o proxy, e quem decide o que cada pessoa enxerga é a RLS,
 * dentro do Postgres — nenhum dos dois depende desta checagem.
 */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">{children}</div>
      <BottomNav />
    </div>
  )
}
