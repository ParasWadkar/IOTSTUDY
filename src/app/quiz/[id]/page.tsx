import { notFound } from 'next/navigation';
import Quiz from '@/components/Quiz';
import { modeIds } from '@/lib/data';

export function generateStaticParams() {
  return modeIds.map((id) => ({ id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!modeIds.includes(id)) notFound();
  return <Quiz id={id} />;
}
