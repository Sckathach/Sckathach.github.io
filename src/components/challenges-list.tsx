"use client";
import { Typography, Button } from "@material-tailwind/react"

type Challenge = {
  label: string,
  link: string
}
export interface ChallengeListProps {
  excludeNum: number,
  solution: boolean,
  max_challenges: number,
  craft_url: CallableFunction
}

function createChallengeList(props: ChallengeListProps): Challenge[] {
  const { excludeNum, solution, max_challenges, craft_url } = props
  if (excludeNum < 1 || excludeNum > max_challenges) {
    throw new Error(`Number must be between 1 and ${max_challenges}`)
  }
  const challenges: Challenge[] = []

  for (let i = 1; i <= max_challenges; i++) {
    if (i !== excludeNum) {
      challenges.push({
        label: `Challenge ${i}`,
        link: craft_url(false, i.toString(), false)
      })
    }
  }
  challenges.push({
    label: solution ? `Énoncé ${excludeNum}` : `Solution ${excludeNum}`,
    link: craft_url(false, excludeNum.toString(), !solution)
  })
  return challenges
}

export function ChallengesList(props: ChallengeListProps)  {
  const challenges = createChallengeList(props)
  const button: Challenge = challenges.pop()! 
  return (
    <div className="px-8">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-y-4 border-t border-gray-200 py-6 md:justify-between">
          <Button color="light-green"><a href={button.link}>{button.label}</a></Button>
          <ul className="flex gap-8 items-center">
            {challenges.map((chall) => (
              <li key={chall.link}>
                <Typography
                  as="a"
                  href={chall.link}
                  variant="small"
                  className="font-normal text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {chall.label}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

