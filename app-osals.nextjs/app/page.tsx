import { redirect } from 'next/navigation'

export default function HomePage() {
  // Raiz redireciona ao dashboard (proxy.ts envia ao /login se nao autenticado).
  redirect('/dashboard')
}
