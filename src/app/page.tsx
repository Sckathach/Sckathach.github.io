"use client";
import { Navbar, Footer } from "@/components";
import { IconButton, Typography } from "@material-tailwind/react";

function Hero() {
  return (
    <div className="relative w-full">
      <div className="grid place-items-center min-h-[92vh] px-8">
        <div className="container mx-auto grid place-items-start h-max">
          <Typography variant="h1" color="blue-gray">
            <div className="potra">
              Le magicien quantique
            </div>
          </Typography>
          <Typography
            variant="lead"
            color="gray"
            className="mt-4 mb-12 w-full md:max-w-full lg:max-w-4xl"
          >
          Aka <i>le chameau masqué, le fan2thermo, le crabe sacré, l&apos;ingénieur tuyaux, le chef d&apos;orchestre de baleines</i>, or just <b>Sckathach</b>. I&apos;m a french student at Télécom SudParis, and soon, a ML researcher!
          </Typography>
          <Typography className="mt-12 mb-4 text-blue-gray-900 font-medium uppercase">
            Connect me on:
          </Typography>
          <div className="gap-2 lg:flex">
            <a href="https://www.linkedin.com/in/thomas-winninger/">
              <IconButton variant="text" color="gray">
                <i className="fa-brands fa-linkedin text-lg" />
              </IconButton>
            </a>
            <a href="https://github.com/Sckathach">
              <IconButton variant="text" color="gray">
                <i className="fa-brands fa-github text-lg" />
              </IconButton>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <>
      <Navbar />
      <Hero />
      <Footer />
    </>
  );
}
