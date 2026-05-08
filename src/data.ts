export type PageId = "home" | "about" | "programs" | "projects" | "events" | "volunteer" | "donate" | "contact";

export type NavItem = {
  id: PageId;
  label: string;
  href: string;
};

export type Stat = {
  value: number;
  suffix?: string;
  label: string;
};

export type Card = {
  title: string;
  text: string;
  image: string;
  alt: string;
  href?: string;
};

export type Program = {
  title: string;
  label: string;
  image: string;
  alt: string;
  paragraphs: string[];
};

export type Person = {
  name: string;
  role: string;
  image: string;
};

export type EventItem = {
  date: string;
  title: string;
  text: string;
  image: string;
  visuals?: string;
};

export const navItems: NavItem[] = [
  { id: "about", label: "About", href: "/about" },
  { id: "programs", label: "Our Programs", href: "/programs" },
  { id: "projects", label: "Projects", href: "/projects" },
  { id: "events", label: "Events", href: "/events" },
  { id: "volunteer", label: "Volunteer", href: "/volunteer" },
  { id: "contact", label: "Contact", href: "/contact" },
];

export const stats: Stat[] = [
  { value: 1, suffix: "+", label: "Years of Experience" },
  { value: 35, suffix: "+", label: "Active Volunteers" },
  { value: 47, label: "Available Counties" },
  { value: 200, suffix: "+", label: "Young Coders Trained" },
];

export const homeCards: Card[] = [
  {
    title: "What We Do",
    text: "We open doors to technology for young learners aged 9 to 18 through practical coding, mentorship, and digital literacy.",
    image: "images/LEA pics/LEA-2.jpg",
    alt: "Young learners in a LEA technology session",
    href: "/projects",
  },
  {
    title: "Give Donation",
    text: "Your support fuels learning resources, devices, sessions, and opportunities for children who lack access.",
    image: "images/LEA pics/LEA-24.jpg",
    alt: "LEA learners sharing ideas",
    href: "/donate",
  },
  {
    title: "Become a Volunteer",
    text: "Mentor, teach, encourage, and help young minds discover what they can create with technology.",
    image: "images/LEA pics/LEA-29.jpg",
    alt: "Volunteer mentoring a young learner",
    href: "/volunteer#sign-up",
  },
];

export const programs: Program[] = [
  {
    title: "Mogra Children's Rescue Centre",
    label: "Rescue Centre",
    image: "images/M1.jpeg",
    alt: "Children at Mogra Children's Rescue Centre during a LEA activity",
    paragraphs: [
      "Mogra Children's Rescue Centre is a sanctuary for vulnerable children, offering safety, education, healthcare, and support.",
      "LEA teaches here because technology can open greater possibilities in such a nurturing space.",
    ],
  },
  {
    title: "Highway Senior School",
    label: "School Program",
    image: "images/LEA - HIGHWAY-1.jpg",
    alt: "Highway Senior School coding session",
    paragraphs: [
      "Highway Senior School focuses on academic excellence, holistic development, discipline, and shaping future leaders.",
      "Digital literacy strengthens an ambitious learning environment and prepares students for a rapidly evolving digital world.",
    ],
  },
  {
    title: "Mukuru Slums Development Project",
    label: "Community Project",
    image: "images/LEA pics/coding3.jpg",
    alt: "Learners coding during an MSDP session",
    paragraphs: [
      "MSDP supports children, youth, and women in informal settlements through education, protection, and economic opportunities.",
      "By bringing coding to MSDP, LEA helps young people see that their background does not limit their future.",
    ],
  },
];

export const team: Person[] = [
  { name: "Anne Apiyo", role: "Chairperson, Software Developer", image: "images/team/Apiyo.png" },
  { name: "Felistus Kioko", role: "Assistant Chairperson, Software Developer", image: "images/team/Felly.png" },
  { name: "Taff Nyamita", role: "Secretary, Network Engineer", image: "images/team/Taff.png" },
  { name: "Eugene Ambagwa", role: "Social Media Manager, Software Developer", image: "images/team/Ambagwa.png" },
];

