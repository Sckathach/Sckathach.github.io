import { Navbar } from "@/components";
import Iframe from 'react-iframe'
import { ChallengesList } from "@/components/challenges-list"

const CHALLENGES = [
  { label: "Challenge 1", link: "/404ctf/ai-challenges/challenge-1" },
  { label: "Challenge 2", link: "/404ctf/ai-challenges/challenge-2" },
  { label: "Challenge 4", link: "/404ctf/ai-challenges/challenge-4" },
]

export default function Challenge() {
  return (
    <>
      <Navbar />
      <ChallengesList challenges={CHALLENGES} /> 
      <Iframe url="./../../404ctf-public/ai-challenges/challenge_3.html"
        width="100%"
        height="2500"
      />
    </>
  );
}
