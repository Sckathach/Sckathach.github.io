"use client";
import Iframe from 'react-iframe'
import { useSearchParams } from 'next/navigation'

import { Navbar } from '@/components'
import { ChallengesList, ChallengeListProps } from '@/components/challenges-list'

function craft_url(pub: boolean, id: string, solution: boolean): string {
  if (pub) {
    return solution ? 
      `./../../404ctf-public/quantum-challenges/challenge_${id}_solution.html` :
      `./../../404ctf-public/quantum-challenges/challenge_${id}.html`
  } else {
    return solution ?
      `/404ctf/quantum-challenges?challenge=${id}&solution=true` :
      `/404ctf/quantum-challenges?challenge=${id}` 
  }
}

export default function Challenge() {
  const params = useSearchParams()
  const id: string = params.get('challenge') ?? '1'
  const solution: boolean = params.get('solution') !== null
  const url: string = craft_url(true, id, solution)

  const props: ChallengeListProps = {
    excludeNum: parseInt(id as string),
    solution: solution,
    max_challenges: 4,
    craft_url: craft_url
  }

  return (
    <>
      <Navbar />
      <ChallengesList {...props} /> 
      <Iframe url={url}
        width="100%"
        height="1500"
      />
    </>
  );
}