export const volunteers: Person[] = [
  { name: "Calvince Obuya", role: "Web Developer, Photographer", image: "images/volunteers/Calvince.jpg" },
  { name: "Benjamin Sonje", role: "Network Engineer", image: "images/volunteers/Benjamin.jpeg" },
  { name: "Beverly Boyani", role: "Network Engineer", image: "images/volunteers/Boyani.jpeg" },
  { name: "Fabian Atambo", role: "Student", image: "images/volunteers/Fabian.jpg" },
  { name: "Anne Apiyo", role: "Software Developer", image: "images/team/Apiyo.png" },
  { name: "Felistus Kioko", role: "Software Developer", image: "images/team/Felly.png" },
  { name: "Taff Nyamita", role: "Network Engineer", image: "images/team/Taff.png" },
  { name: "Eugene Ambagwa", role: "Software Developer", image: "images/team/Ambagwa.png" },
  { name: "Kelvin Ekisa", role: "Software Developer", image: "images/volunteers/Ekisa.jpeg" },
  { name: "Ezekiel Njeri", role: "Software Developer", image: "images/volunteers/Ezekiel.jpeg" },
  { name: "Michael Eleman", role: "Software Developer", image: "images/volunteers/Mike.svg" },
  { name: "Felix Kemboi", role: "Software Developer", image: "images/volunteers/Felix.png" },
  { name: "Adan Lolo", role: "Software Developer", image: "images/volunteers/Lolo.jpeg" },
  { name: "Collins Kibet", role: "Software Developer", image: "images/volunteers/Collo.jpg" },
  { name: "Cedrouseroll Omondi", role: "Software Engineer", image: "images/volunteers/Cedrouseroll-Omondi.jpg" },
  { name: "Seth Wambua", role: "Software Developer", image: "images/volunteers/Seth.jpeg" },
  { name: "Victor Soimo", role: "Software Developer", image: "images/volunteers/Soimo.jpeg" },
  { name: "Emmanuel Musolomi", role: "Software Developer", image: "images/volunteers/Musolomi.jpg" },
  { name: "Charleen Bhakita", role: "Student", image: "images/volunteers/charleen.jpg" },
  { name: "Clarence Mabeya", role: "Fintech", image: "images/volunteers/Clarence.jpeg" },
  { name: "Everlyne Njuguna", role: "Student", image: "images/volunteers/Everlyne Njuguna.jpg" },
  { name: "Moses Okode", role: "Software Developer", image: "images/volunteers/Moses-Okode.png" },
  { name: "Robi Melvin", role: "Student", image: "images/volunteers/Robi.jpeg" },
  { name: "Junechelsea Undisa", role: "Student", image: "images/volunteers/June.jpeg" },
  { name: "Joy Kasusya", role: "Network Engineer", image: "images/volunteers/kasusya.png" },
  { name: "Peter Mwangi", role: "Network Engineer", image: "images/volunteers/Peter-Mwangi.jpg" },
  { name: "Grace Mwaura", role: "Student", image: "images/volunteers/Grace-Mwaura.jpg" },
  { name: "David Musumba", role: "Student", image: "images/volunteers/David-Musumba.png" },
  { name: "James Thiong'o", role: "Student", image: "images/volunteers/James-Thiongo.jpg" },
  { name: "Tony Wangolo", role: "Student", image: "images/volunteers/Tony.jpeg" },
  { name: "Evans Osumba", role: "Web Developer", image: "images/volunteers/evans.jpg" },
  { name: "Philip Waudo", role: "Student", image: "images/volunteers/philip.jpg" },
];

