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

  // ── Dubstamper ────────────────────────────────────────────
  dubstamper: {
    posts: [
      { artist: "DMX",           title: "Ruff Ryders' Anthem", date: "APR 27, 2026" },
      { artist: "DAVID BOWIE",   title: "Starman",             date: "APR 27, 2026" },
      { artist: "DRAKE",         title: "Views",               date: "APR 29, 2026" },
      { artist: "MICHAEL JACKSON", title: "Beat It",           date: "APR 30, 2026" },
      { artist: "JOHNNY CASH",   title: "I Walk the Line",     date: "MAY 1, 2026"  },
      { artist: "MOBB DEEP",     title: "Blood Money",         date: "MAY 2, 2026"  },
      { artist: "KENDRICK LAMAR", title: "6:16 in LA",          date: "MAY 3, 2026"  },
      { artist: "CSNY",           title: "Ohio",                date: "MAY 4, 2026"  },
      { artist: "RED HOT CHILI PEPPERS", title: "Arcadium Stadium", date: "MAY 9, 2026"  },
      { artist: "JIMI HENDRIX",   title: "Are You Experienced?", date: "MAY 12, 2026" }
    ]
  },

  // ── Projects ──────────────────────────────────────────────
  // Ordered most recent first by actual date, regardless of active/current
  // status: UU (May 2026) > Uncrowned (Summer 2026) > ESPYs (Jul 2026)
  // > M&H (Jan 2026) > Loud and Clear (Jan 2025) > dormTALK (2023-24).
  projects: [
    {
      id: 3,
      title: "UNIVERSITY UNION",
      role: "DIRECTOR OF SOCIAL MEDIA",
      type: "COMMS / CONTENT CREATION",
      medium: "SOCIAL MEDIA",
      year: "2026",
      image: "assets/work/university-union/thuumbnail.jpeg",
      imageFit: "contain",
      logo: "assets/work/university-union/thuumbnail.jpeg",
      photo: "assets/work/university-union/photo2.jpeg",
      photoCaption: "Myself with the socials board after a successful night at Block Party",
      link: "https://www.instagram.com/universityunion/",
      linkLabel: "View on Instagram",
      detail: {
        accent: "#059669",
        accentRgb: "5, 150, 105",
        dates: "Jan 2026 to Present",
        location: "Syracuse, NY",
        description: "University Union is one of the biggest student-run entertainment organizations in the country, booking artists for Syracuse's student events. I started on the board as Communications Coordinator and content creator, spending most of my time making content for our events. That meant going out on campus, getting students on camera, and building videos for events like Block Party. In May 2026 I stepped into the role of Director of Social Media alongside Elenore Fresnel. Our goal is to bring something new to the board: creative content strategies that actually grow a following, and a data-driven approach to posting so that everything we put out is backed by what we know works.",
        bullets: [
          "Promoted to Director of Social Media for the 2026–27 board, co-leading alongside Elenore Fresnel",
          "Serve as primary liaison between the social media board and all other UU boards",
          "Coordinate with external organizations to amplify event marketing reach",
          "Develop reels, stories, and captions aligned with a content planning calendar"
        ],
        tags: ["Social Media Strategy", "Event Marketing", "Content Creation", "Brand Communications", "Audience Growth"]
      }
    },
    {
      id: 5,
      title: "UNCROWNED",
      role: "PRODUCTION INTERN",
      type: "SPORTS MEDIA",
      medium: "INTERNSHIP",
      year: "2026",
      image: "assets/work/uncrowned/thumbnail.webp",
      logo: "assets/work/uncrowned/crown-logo.png",
      link: "https://www.uncrowned.com",
      linkLabel: "Visit Uncrowned",
      link2: "https://www.youtube.com/@ArielHelwani",
      link2Label: "Ariel Helwani on YouTube",
      detail: {
        accent: "#E8B400",
        accentRgb: "232, 180, 0",
        dates: "Summer 2026",
        location: "New York, NY",
        description: "This summer I worked in New York with Uncrowned, Ariel Helwani's combat sports media company, as a Production Intern on the Ariel Helwani Show. Day to day I helped the show with developing assets, handling courtesies, and small production stuff like camera work and whatever else came up. I also shadowed our Exec Producer, Graphics Producer, Technical Director, and Audio Engineer, and picked up something from every department. On Thursdays I got handed a mic for Boys in the Back and went on air anywhere from a few minutes to a full hour.",
        bullets: [
          "Helped develop assets, courtesies, and day-to-day production needs for the Ariel Helwani Show",
          "Supported other production tasks as needed",
          "Shadowed the Exec Producer, Graphics Producer, Technical Director, and Audio Engineer across departments",
          "Got air time weekly for Boys in the Back, up to an hour long"
        ],
        tags: ["SPORTS MEDIA", "PRODUCTION", "LIVE TV", "ON-AIR", "NYC"]
      }
    },
    {
      id: 6,
      title: "THE ESPYS",
      role: "TALENT ESCORT",
      type: "LIVE EVENTS",
      medium: "TALENT HANDLING",
      year: "2026",
      image: "assets/work/espys/thumbnail.webp",
      logo: "assets/work/espys/thumbnail.webp",
      link: "https://www.espn.com/espys/",
      linkLabel: "Visit The ESPYs",
      detail: {
        accent: "#C9302C",
        accentRgb: "201, 48, 44",
        dates: "July 15, 2026",
        location: "Los Angeles, CA",
        description: "On July 15, 2026 I worked as a Talent Escort at The ESPYs, ESPN's annual awards show honoring the best in sports. I was assigned to escort Kelis Armstrong, Julia Howe, and Samuel Phillips throughout the night, and spent the rest of the show moving around other talent as needed. Getting to work the full event and see a live production at that scale up close was one of the most exciting things I've done.",
        bullets: [
          "Escorted talent Kelis Armstrong, Julia Howe, and Samuel Phillips throughout the show",
          "Moved and assisted with additional talent across the event as needed",
          "Worked the full live broadcast, getting a firsthand look at production at a major scale"
        ],
        tags: ["LIVE EVENTS", "TALENT HANDLING", "BROADCAST", "LOS ANGELES"]
      }
    },
    {
      id: 1,
      title: "M&H INC.",
      role: "TALENT REP",
      type: "A&R / MANAGEMENT",
      medium: "ARTIST SERVICES",
      year: "2026",
      image: "assets/work/mh-inc/thumbnail.svg",
      imageFit: "contain",
      screenBlend: true,
      logo: "assets/work/mh-inc/logo.jpeg",
      photo: "assets/work/mh-inc/photo2.jpg",
      photoCaption: "Myself with Nehru Madan at the UTA NYC offices pitching honestav",
      link: "https://open.spotify.com/artist/2iERIi50FwSNzNeT6j20K8?si=1Jc4MeznQ8CFODRMxWec4A",
      linkLabel: "Isabella Allon on Spotify",
      link2: "assets/work/mh-inc/uta-pitch-deck.pdf",
      link2Label: "View TRF 430 Pitch Deck",
      detail: {
        accent: "#3B82F6",
        accentRgb: "59, 130, 246",
        dates: "Jan 2026 to Present",
        location: "Syracuse, NY",
        description: "Co-founded with Nehru Madan through TRF 430, M&H Inc. is a student-run talent agency built around one idea: give artists what they need to move, and then get out of the way. Our client, Isabella Allon, won Song of the Year at the Otto Awards, shot a music video for her upcoming release, and on April 25th opened for West 22nd, a band with nearly one million monthly listeners on Spotify. Since we started working with her, she has grown by over 1,500 monthly listeners. We help develop her creative vision, connect her to real opportunities, and make sure she stays in full control of who she is. We also completed a full A&R pitch for potential client honestav to UTA representatives. The pitch was named the top in the class.",
        bullets: [
          "Co-founded agency with Nehru Madan through TRF 430: Artist Representation",
          "Signed and managed Isabella Allon, Otto Awards Song of the Year winner",
          "Facilitated music video shoot, two upcoming single releases, and live booking as opener for West 22nd (Apr 25, 2026)",
          "Completed A&R pitch for potential client honestav to UTA representatives. Named top pitch in the class"
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
      photo: "assets/work/orange-tv-network/photo2.jpeg",
      photoCaption: "Myself with the Loud and Clear crew after a successful Spring '26 sem",
      link: "https://www.youtube.com/channel/UCrqsGFd3t6BhNosyUm_HU2Q",
      detail: {
        accent: "#7C3AED",
        accentRgb: "124, 58, 237",
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
    }
  ]
};
