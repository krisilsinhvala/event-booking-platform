/**
 * eventAutoGenerator.js
 *
 * Automatically maintains a minimum number of upcoming (future-dated) events
 * in the Eventora database.
 *
 * Design principles:
 *  - NEVER deletes or modifies existing events
 *  - NEVER duplicates events (3-layer duplicate protection)
 *  - Uses an in-memory cooldown so it does not query DB on every request
 *  - Fails silently — errors are logged but do NOT crash the Express server
 *  - Works entirely within the existing Render Free Web Service (no paid cron)
 */

import Event from '../models/Event.js';
import User from '../models/User.js';
import { environment } from '../config/env.js';

// ─── In-memory cooldown state ─────────────────────────────────────────────────
let lastCheckedAt = null; // Date | null
let isRunning = false;    // prevent concurrent runs

// ─── Event template pool ──────────────────────────────────────────────────────
// Dates are intentionally left out — they are computed dynamically at runtime.
// All required Event schema fields are populated: title, description, category,
// time, venue, location, image, ticketPrice, totalSeats, availableSeats, isPublished.
const EVENT_TEMPLATES = [
  // ── Music ────────────────────────────────────────────────────────────────────
  {
    title: 'Live Acoustic Night: Singer-Songwriter Showcase',
    description:
      'An intimate evening celebrating original music from emerging singer-songwriters. Experience heartfelt original compositions, fingerpicked acoustic guitar, and soulful vocals in a cozy venue setting.',
    category: 'Music',
    time: '07:30 PM',
    venue: 'The Acoustic Lounge, Navrangpura',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 349,
    totalSeats: 120,
  },
  {
    title: 'Indie Music Festival: Emerging Artists Night',
    description:
      'Discover the next big names in Indian independent music. Five hand-picked indie bands perform original sets across genres including indie-folk, alternative rock, and neo-soul.',
    category: 'Music',
    time: '06:00 PM',
    venue: 'Riverfront Open Air Stage',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1501386761578-eaa54b8176b0?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 499,
    totalSeats: 350,
  },
  {
    title: 'Classical Tabla & Sitar Jugalbandi Evening',
    description:
      'Experience the mesmerizing interplay of two of India\'s most iconic instruments. Renowned classical musicians perform traditional ragas and compositions in an intimate concert setting.',
    category: 'Music',
    time: '07:00 PM',
    venue: 'Tagore Hall Auditorium, Paldi',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 399,
    totalSeats: 250,
  },
  {
    title: 'Electronic Music & DJ Night: Ahmedabad Beats',
    description:
      'The city\'s premier electronic music event featuring international-grade DJs, immersive lighting rigs, and pounding bass systems. Genres span house, techno, and progressive trance.',
    category: 'Music',
    time: '09:00 PM',
    venue: 'Sabarmati Riverfront West Lawns',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 699,
    totalSeats: 500,
  },

  // ── Technology ───────────────────────────────────────────────────────────────
  {
    title: 'AI & Machine Learning Conference 2027',
    description:
      'Gujarat\'s premier artificial intelligence summit. Industry leaders and researchers present cutting-edge breakthroughs in generative AI, computer vision, and real-world ML deployment.',
    category: 'Technology',
    time: '09:30 AM',
    venue: 'Science City Auditorium, Sola',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 599,
    totalSeats: 300,
  },
  {
    title: 'React & Next.js Full Stack Web Development Workshop',
    description:
      'A hands-on, project-based workshop covering modern React patterns, server components, Next.js 15 App Router, API design, and production deployment on Vercel and Railway.',
    category: 'Technology',
    time: '10:00 AM',
    venue: 'DevX Innovation Hub, SG Highway',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 749,
    totalSeats: 60,
  },
  {
    title: 'Developer Meetup: Open Source & Side Projects',
    description:
      'A relaxed evening for software developers to demo side projects, share open-source contributions, and connect with the local tech community over pizza and good conversations.',
    category: 'Technology',
    time: '06:30 PM',
    venue: 'Ahmedabad University Tech Lounge',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 0,
    totalSeats: 100,
  },
  {
    title: 'Cloud Computing & DevOps Bootcamp',
    description:
      'Intensive one-day training on AWS, Docker, Kubernetes, and CI/CD pipelines. Learn infrastructure-as-code with Terraform and deploy production-grade containerized applications.',
    category: 'Technology',
    time: '09:00 AM',
    venue: 'Infocity Tower Tech Hub, Gandhinagar',
    location: 'Gandhinagar, Gujarat',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 799,
    totalSeats: 80,
  },

  // ── Sports ───────────────────────────────────────────────────────────────────
  {
    title: 'Ahmedabad City Cricket Premier League',
    description:
      'Fast-paced T20 cricket action with city\'s top amateur and semi-professional teams. Includes cheerleading, live DJ, food stalls, and a spectacular prize ceremony.',
    category: 'Sports',
    time: '03:00 PM',
    venue: 'Motera Sports Ground',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 149,
    totalSeats: 800,
  },
  {
    title: 'Annual Half Marathon: Run for a Cause',
    description:
      'A scenic 21 km half marathon and 10 km fun run through Ahmedabad\'s iconic riverside. Chip-timed with finisher medals, energy stations, and post-race healthy breakfast.',
    category: 'Sports',
    time: '05:30 AM',
    venue: 'Sabarmati Riverfront, Vasna Barrage',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 299,
    totalSeats: 1000,
  },
  {
    title: 'Badminton Open Championship',
    description:
      'Competitive badminton tournament open to amateurs and club players. Singles and doubles categories for men, women, and mixed doubles. Winners receive trophies and cash prizes.',
    category: 'Sports',
    time: '08:00 AM',
    venue: 'Sports Club of Gujarat, Stadium Road',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 199,
    totalSeats: 200,
  },
  {
    title: 'Yoga & Wellness Morning in the Park',
    description:
      'Start your weekend with a rejuvenating outdoor yoga session led by certified instructors. Includes pranayama, Hatha yoga postures, guided meditation, and healthy herbal teas.',
    category: 'Sports',
    time: '06:30 AM',
    venue: 'Parimal Garden Botanical Lawns',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 99,
    totalSeats: 200,
  },

  // ── Business ─────────────────────────────────────────────────────────────────
  {
    title: 'Startup Networking Mixer & Pitch Night',
    description:
      'Connect with angel investors, fellow founders, product managers, and VCs at this high-energy startup networking event. Includes a 3-minute pitch competition with investor feedback.',
    category: 'Business',
    time: '06:00 PM',
    venue: 'WeWork, Prahlad Nagar',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 299,
    totalSeats: 150,
  },
  {
    title: 'Entrepreneurship Summit: Scale Your Business',
    description:
      'A full-day conference for entrepreneurs and business owners. Sessions cover scaling operations, fundraising, brand building, digital marketing, and building high-performance teams.',
    category: 'Business',
    time: '09:00 AM',
    venue: 'Mahatma Mandir Convention Centre, Gandhinagar',
    location: 'Gandhinagar, Gujarat',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 999,
    totalSeats: 400,
  },
  {
    title: 'Personal Finance & Investment Planning Workshop',
    description:
      'A practical workshop demystifying mutual funds, index investing, tax-saving instruments, and real estate. SEBI-registered advisors guide you through building a diversified portfolio.',
    category: 'Business',
    time: '10:30 AM',
    venue: 'Gujarat Chamber of Commerce Hall, Ashram Road',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 499,
    totalSeats: 150,
  },

  // ── Community ─────────────────────────────────────────────────────────────────
  {
    title: 'Community Cultural Mela & Heritage Fair',
    description:
      'A vibrant celebration of Gujarat\'s rich cultural heritage featuring folk performances, traditional handicrafts, authentic street food, and art installations from local artisans.',
    category: 'Community',
    time: '11:00 AM',
    venue: 'Law Garden Heritage Pavilion',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 50,
    totalSeats: 600,
  },
  {
    title: 'Charity Fun Run & Awareness Walk',
    description:
      'A 5 km community fun run raising funds for underprivileged children\'s education. Participation is open to all ages and fitness levels. Includes refreshments and participation certificate.',
    category: 'Community',
    time: '07:00 AM',
    venue: 'Kankaria Lakefront Promenade',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 0,
    totalSeats: 500,
  },
  {
    title: 'Open Mic Night: Comedy, Poetry & Music',
    description:
      'An open stage for performers of all kinds — stand-up comedy, spoken word poetry, acoustic music, and storytelling. A warm and welcoming community crowd awaits. Sign up at the door!',
    category: 'Community',
    time: '07:00 PM',
    venue: 'The Comedy Club Studio, Bodakdev',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 149,
    totalSeats: 100,
  },
  {
    title: 'Night Sky Stargazing Camp',
    description:
      'Escape the city lights for an unforgettable evening of astronomy. Expert guides help you explore planets, star clusters, and deep-sky nebulae through high-powered telescopes.',
    category: 'Community',
    time: '08:00 PM',
    venue: 'Thol Bird Sanctuary Eco Camp',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 399,
    totalSeats: 80,
  },

  // ── Arts ─────────────────────────────────────────────────────────────────────
  {
    title: 'Contemporary Art Exhibition: Emerging Indian Artists',
    description:
      'A curated exhibition showcasing 25 emerging artists working in oil, acrylic, mixed media, and digital art. Gallery walks, artist talks, and live art creation sessions.',
    category: 'Arts',
    time: '11:00 AM',
    venue: 'Amdavad ni Gufa Art Gallery, Navrangpura',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 100,
    totalSeats: 200,
  },
  {
    title: 'Documentary Film Screening & Director Q&A',
    description:
      'Watch two award-winning Indian documentaries followed by an intimate Q&A with the filmmakers. Covers topics of social justice, environment, and human stories from rural India.',
    category: 'Arts',
    time: '05:30 PM',
    venue: 'Sunset Drive-In Cinema Hall',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 199,
    totalSeats: 150,
  },
  {
    title: 'Gujarati Theater Play: Modern Comedy Drama',
    description:
      'A critically acclaimed Gujarati stage production exploring contemporary family dynamics through sharp comedy, powerful dialogue, and exceptional ensemble performances.',
    category: 'Arts',
    time: '07:30 PM',
    venue: 'Natrani Amphitheatre, Usmanpura',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 299,
    totalSeats: 300,
  },

  // ── Workshop ─────────────────────────────────────────────────────────────────
  {
    title: 'Digital Photography & Lightroom Editing Workshop',
    description:
      'Master composition, natural light, and professional photo editing. From camera settings to Lightroom presets, this workshop equips you to shoot and edit stunning photos.',
    category: 'Workshop',
    time: '10:00 AM',
    venue: 'Creative Studio, Ellisbridge',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 599,
    totalSeats: 30,
  },
  {
    title: 'Career Development & Resume Building Seminar',
    description:
      'A practical workshop for fresh graduates and early-career professionals. Covers resume writing, LinkedIn optimization, interview techniques, and salary negotiation strategies.',
    category: 'Workshop',
    time: '11:00 AM',
    venue: 'CII Centre of Excellence, Vastrapur',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 199,
    totalSeats: 100,
  },
  {
    title: 'Pottery & Ceramic Art Workshop for Beginners',
    description:
      'Try your hand at wheel-throwing and hand-building pottery under expert guidance. Create your own clay bowl, cup, or decorative piece to glaze, fire, and take home.',
    category: 'Workshop',
    time: '03:00 PM',
    venue: 'Clay & Canvas Craft Studio, Vastrapur',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 549,
    totalSeats: 25,
  },
  {
    title: 'Public Speaking & Confident Communication Bootcamp',
    description:
      'Overcome stage fright and develop a commanding presence. Practice structured speeches, impromptu speaking, storytelling, and body language under expert Toastmasters-trained coaches.',
    category: 'Workshop',
    time: '09:30 AM',
    venue: 'The Learning Hub, Satellite',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 449,
    totalSeats: 40,
  },

  // ── Food & Drink ─────────────────────────────────────────────────────────────
  {
    title: 'Gourmet Street Food Festival',
    description:
      'Taste your way through 50+ food stalls representing India\'s diverse regional cuisines. From Kolkata kathi rolls to Kerala seafood, this festival is a paradise for food lovers.',
    category: 'Food & Drink',
    time: '12:00 PM',
    venue: 'Riverfront Event Ground, Subhash Bridge',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 99,
    totalSeats: 800,
  },
  {
    title: 'Wine & Cheese Pairing Evening',
    description:
      'A sophisticated guided tasting session pairing imported wines with artisanal international and Indian cheeses. Led by a certified sommelier in an elegant, intimate setting.',
    category: 'Food & Drink',
    time: '07:00 PM',
    venue: 'The Roastery & Brew Lab, Sindhu Bhavan Road',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 899,
    totalSeats: 40,
  },
  {
    title: 'Craft Beer & Local Brewery Tasting Tour',
    description:
      'Sample six rotating craft beers from Gujarat\'s emerging microbrewery scene. Includes a guided tour of the brewing process, food pairings, and a souvenir tasting glass.',
    category: 'Food & Drink',
    time: '04:00 PM',
    venue: 'Garage Brew Co., Anandnagar Road',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 599,
    totalSeats: 60,
  },
];