export const events: EventItem[] = [
  { date: "March 28, 2026 - Nairobi", title: "March Monthly Meetup", text: "A gathering for planning, reflection, learning, and volunteer connection.", image: "images/marmeet.jpeg", visuals: "https://www.instagram.com/reel/DU6RZHyjDnl/?igsh=MXE5eXRmbGVrcjZseA==" },
  { date: "February 28, 2026 - Online", title: "February Monthly Meetup", text: "An online session to keep volunteers aligned and the mission moving.", image: "images/febmeet.jpeg", visuals: "https://www.instagram.com/reel/DU6RZHyjDnl/?igsh=MXE5eXRmbGVrcjZseA==" },
  { date: "January 31, 2026 - CBD, Nairobi", title: "January Monthly Meetup", text: "Starting the year with shared plans, community energy, and clear next steps.", image: "images/January.jpg", visuals: "https://www.instagram.com/reel/DU6RZHyjDnl/?igsh=MXE5eXRmbGVrcjZseA==" },
  { date: "November 27, 2025 - MSDP, Nairobi", title: "2nd Cohort MSDP Graduation", text: "A graduation moment celebrating learner commitment, progress, and confidence.", image: "images/november.png", visuals: "https://www.instagram.com/lea_orgke/p/DSABAXNiCj6/" },
  { date: "October 27, 2025 - Uhuru Park, Nairobi", title: "Monthly Meetup", text: "Community time for review, connection, and planning future learning activities.", image: "images/october.png", visuals: "https://www.instagram.com/lea_orgke/p/DQUjrJEiFaR/" },
  { date: "August 26, 2025 - Juja, Nairobi", title: "Juja Bike Riding", text: "A team-building day built around movement, friendship, and shared purpose.", image: "images/August.png", visuals: "https://www.instagram.com/lea_orgke/p/DN07kX2UANL/" },
  { date: "July 23, 2025 - Mukuru Slums, Nairobi", title: "MSDP Fun Day", text: "A joyful community day for learners, volunteers, and the MSDP family.", image: "images/july.png", visuals: "https://www.instagram.com/lea_orgke/p/DMc_0OwIfxW/" },
  { date: "June 28, 2025 - John Michuki Memorial Park, Nairobi", title: "Monthly Meetup", text: "A meetup focused on keeping volunteers connected and project work organized.", image: "images/june.png", visuals: "https://www.instagram.com/lea_orgke/p/DLnhFn4Ih7Q/" },
  { date: "May 16, 2025 - Nairobi", title: "LEA Organization Anniversary Gala", text: "A celebration of growth, impact, and the community behind LEA Organization.", image: "images/Dinner.jpeg", visuals: "https://www.instagram.com/p/DKCChZLokhh/?igsh=MTdrb3A0OGs1bHlkNg==" },
  { date: "April 19, 2025 - Rongai, Nairobi", title: "St. Paul's Children's Home Outreach", text: "An outreach day built around care, presence, and shared community support.", image: "images/home2.jpg", visuals: "https://www.instagram.com/p/DItdJp8ovk_/?img_index=2&igsh=OHd1OXk1MzU5bmZ3" },
  { date: "March 29, 2025 - John Michuki Memorial Park, Nairobi", title: "Monthly Meetup", text: "A volunteer meetup for reflection, coordination, and planning the next steps.", image: "images/new.png", visuals: "https://www.instagram.com/p/DH3G2wfo-yv/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" },
  { date: "February 22, 2025 - Juja, Nairobi", title: "Pedaling, Planning and Progress", text: "A team day combining movement, planning, and momentum for LEA's growing work.", image: "images/bike.jpeg", visuals: "https://www.instagram.com/p/DGhAvR3o6cA/?igsh=cDNtbXg2MDVwdjB6" },
  { date: "January 25, 2025 - Uhuru Park, Nairobi", title: "Dream & Design: Vision Board Workshop", text: "A vision-setting workshop for aligning personal goals, team energy, and program direction.", image: "images/meetup.png", visuals: "https://www.instagram.com/p/DFXUYatIZJY/?img_index=1&igsh=MTdkOWE1NWxvYjdsZQ==" },
  { date: "November 29, 2024 - GCM, Nairobi", title: "Monthly Meetup", text: "A community meetup for connection, updates, and shared planning.", image: "images/Happy.jpeg", visuals: "https://www.instagram.com/p/DDE6iUeoGmT/?igsh=bng0bzhzbHhydXRk" },
  { date: "November 28, 2024 - MSDP, Nairobi", title: "1st Cohort Graduation", text: "The first cohort graduation marked a major milestone for learners and mentors.", image: "images/grad.jpeg", visuals: "https://www.instagram.com/p/DC7USE1omTf/?img_index=6&igsh=MXI5dndsNHV1Z3FoaA==" },
  { date: "October 25, 2024 - August 7th Memorial Park, Nairobi", title: "Monthly Meetup", text: "A meetup focused on learning, coordination, and volunteer connection.", image: "images/mem.jpeg", visuals: "https://www.instagram.com/p/DBhk8O5IMIK/?igsh=dWNyczk0cjJlMGUy" },
  { date: "October 15, 2024 - Nairobi", title: "Hackathon", text: "A hands-on technology challenge for creativity, teamwork, and problem solving.", image: "images/programs/hackathons.jpg", visuals: "https://www.instagram.com/p/DBJQMBdIGm4/?igsh=N2xrbWI0aTloM2Jm" },
  { date: "July 11, 2024 - MSDP, Nairobi", title: "Fun Day", text: "A bright early LEA moment filled with learning, play, and community joy.", image: "images/Fun Day.jpeg", visuals: "https://www.instagram.com/p/C9jrVkEoHGL/?igsh=d203MGF3YXhwZWQ5" },
];

export const gallery = [
  ["images/LEA pics/LEA-3.jpg", "LEA classroom moment"],
  ["images/LEA - HIGHWAY-32.jpg", "Highway Senior School technology session"],
  ["images/LEA pics/LEA-29.jpg", "Learners and mentors collaborating"],
  ["images/LEA pics/LEA-24.jpg", "LEA students at work"],
  ["images/LEA pics/LEA-23.jpg", "Students during a LEA session"],
  ["images/LEA - HIGHWAY-28.jpg", "Highway Senior School project moment"],
] as const;

export const scriptAction =
  "https://script.google.com/macros/s/AKfycbyBqmXzozfm5_H09j4dd3jlPfutxhBhT7t0wD_JhJd397H7LWwyb-49AAg0A41VBIV_/exec";
