import { redirect } from 'next/navigation'

/** O treino é a tela principal: é o que se abre dentro da academia. */
export default function HomePage() {
  redirect('/treino')
}
