"use client";
import Iframe from 'react-iframe'
import { useSearchParams } from 'next/navigation'

import { Navbar } from '@/components'
import { ChallengesList } from '@/components/challenges-list'

type Challenge = {
  label: string,
  link: string
}
const MAX_CHALLENGE = 4

function craft_url(pub: boolean, id: string, solution: boolean): string {
  if (pub) {
    return solution ? 
      `./../../404ctf-public/ai-challenges/challenge_${id}_solution.html` :
      `./../../404ctf-public/ai-challenges/challenge_${id}.html`
  } else {
    return solution ?
      `/404ctf/ai-challenges?challenge=${id}` :
      `/404ctf/ai-challenges?challenge=${id}&solution=true` 
  }
}

function createChallengeList(excludeNum: number, solution: boolean): Challenge[] {
  if (excludeNum < 1 || excludeNum > MAX_CHALLENGE) {
    throw new Error(`Number must be between 1 and ${MAX_CHALLENGE}`)
  }
  const challenges: Challenge[] = []

  for (let i = 1; i <= MAX_CHALLENGE; i++) {
    if (i !== excludeNum) {
      challenges.push({
        label: `Challenge ${i}`,
        link: craft_url(false, i.toString(), solution)
      })
    }
  }
  challenges.push({
    label: solution ? `Solution ${excludeNum}` : `Énoncé ${excludeNum}`,
    link: craft_url(false, excludeNum.toString(), solution)
  })
  return challenges
}

export default function Challenge() {
  const params = useSearchParams()
  const id: string = params.get('challenge') ?? '1'
  const solution: boolean = params.get('solution') !== null

  const url = craft_url(true, id, solution)
  const challenges = createChallengeList(parseInt(id as string), solution)

  return (
    <>
      <Navbar />
      <ChallengesList challenges={challenges} /> 
      <Iframe url={url}
        width="100%"
        height="1500"
      />
    </>
  );
}
