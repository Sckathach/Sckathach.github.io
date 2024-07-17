import { Navbar } from "@/components";
import Iframe from 'react-iframe'

export default function Challenge() {
  return (
    <>
      <Navbar />
      <Iframe url="./../../404ctf-public/quantum-challenges/challenge_4-english-version.html"
        width="100%"
        height="6100"
      />
    </>
  );
}
