export const profile = {
  name: "Jacob Beal",
  role: "Computer science grad student and software engineer",
  focus: "Computer vision and healthcare AI",
  location: "Logan, Utah",
  email: "jacob.j.beal@icloud.com",
  links: {
    github: "https://github.com/FroostySnoowman",
    linkedin: "https://www.linkedin.com/in/jacobjbeal/",
    research: "https://github.com/FroostySnoowman/mybreakpoint-vision-research",
    report: "/research/beal-2026-tennis-vision-report.pdf",
    cv: "/jacob-beal-cv.pdf",
  },
  summary:
    "I'm a master's student in computer science at Utah State and a software engineer. I've spent the last few years building software that people use and keeping it running. The tennis app I work on is what got me into computer vision, and I'd like to keep at it in research, especially in healthcare, where a model has to work on patients it never saw in training.",
  interests: ["Computer vision", "Healthcare AI", "Machine learning", "Software engineering", "Model evaluation"],
};

export type Result = { value: number; decimals: number; suffix: string; label: string; detail: string };

export const research = {
  title: "Computer vision for amateur tennis video",
  venue: "Technical report, Nov 2026 · Independent work, not peer reviewed",
  summary:
    "Club and college players film their matches on a phone propped on a fence. The ball is a few pixels wide, the light is anything from noon sun to a dim indoor hall, and most of the video is people walking between points. For MyBreakPoint I built three models that run on the phone for this kind of footage, then tested them on video they never trained on.",
  results: [
    { value: 87.9, decimals: 1, suffix: "%", label: "ball within 8 px", detail: "248 visible-ball frames from 7 held-out videos, run causally like the app" },
    { value: 92, decimals: 0, suffix: "%", label: "points kept whole", detail: "4-fold cross-validation, 42 videos, decode chosen without the scored fold, 3 seeds" },
    { value: 61.9, decimals: 1, suffix: "%", label: "court within 15 cm", detail: "phone footage, up from 25.1% for the same model trained on broadcast frames" },
  ] satisfies Result[],
  models: [
    {
      key: "ball",
      name: "Ball tracking",
      line: "A TrackNet-style network looks at five frames at once. A simple tracker then picks the ball out of its candidates instead of trusting the highest-scoring spot in each frame.",
    },
    {
      key: "court",
      name: "Court calibration",
      line: "Finds 14 points on the court lines, fits a homography to a court measured in meters, and holds back ball positions until the court is locked.",
    },
    {
      key: "points",
      name: "Point segmentation",
      line: "A temporal convolutional network reads ball, motion and audio features and marks where each point starts and ends in a full match.",
    },
  ],
  rigor: [
    {
      title: "A leaky validation split",
      body: "My first split picked overlapping video windows at random, so nearly every validation window had a near copy in training. Splitting by whole clips and videos fixed it, and the scores dropped to ones that meant something.",
    },
    {
      title: "Tuning on the test data",
      body: "My headline point result chose its decoding settings on the same predictions it was scored on. Choosing them on three folds and scoring the fourth took it from 94.2% to 91.9%.",
    },
    {
      title: "Reading the wrong frame",
      body: "Rounding to the millisecond made one scoring script read the frame after each label. With labels matched to the nearest frame, it agrees with the full pipeline: 218 of 248.",
    },
    {
      title: "Ideas that didn't help",
      body: "Distilling a bigger model, averaging models, smoothing tracks and training on compressed video. Heavy compression is still a real weakness.",
    },
  ],
};

export const thesis = {
  title: "Forecasting solar flares and solar energetic particle events",
  advisor: "Prof. Shah Hamdi",
  status: "Planned M.S. thesis",
  body: "Machine learning on NASA and NOAA time series to forecast solar flares and solar energetic particle events.",
};

export type School = { school: string; degree: string; when: string; detail: string; coursework: string };

export const education: School[] = [
  {
    school: "Utah State University",
    degree: "M.S. Computer Science, thesis track",
    when: "Aug 2026 to Apr 2027 (expected)",
    detail: "GPA 4.00 on completed coursework",
    coursework: "Intelligent Systems, AI in Education, Advanced Algorithms, Large Language Models, Vision-Language Models",
  },
  {
    school: "Utah State University",
    degree: "B.S. Computer Science",
    when: "Apr 2026",
    detail: "GPA 3.93, summa cum laude, College of Science Dean's List twice",
    coursework: "Natural Language Processing, Linear Algebra, Statistics, Discrete Mathematics, Theory of Computability",
  },
];

export type Role = { org: string; title: string; where?: string; when: string; points: string[] };

