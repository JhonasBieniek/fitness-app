/**
 * Esqueleto das rotas autenticadas.
 *
 * As duas rotas são dinâmicas por natureza — o que aparece depende da hora —,
 * então a troca sempre custa uma ida ao servidor. Sem isto a tela anterior
 * ficava congelada até a resposta chegar, e o toque no menu parecia ignorado.
 * O esqueleto tem a forma de um cabeçalho, uma faixa e uma lista, que é o
 * desenho das duas rotas: o conteúdo entra no lugar onde o bloco já estava.
 */
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Carregando" className="flex flex-1 flex-col pb-6">
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <Bone className="size-7 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Bone className="h-3 w-28" />
          <Bone className="h-3 w-20" />
        </div>
      </div>

      <div className="px-4 pb-3">
        <Bone className="h-3 w-full" />
      </div>

      <div className="border-line flex gap-4 border-b px-4 pb-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-1.5">
            <Bone className="h-2.5 w-8" />
            <Bone className="h-3.5 w-24" />
          </div>
        ))}
      </div>

      <ul className="mt-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <li key={index} className="border-line flex gap-3 border-b px-4 py-3.5 last:border-b-0">
            <Bone className="size-14 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2 pt-1">
              <Bone className="h-3.5 w-2/3" />
              <Bone className="h-3 w-1/3" />
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

/**
 * O pulso é discreto de propósito: um brilho corrido chamaria mais atenção que
 * o conteúdo que está chegando. Some para quem pediu menos movimento.
 */
function Bone({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={`bg-surface-2 animate-pulse rounded motion-reduce:animate-none ${className}`}
    />
  )
}