// ─── Helper: random integer between min and max (inclusive) ───────────────────
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Helper: generate a future date N days from today ────────────────────────
const futureDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(randomInt(8, 20), 0, 0, 0);
  return date;
};

// ─── Helper: format a Date as "HH:MM AM/PM" ──────────────────────────────────
const formatTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = String(minutes).padStart(2, '0');
  return `${h}:${m} ${ampm}`;
};

// ─── Main exported function ───────────────────────────────────────────────────
/**
 * checkAndGenerateEvents
 *
 * Checks if upcoming events are below the minimum threshold and generates
 * the missing number. Safe to call on every request — protected by cooldown.
 *
 * @returns {Promise<void>}
 */
export const checkAndGenerateEvents = async () => {
  // Gate 1: feature toggle
  if (!environment.eventGenerationEnabled) {
    return;
  }

  // Gate 2: prevent concurrent runs
  if (isRunning) {
    return;
  }

  // Gate 3: cooldown check (in-memory, resets on server restart)
  const cooldownMs = environment.eventGeneratorCooldownMinutes * 60 * 1000;
  if (lastCheckedAt && Date.now() - lastCheckedAt < cooldownMs) {
    return;
  }

  isRunning = true;
  lastCheckedAt = Date.now();

  try {
    console.log('[Event Generator] Checking upcoming events...');

    const now = new Date();
    const upcomingCount = await Event.countDocuments({
      isPublished: true,
      date: { $gt: now },
    });

    console.log(`[Event Generator] Upcoming events: ${upcomingCount}`);

    const needed = environment.minUpcomingEvents - upcomingCount;

    if (needed <= 0) {
      console.log('[Event Generator] Upcoming events are sufficient. No new events required.');
      return;
    }

    console.log(`[Event Generator] Need to generate ${needed} events.`);

    // Find admin/organizer user (same pattern as eventSeedService.js)
    let organizer = await User.findOne({ role: 'admin' }).lean();
    if (!organizer && environment.adminEmail) {
      organizer = await User.findOne({ email: environment.adminEmail.toLowerCase().trim() }).lean();
    }

    if (!organizer) {
      console.warn('[Event Generator] No admin user found. Skipping event generation.');
      return;
    }

    // Load existing titles for fast duplicate check (Layer 3)
    const existingTitles = new Set(
      (await Event.find({}, 'title').lean()).map((e) => e.title)
    );

    // Shuffle template pool so we don't always pick the same events
    const shuffled = [...EVENT_TEMPLATES].sort(() => Math.random() - 0.5);

    let generated = 0;
    let templateIndex = 0;

    // Spread dates: first event 7–20 days out, last up to 90 days out
    const dateOffsets = Array.from({ length: needed }, (_, i) => {
      const minDay = 7 + Math.floor((i / needed) * 60);
      const maxDay = minDay + randomInt(5, 20);
      return randomInt(minDay, Math.min(maxDay, 90));
    }).sort((a, b) => a - b); // ascending so earliest events appear first

    for (let i = 0; i < needed; i++) {
      // Cycle through templates if we need more events than templates
      const template = shuffled[templateIndex % shuffled.length];
      templateIndex++;

      // Layer 3 duplicate protection: skip if title already exists
      if (existingTitles.has(template.title)) {
        // Try the next template
        let found = false;
        for (let j = 1; j < shuffled.length; j++) {
          const alt = shuffled[(templateIndex + j - 1) % shuffled.length];
          if (!existingTitles.has(alt.title)) {
            templateIndex = (templateIndex + j) % shuffled.length;
            // Use this alternative instead — handled in next iteration by re-checking
            // We just mark and break; the loop will pick it up
            break;
          }
          if (j === shuffled.length - 1) {
            found = true; // all templates exhausted
          }
        }
        if (found) {
          console.warn('[Event Generator] All event templates already exist. Stopping early.');
          break;
        }
        continue;
      }

      const eventDate = futureDate(dateOffsets[i]);

      const newEvent = await Event.create({
        title: template.title,
        description: template.description,
        category: template.category,
        date: eventDate,
        time: template.time,
        venue: template.venue,
        location: template.location,
        image: template.image,
        ticketPrice: template.ticketPrice,
        totalSeats: template.totalSeats,
        availableSeats: template.totalSeats,
        isPublished: true,
        createdBy: organizer._id,
      });

      existingTitles.add(newEvent.title); // prevent same title in this batch
      console.log(`[Event Generator] Created event: ${newEvent.title}`);
      generated++;
    }

    if (generated > 0) {
      console.log(`[Event Generator] Event generation completed. ${generated} new event(s) added.`);
    } else {
      console.log('[Event Generator] No new events were created (all templates already exist).');
    }
  } catch (error) {
    console.error(`[Event Generator] Error during event generation: ${error.message}`);
    // Reset cooldown on error so next request can retry sooner
    lastCheckedAt = null;
  } finally {
    isRunning = false;
  }
};

export default checkAndGenerateEvents;