export const experience: Role[] = [
  {
    org: "Amazon Ads",
    title: "Software Development Engineer Intern",
    where: "Seattle, WA",
    when: "Jun to Aug 2026",
    points: [
      "Added campaign-level randomized experiments to the ad bidding system, which couldn't run that kind of experiment before.",
      "Built a pipeline that precomputes which campaigns are in treatment, with versioned mappings, so bidders look assignments up in memory and manual allocations can be audited.",
      "Worked across the experiment service, data pipelines, storage, the bidder client and a self-service UI, and tested the whole flow in beta.",
    ],
  },
  {
    org: "Break Point Technologies, LLC",
    title: "Co-founder and software engineer",
    when: "Dec 2024 to now",
    points: [
      "I build and run MyBreakPoint, a scoring, stats and team app for eight racket sports on iOS, Android, the web, Apple Watch and Wear OS.",
      "Built the on-device ball and court tracking, automatic highlights, and an AI coach that works from your match stats.",
    ],
  },
  {
    org: "Craft Down Under",
    title: "Software developer",
    when: "Feb 2023 to now",
    points: ["Automation, backend services and APIs for a Minecraft network with more than 300,000 players. The support automation cut staff workload by about 75%."],
  },
  {
    org: "Utah State University",
    title: "IT Service Desk",
    where: "Logan, UT",
    when: "Aug 2023 to Jun 2026",
    points: ["Fixed hardware, software, network and account problems for students, faculty and staff."],
  },
];

export const leadership = {
  org: "Utah State University Club Tennis",
  title: "Captain",
  when: "2026 to now",
  body: "I run practices and match days, help new players get settled, and work with the club officers and campus staff.",
};

export type Project = { name: string; line: string; detail: string; stack: string[]; href?: string; linkLabel?: string; logo?: string; live?: "ticketsx" };

export const projects: Project[] = [
  {
    name: "MyBreakPoint",
    line: "Live scoring, stats and teams for racket sports.",
    detail: "The score and every stat are rebuilt from the point history. Live scorecards run on Durable Objects, the vision runs on the phone, and it ships in 43 languages.",
    stack: ["Expo", "React Native", "Workers", "D1", "Durable Objects", "ONNX", "Core ML"],
    href: "https://mybreakpoint.app",
    linkLabel: "mybreakpoint.app",
    logo: "/img/brands/mybreakpoint.png",
  },
  {
    name: "TicketsX",
    line: "Support tickets for Discord, with a chat widget for websites.",
    detail: "Ticket panels, forms, staff teams, encrypted transcripts you can search, and AI summaries.",
    stack: ["Python", "discord.py", "React", "TypeScript", "MySQL"],
    href: "https://ticketsx.xyz",
    linkLabel: "ticketsx.xyz",
    logo: "/img/brands/ticketsx.webp",
    live: "ticketsx",
  },
  {
    name: "Boardify",
    line: "Kanban boards that suggest what to work on next.",
    detail: "Each board is a Durable Object that puts every change in order. The AI suggestions can be kept or undone.",
    stack: ["Expo", "Workers", "D1", "Durable Objects", "Workers AI"],
    href: "https://boardify.mybreakpoint.app",
    linkLabel: "boardify.mybreakpoint.app",
    logo: "/img/brands/boardify.png",
  },
  {
    name: "PortfolioShack",
    line: "A site builder for freelancers, with multiplayer editing.",
    detail: "Editing with other people in real time, version history, custom domains through Cloudflare for SaaS, and session replay.",
    stack: ["React", "Hono", "Workers", "Durable Objects", "Stripe"],
    href: "https://portfolioshack.com",
    linkLabel: "portfolioshack.com",
    logo: "/img/brands/portfolioshack.png",
  },
  {
    name: "Top Discord List",
    line: "A directory of Discord servers and bots, ranked by votes.",
    detail: "Votes go through a queue with signed webhooks and abuse checks, and seven SDKs share one test suite.",
    stack: ["React", "Hono", "Workers", "Queues", "Turnstile"],
    href: "https://topdiscordlist.com",
    linkLabel: "topdiscordlist.com",
    logo: "/img/brands/topdiscordlist.png",
  },
];

export const skills = [
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "Java", "SQL"] },
  { group: "Machine learning", items: ["PyTorch", "OpenCV", "Model training and evaluation", "Temporal models", "Core ML", "ONNX"] },
  { group: "Systems", items: ["React Native", "Expo", "React", "Node.js", "Cloudflare Workers, D1, Durable Objects", "AWS", "Git", "Linux"] },
];
