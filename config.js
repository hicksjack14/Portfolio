const SITE_CONFIG = {
  // ── Social Links ──────────────────────────────────────────
  linkedin:  "https://www.linkedin.com/in/jack-hicks-0b4358293/",
  instagram: "https://www.instagram.com/jackzfilmz/",
  spotify:   "https://open.spotify.com/user/h%C3%B6lup%C3%ABan%C3%BCt?si=9822c7bb3f5e48eb",
  imdb:      "https://www.imdb.com/user/ur212405079/?ref_=up_nv_profile",
  youtube:   "",

  // ── Music Player ──────────────────────────────────────────
  spotifyPlaylist: "https://open.spotify.com/playlist/3yiy1sG74w6meId6oABqFT?si=mKiMjJqRQ4CLhxADaGelUg",

  // ── Contact ───────────────────────────────────────────────
  email: "jhhicks@syr.edu",

  // ── Identity ──────────────────────────────────────────────
  location: "36.0334° N, 86.7825° W",
  timeZone: "America/New_York",

  // ── Projects ──────────────────────────────────────────────
  projects: [
    {
      id: 1,
      title: "M&H INC.",
      role: "TALENT REP",
      type: "A&R / MANAGEMENT",
      medium: "ARTIST SERVICES",
      year: "2026",
      image: "assets/work/mh-inc/thumbnail.svg",
      logo: "",
      link: "#",
      detail: {
        accent: "#C9A227",
        accentRgb: "201, 162, 39",
        dates: "Jan 2026 to Present",
        location: "Syracuse, NY",
        description: "Co-founded with Nehru Madan through TRF 430, M&H Inc. is a student-run talent agency built around one idea: give artists what they need to move, and then get out of the way. Our client, Isabella Allon, just won Song of the Year at the Otto Awards, shot a music video for her upcoming release, and is opening for West 22nd when they come to Syracuse. We help develop her creative vision, connect her to real opportunities, and make sure she stays in full control of who she is. We also took our A&R research to UTA and pitched honestav in person.",
        bullets: [
          "Co-founded agency with Nehru Madan through TRF 430: Artist Representation",
          "Signed and managed Isabella Allon, Otto Awards Song of the Year winner",
          "Facilitated music video shoot, two upcoming single releases, and live booking as opener for West 22nd (Apr 25, 2026)",
          "Developed and pitched artist honestav to UTA, full pitch deck available soon"
        ],
        tags: ["Talent Management", "A&R Research", "Artist Development", "Live Booking", "Client Pitching"]
      }
    },
    {
      id: 2,
      title: "LOUD AND CLEAR",
      role: "TECHNICAL DIRECTOR",
      type: "ORANGE TELEVISION NETWORK",
      medium: "LIVE PRODUCTION",
      year: "2025",
      image: "assets/work/orange-tv-network/thumbnail.png",
      logo: "assets/work/orange-tv-network/otn%20logo.jpg",
      link: "https://www.youtube.com/channel/UCrqsGFd3t6BhNosyUm_HU2Q",
      detail: {
        accent: "#FF6B00",
        accentRgb: "255, 107, 0",
        dates: "Jan 2025 to Present",
        location: "Syracuse, NY",
        description: "I started on Loud and Clear as a camera operator. By my second semester I was running day of show, and now I serve as Technical Director and talent booker for the production on Orange Television Network. I hope to step into the EP role next semester. This show taught me what patience in production actually looks like. I did A&R research to fully lock in our shoot schedule, and helped my colleague Kyra Rubenstein learn the ropes behind talent booking and day of show managing. She has blossomed into booking artists on her own. I sit at the switcher during live shoots, cutting between 2 to 4 camera feeds in real time. Every episode, start to finish.",
        bullets: [
          "Progressed from camera operator to day of show manager to Technical Director and Talent Booker",
          "Conducted A&R research to identify and fully book out the semester shoot schedule",
          "Mentored colleague Kyra Rubenstein in talent booking and day of show management",
          "Operated video switchboard cutting between 2 to 4 live camera feeds during shoots",
          "Managed end-to-end production workflow from outreach through final YouTube upload"
        ],
        tags: ["Live TV Production", "Technical Direction", "Multi-Camera Switching", "Talent Booking", "Post-Production"]
      }
    },
    {
      id: 3,
      title: "UNIVERSITY UNION",
      role: "COMMS COORDINATOR",
      type: "EVENT MARKETING",
      medium: "SOCIAL MEDIA",
      year: "2026",
      image: "assets/work/university-union/thuumbnail.jpeg",
      imageFit: "contain",
      logo: "assets/work/university-union/thuumbnail.jpeg",
      link: "https://www.instagram.com/universityunion/",
      linkLabel: "View on Instagram",
      detail: {
        accent: "#059669",
        accentRgb: "5, 150, 105",
        dates: "Jan 2026 to Present",
        location: "Syracuse, NY",
        description: "University Union books artists for Syracuse's student events. It is one of the biggest student-run entertainment organizations in the country. My job as Communications Coordinator is making sure the whole machine is communicating: between boards, with external partners, and with the student body on social. But the real work is in content creation. I collaborate with our director and content team to generate ideas, go out on campus, ask students questions on camera, and build videos that connect with our audience. The audience for this work is 20,000 students.",
        bullets: [
          "Serve as primary liaison between the social media board and all other UU boards",
          "Coordinate with external organizations to amplify event marketing reach",
          "Develop reels, stories, and captions aligned with a content planning calendar"
        ],
        tags: ["Social Media Strategy", "Event Marketing", "Content Creation", "Brand Communications", "Audience Growth"]
      }
    },
    {
      id: 4,
      title: "dormTALK PODCAST",
      role: "CO-PRODUCER",
      type: "PODCAST",
      medium: "MULTI-PLATFORM",
      year: "2024",
      image: "assets/work/dormtalk-podcast/thumbnail.png",
      logo: "assets/work/dormtalk-podcast/dormtalk%20logo.jpeg",
      link: "https://www.youtube.com/@dormtalk5755",
      linkLabel: "Watch on YouTube",
      detail: {
        accent: "#D4611C",
        accentRgb: "212, 97, 28",
        dates: "Sep 2023 to May 2024",
        location: "Syracuse, NY",
        description: "dormTALK started with a phone call from Tyler Gentry. He had the idea, and I helped him build it out, co-producing episodes in his apartment on south campus. I handled the creative side: visuals for Instagram and TikTok, captions that actually got people to stop scrolling, and filming and producing the episodes themselves. We also put out tinyDORM, our take on NPR's Tiny Desk, giving a stage to Syracuse student musicians. It was the first time I got to see what it looks like when good content connects with a real audience.",
        bullets: [
          "Co-produced podcast episodes filmed in-apartment with founder Tyler Gentry",
          "Created visuals, captions, and content for Instagram and TikTok",
          "Produced tinyDORM, a Tiny Desk-style series spotlighting Syracuse student artists"
        ],
        tags: ["Podcast Production", "Video Editing", "Social Media", "Content Strategy", "Visual Design"]
      }
    },
    {
      id: 5,
      title: "UNCROWNED",
      role: "CONTENT & PRODUCTION",
      type: "SPORTS MEDIA",
      medium: "INTERNSHIP",
      year: "2026",
      image: "assets/work/uncrowned/thumbnail.webp",
      logo: "",
      link: "https://www.uncrowned.com",
      linkLabel: "Visit Uncrowned",
      comingSoon: true,
      detail: {
        accent: "#C0392B",
        accentRgb: "192, 57, 43",
        dates: "Summer 2026",
        location: "New York, NY",
        description: "This summer, I am heading to New York City to intern at Uncrowned Network, Ariel Helwani's combat sports media company. I will be working in content and production, embedded in a team that covers boxing, MMA, and the stories that live around the sport. More details soon.",
        bullets: [
          "Joining Uncrowned Network as a summer 2026 intern in NYC",
          "Content and production role covering boxing and MMA",
          "Working alongside Ariel Helwani's combat sports media team"
        ],
        tags: ["SPORTS MEDIA", "CONTENT", "PRODUCTION", "NYC"]
      }
    }
  ]
};
