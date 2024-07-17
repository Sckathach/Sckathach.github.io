"use client";
import { useSearchParams } from 'next/navigation';

export default function Index() {
  const searchParams = useSearchParams()
  const item = searchParams.get('item')

  return(
    <>
    <h1>{item}</h1>
    </>
  )
}
