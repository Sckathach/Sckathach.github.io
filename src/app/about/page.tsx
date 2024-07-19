"use client";
import React from "react";
import { Typography } from "@material-tailwind/react";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  FireIcon,
} from "@heroicons/react/24/solid";
import { InfoCard, color } from "@/components/info-card";
import { Navbar } from "@/components";


const TRAD_EDUCATION = [
  {
    icon: AcademicCapIcon,
    title: "Master of Science in Cybersecurity - Institut Polytechnique de Paris",
    date: "2026",
    children: ""
  },
  {
    icon: AcademicCapIcon,
    title: "Engineering Degree - Télécom SudParis",
    date: "2026",
    children: ""
  },
  {
    icon: AcademicCapIcon,
    title: "Classe préparatoire MP* - Lycée Kleber",
    date: "2022",
    children: ""
  }
];

const PERSO_EDUCATION = [
  {
    icon: AcademicCapIcon,
    title: "Deep Learning Specialization - Coursera",
    date: "2023",
    children: ""
  },
  {
    icon: AcademicCapIcon,
    title: "Quantum Courses - IBM Quantum Learning",
    date: "2023 - PRESENT",
    children: "Basics of Quantum Information, Fundamentals of Quantum Algorithms, Practical Introduction to Quantum-Safe Cryptography"
  },
  {
    icon: AcademicCapIcon,
    title: "Certified Kubernetes Administrator - Udemy",
    date: "2023",
    children: ""
  },
  {
    icon: AcademicCapIcon,
    title: "Pytorch Geometric tutorial - Pytorch Geometric",
    date: "2024 - PRESENT",
    children: "Fantastic course from Antonio Longa."
  }
]

const EXPERIENCE = [
  {
    icon: BriefcaseIcon,
    title: "Research Internship in AI Security - Thales",
    date: "2024 - PRESENT",
    children: ""
  }
];

const SKILLS = [
  {
    icon: FireIcon,
    title: "Ninja",
    date: "Technical Skills",
    children: "very good at ninjaing people",
    bgcolor: color.PrimaryHigh 
  }
];

function InformationSection() {
  return (
    <section className="pb-28 px-8">
      <div className="grid xl:grid-cols-2 md:grid-cols-1 container gap-20 mx-auto items-start">
        <div>
          <div className="mb-10">
            <Typography color="blue-gray" className="mb-2 text-3xl font-bold">
              (Traditional) Education
            </Typography>
          </div>
          <div className="container mx-auto grid grid-cols-1 gap-16 gap-y-12">
            {TRAD_EDUCATION.map((props, idx) => (
              <InfoCard key={idx} {...props} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-10">
            <Typography color="blue-gray" className="mb-2 text-3xl font-bold">
              (Personal) Education
            </Typography>
          </div>
          <div className="container mx-auto grid grid-cols-1 gap-16 gap-y-12">
            {PERSO_EDUCATION.map((props, idx) => (
              <InfoCard key={idx} {...props} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-10">
            <Typography color="blue-gray" className="mb-2 text-3xl font-bold">
              Experience
            </Typography>
            <Typography variant="lead" className="!text-gray-500">
              See my experience as a developer.
            </Typography>
          </div>
          <div className="container mx-auto grid grid-cols-1 gap-16 gap-y-12">
            {EXPERIENCE.map((props, idx) => (
              <InfoCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </div>
      <div className="container gap-20 mt-36 mx-auto items-center">
        <div>
          <div className="mb-10">
            <Typography color="blue-gray" className="mb-2 text-3xl font-bold">
              Skills
            </Typography>
            <Typography variant="lead" className="!text-gray-500">
              Check out my technical and soft skills.
            </Typography>
          </div>
          <div className="container mx-auto grid grid-cols-1 gap-16 gap-y-12 lg:grid-cols-2">
            {SKILLS.map((props, idx) => (
              <InfoCard key={idx} {...props} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <>
      <Navbar />
      <InformationSection />
    </>
  );
}
