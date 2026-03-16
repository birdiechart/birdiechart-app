import { redirect } from 'next/navigation'

export default async function JoinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/signup?club=${slug}`)
}
