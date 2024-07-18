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
const DEFAULT_URL = '/404ctf/ai-challenges?challenge='
const DEFAULT_PUBLIC_URL = './../../404ctf-public/ai-challenges/challenge_'

function createChallengeList(excludeNum: number, solution: boolean): Challenge[] {
  if (excludeNum < 1 || excludeNum > MAX_CHALLENGE) {
    throw new Error(`Number must be between 1 and ${MAX_CHALLENGE}`)
  }
  const challenges: Challenge[] = []

  for (let i = 1; i <= MAX_CHALLENGE; i++) {
    if (i !== excludeNum) {
      challenges.push({
        label: `Challenge ${i}`,
        link: `${DEFAULT_URL}${i}`
      })
    }
  }
  if (solution) {
    challenges.push({
      label: `Énoncé ${excludeNum}`,
      link: `${DEFAULT_URL}${excludeNum}`
    })
  } else {
    challenges.push({
      label: `Solution ${excludeNum}`,
      link: `${DEFAULT_URL}${excludeNum}&solution=true`
    })
  }
  return challenges
}

export default function Challenge() {
  const params = useSearchParams()
  const id: string = params.get('challenge') ?? '1'
  const solution: boolean = params.get('solution') !== null

  const url = solution ? 
    `${DEFAULT_PUBLIC_URL}${id}_solution.html` : 
    `${DEFAULT_PUBLIC_URL}${id}.html`  
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
