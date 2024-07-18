"use client";
import { useSearchParams } from 'next/navigation';

export default function Index() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const solution = searchParams.get('solution')

  const validId = id && parseInt(id as string) >= 1 && parseInt(id as string) <= 4 
  const iframeUrl = solution ? `./about/challenge_${validId}_solution` : `./about/challenge_${validId}.html`

  return(
    <>
    <h1>{iframeUrl}</h1>
    </>
  )
}
