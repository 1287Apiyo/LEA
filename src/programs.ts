export type CurriculumProgram = {
  number: string;
  title: string;
  label: string;
  text: string;
  image: string;
  alt: string;
};

export const curriculumPrograms: CurriculumProgram[] = [
  {
    number: "01",
    title: "Scratch Programming",
    label: "Creative first code",
    text: "Learners build games, stories, and animations while practicing logic, sequencing, loops, and confidence.",
    image: "images/programs/scratch.jpg",
    alt: "LEA learners in a computer lab during a programming session",
  },
  {
    number: "02",
    title: "Web Development",
    label: "Sites and interfaces",
    text: "Students learn how pages are structured, styled, tested, and improved with practical HTML, CSS, and JavaScript projects.",
    image: "images/programs/web-development.jpg",
    alt: "Learners working on web development activities",
  },
  {
    number: "03",
    title: "App Programming",
    label: "From idea to prototype",
    text: "Learners turn everyday problems into simple app flows, screens, features, and working prototypes they can explain.",
    image: "images/programs/app-programming.jpg",
    alt: "Students coding during an app programming session",
  },
  {
    number: "04",
    title: "Hackathons",
    label: "Team problem solving",
    text: "Focused build days help learners collaborate, present ideas, receive feedback, and experience real project momentum.",
    image: "images/programs/hackathons.jpg",
    alt: "LEA hackathon participants collaborating",
  },
];
