import { BottomNav } from '@/shared/ui/bottom-nav'

/**
 * Casca da área autenticada. Largura travada em `max-w-md` porque o app é feito
 * para o celular: esticar as listas em um monitor largo não melhora nada e só
 * afasta o conteúdo do canto onde a pessoa está olhando.
 *
 * A casca tem altura fixa (`h-[100dvh]`) e não rola: quem rola é o `main` de
 * cada página, sozinho, dentro dela. É o padrão de app instalado — sem ele, no
 * PWA do iPhone (`viewport-fit: cover` + área do indicador de home) o próprio
 * documento ganha uma rolagem-fantasma que não termina, e a barra de baixo, por
 * ser `sticky`, acaba sobre os últimos itens da lista e rouba o toque deles.
 * Aqui a barra é um irmão do conteúdo, fora da rolagem: sempre visível, nunca
 * por cima. O `min-h-0` é o que deixa o `main` encolher e rolar de verdade — sem
 * ele, um filho de flex nunca fica menor que o próprio conteúdo.
 *
 * O avesso disso morde os filhos do `main`: um filho com `overflow` diferente
 * de `visible` (ex.: o `overflow-hidden` dos cantos arredondados) perde esse
 * piso e é espremido em vez de transbordar — some conteúdo e o `main` não rola,
 * porque para ele tudo coube. Por isso o `main` em coluna leva `*:shrink-0`.
 *
 * O layout não lê a sessão de propósito. Um `await` no topo daqui segura o
 * `{children}` inteiro: a página só começava a buscar os dados dela depois de
 * uma ida ao Supabase que o proxy já tinha feito no mesmo request. Quem barra
 * acesso anônimo é o proxy, e quem decide o que cada pessoa enxerga é a RLS,
 * dentro do Postgres — nenhum dos dois depende desta checagem.
 */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col overflow-hidden">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
