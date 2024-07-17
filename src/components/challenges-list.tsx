"use client";
import { Typography, Button } from "@material-tailwind/react"

interface ChallengeItem {
  label: string,
  link: string
}
interface ChallengeItemList {
  challenges: ChallengeItem[]
}

export function ChallengesList({ challenges }: ChallengeItemList)  {
  return (
    <div className="px-8">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-y-4 border-t border-gray-200 py-6 md:justify-between">
          <Button color="light-green">Solution</Button>
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

