import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Sem isso o Turbopack sobe um nível procurando lockfile e acha um
  // package-lock.json de fora do repositório.
  turbopack: {
    root: import.meta.dirname,
  },
  typedRoutes: true,
  experimental: {
    /*
     * Por quanto tempo o roteador reaproveita a resposta de uma rota já
     * visitada, em segundos.
     *
     * São três telas fixas, com poucos quilobytes cada, e o conteúdo — o plano
     * de treino e o cardápio — não muda no meio do dia. O padrão do Next é
     * descartar a resposta na hora, o que transforma toda ida e volta entre as
     * abas em uma consulta nova ao banco.
     *
     * O que muda durante o uso continua correto: as ações de servidor invalidam
     * o que guardaram, e o que foi marcado no treino em andamento tem dono no
     * cliente.
     */
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },

  /*
   * O que está em `public/` sai com `max-age=0` por padrão, e o navegador
   * revalida a cada uso. Como o manifesto e o ícone são reemitidos no cabeçalho
   * a cada troca de tela, isso custava duas idas à rede por navegação — em rede
   * móvel, o suficiente para a troca parecer travada.
   *
   * As fotos dos exercícios e os ícones são conteúdo fixo, endereçado pelo
   * nome: um dia de cache para o que pode ser redesenhado, uma semana para as
   * fotos, que só mudam quando o exercício muda.
   */
  async headers() {
    return [
      {
        source: '/exercicios/:caminho*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, must-revalidate' }],
      },
      {
        source: '/icones/:caminho*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' }],
      },
      {
        source: '/manifest.webmanifest',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' }],
      },
    ]
  },
}

export default nextConfig
