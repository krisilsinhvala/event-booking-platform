import Event from '../models/Event.js';
import User from '../models/User.js';
import { environment } from '../config/env.js';

const sampleEventsData = [
  {
    title: 'Ahmedabad Music Night: Acoustic Under the Stars',
    description:
      'Immerse yourself in an enchanting evening of soulful acoustic melodies, folk fusion, and contemporary indie rhythms. Featuring top regional and national singer-songwriters performing live under the starlit sky.',
    category: 'Music',
    date: new Date('2026-11-14T19:00:00.000Z'),
    time: '07:00 PM',
    venue: 'Riverfront Open Air Theatre, Sabarmati Riverfront',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 499,
    totalSeats: 300,
    availableSeats: 300,
    isPublished: true
  },
  {
    title: 'Full Stack Development Bootcamp & Architecture Workshop',
    description:
      'An intensive, hands-on masterclass on building enterprise-ready full-stack applications with Node.js, React, Docker, and cloud architectures. Ideal for junior developers, tech founders, and computer science students.',
    category: 'Workshop',
    date: new Date('2026-11-21T10:00:00.000Z'),
    time: '10:00 AM',
    venue: 'CII Centre of Excellence, Vastrapur',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 799,
    totalSeats: 60,
    availableSeats: 60,
    isPublished: true
  },
  {
    title: 'Ahmedabad Premier Cricket Championship 2026',
    description:
      'Experience edge-of-the-seat cricket excitement as city teams battle it out for the coveted champion trophy! Food trucks, cheering squads, live DJ, and thrilling 20-over action all weekend long.',
    category: 'Sports',
    date: new Date('2026-11-28T14:30:00.000Z'),
    time: '02:30 PM',
    venue: 'Sardar Patel Sports Enclave Grounds, Motera',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 299,
    totalSeats: 500,
    availableSeats: 500,
    isPublished: true
  },
  {
    title: 'Gujarat Heritage Food & Cultural Street Festival',
    description:
      'A weekend celebration of authentic Gujarati culinary arts, street delicacies, artisanal sweets, live folk music, and handicraft stalls. Sample culinary delights from over 40 curated chefs and heritage food houses.',
    category: 'Food & Drink',
    date: new Date('2026-12-05T12:00:00.000Z'),
    time: '12:00 PM',
    venue: 'Law Garden Heritage Pavilion',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 199,
    totalSeats: 400,
    availableSeats: 400,
    isPublished: true
  },
  {
    title: 'Visions of India: National Photography & Visual Arts Exhibition',
    description:
      'Explore stunning visual narratives capturing India’s rich heritage, raw street life, and unseen landscapes. Curated by acclaimed documentary photographers, featuring gallery tours and photography Q&A sessions.',
    category: 'Arts',
    date: new Date('2026-12-12T11:00:00.000Z'),
    time: '11:00 AM',
    venue: 'Amdavad ni Gufa Art Gallery, Navrangpura',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 150,
    totalSeats: 150,
    availableSeats: 150,
    isPublished: true
  },
  {
    title: 'Vibrant Gujarat Tech & Startup Founders Meetup',
    description:
      'Connect with top Angel Investors, Venture Capitalists, SaaS founders, and AI innovators. Panel talks on fundraising in 2026, finding product-market fit, and networking mixer with high-growth startup leaders.',
    category: 'Technology',
    date: new Date('2026-12-19T17:00:00.000Z'),
    time: '05:00 PM',
    venue: 'DevX Coworking Innovation Hub, SG Highway',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 499,
    totalSeats: 120,
    availableSeats: 120,
    isPublished: true
  },
  {
    title: 'Laugh Out Loud: Stand-up Comedy Evening',
    description:
      'Unwind with 90 minutes of non-stop belly laughs, relatable observational humor, and witty crowd interactions featuring top touring Indian stand-up comedians.',
    category: 'Community',
    date: new Date('2026-12-26T20:00:00.000Z'),
    time: '08:00 PM',
    venue: 'The Comedy Club Studio, Bodakdev',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 399,
    totalSeats: 100,
    availableSeats: 100,
    isPublished: true
  },
  {
    title: 'Green Earth Community Tree Plantation & Cleanliness Drive',
    description:
      'Join our community volunteer effort to plant 1,000 indigenous trees along the urban green belt. All volunteers receive saplings, gardening kits, morning refreshments, and participation certificates.',
    category: 'Community',
    date: new Date('2027-01-09T07:30:00.000Z'),
    time: '07:30 AM',
    venue: 'Prahlad Nagar Urban Forest Park',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 0,
    totalSeats: 250,
    availableSeats: 250,
    isPublished: true
  },
  {
    title: 'UI/UX Design Systems & Product Experience Masterclass',
    description:
      'Level up your digital product design skillset. Learn the secrets of building resilient Figma design systems, micro-animations, user testing, and bridging the gap between Figma and production React code.',
    category: 'Workshop',
    date: new Date('2027-01-16T14:00:00.000Z'),
    time: '02:00 PM',
    venue: 'Design Innovation Center, NID Campus Area',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 650,
    totalSeats: 75,
    availableSeats: 75,
    isPublished: true
  },
  {
    title: 'Gujarat Business Leaders & MSME Growth Summit 2027',
    description:
      'A premier business conference focused on modern supply chains, export opportunities, GST compliance, and digital transformations for manufacturing and MSME enterprises.',
    category: 'Business',
    date: new Date('2027-01-23T09:30:00.000Z'),
    time: '09:30 AM',
    venue: 'Mahatma Mandir Convention Centre, Gandhinagar',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 999,
    totalSeats: 350,
    availableSeats: 350,
    isPublished: true
  },
  {
    title: 'Electronic Sunset Beach & Bass Festival 2026',
    description:
      'Experience pulsating electronic dance music, world-class light installations, and energetic DJ sets from international and Indian electronic music producers. Massive sound systems and energetic festival vibes.',
    category: 'Music',
    date: new Date('2026-11-29T16:00:00.000Z'),
    time: '04:00 PM',
    venue: 'Riverfront Promenade Lawns, West Bank',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 899,
    totalSeats: 450,
    availableSeats: 450,
    isPublished: true
  },
  {
    title: 'Sabarmati Heritage 10K & 5K Marathon Run',
    description:
      'Lace up your running shoes for the annual Sabarmati sunrise marathon! Chip-timed 10K and friendly 5K fun runs with hydration stations, finisher medals, runner t-shirts, and healthy breakfast boxes.',
    category: 'Sports',
    date: new Date('2026-12-06T06:00:00.000Z'),
    time: '06:00 AM',
    venue: 'Vallabh Sadan Riverfront Plaza',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 350,
    totalSeats: 600,
    availableSeats: 600,
    isPublished: true
  },
  {
    title: 'Hands-On Ceramic Pottery & Terracotta Clay Workshop',
    description:
      'Discover the meditative joy of hand-building and wheel-throwing pottery. Guided by veteran ceramicists, you will shape bowls, cups, and custom clay artifacts to fire, glaze, and take home.',
    category: 'Arts',
    date: new Date('2026-12-13T15:00:00.000Z'),
    time: '03:00 PM',
    venue: 'Clay & Canvas Craft Studio, Vastrapur',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 550,
    totalSeats: 40,
    availableSeats: 40,
    isPublished: true
  },
  {
    title: 'Artificial Intelligence & Generative LLM Developers Summit',
    description:
      'Dive deep into transformer architectures, agentic AI frameworks, RAG pipelines, and deploying cost-effective LLMs in enterprise products. Hands-on coding labs and GPU architecture panels.',
    category: 'Technology',
    date: new Date('2026-12-20T10:00:00.000Z'),
    time: '10:00 AM',
    venue: 'Science City Auditorium, Sola',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 699,
    totalSeats: 200,
    availableSeats: 200,
    isPublished: true
  },
  {
    title: 'Artisanal Coffee Roasting & Mocktail Mixology Experience',
    description:
      'Taste single-origin coffees from Chikmagalur and Coorg, learn manual pour-over techniques, and craft refreshing herbal mocktails with professional baristas and botanical mixologists.',
    category: 'Food & Drink',
    date: new Date('2027-01-10T16:00:00.000Z'),
    time: '04:00 PM',
    venue: 'The Roastery & Brew Lab, Sindhu Bhavan Road',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 450,
    totalSeats: 50,
    availableSeats: 50,
    isPublished: true
  },
  {
    title: 'Mindfulness, Breathwork & Sunset Yoga Sanctuary',
    description:
      'Escape the hustle of city life. An outdoor wellness session featuring pranayama breathwork, gentle Hatha yoga postures, guided sound bath meditation, and cold-pressed organic juices.',
    category: 'Community',
    date: new Date('2027-01-17T17:30:00.000Z'),
    time: '05:30 PM',
    venue: 'Kankaria Lakefront Open Amphitheater',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 199,
    totalSeats: 180,
    availableSeats: 180,
    isPublished: true
  },
  {
    title: 'Gujarat Indie Film Screening & Director Roundtable',
    description:
      'Watch exclusive short films and documentaries crafted by emerging regional filmmakers. Includes an interactive Q&A session with directors, cinematographers, and screenwriters.',
    category: 'Arts',
    date: new Date('2027-01-24T18:30:00.000Z'),
    time: '06:30 PM',
    venue: 'Sunset Drive-In Cinema Club Hall',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 250,
    totalSeats: 120,
    availableSeats: 120,
    isPublished: true
  },
  {
    title: '48-Hour Youth Innovation Hackathon 2027',
    description:
      'Build rapid prototypes, apps, and hardware solutions tackling climate, education, and healthcare challenges. Free meals, high-speed WiFi, mentor guidance, and prizes worth over ₹2,00,000.',
    category: 'Technology',
    date: new Date('2027-01-30T09:00:00.000Z'),
    time: '09:00 AM',
    venue: 'Ahmedabad University Venture Studio',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 100,
    totalSeats: 160,
    availableSeats: 160,
    isPublished: true
  },
  {
    title: 'Navratri Heritage Folk Rhythms & Classical Sitar Concert',
    description:
      'An evening honoring centuries-old musical traditions. Featuring renowned sitar virtuosos and folk percussionists blending traditional Indian ragas with resonant temple rhythms.',
    category: 'Music',
    date: new Date('2027-02-06T19:30:00.000Z'),
    time: '07:30 PM',
    venue: 'Pandit Dindayal Upadhyay Auditorium',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 599,
    totalSeats: 350,
    availableSeats: 350,
    isPublished: true
  },
  {
    title: 'Words & Chai: Poetry, Storytelling & Acoustic Open Mic',
    description:
      'A cozy community evening celebrating spoken word, Hindi & Gujarati poetry, personal stories, and acoustic songs. Uncapped creativity, warm chai, and supportive audiences.',
    category: 'Community',
    date: new Date('2027-02-13T18:00:00.000Z'),
    time: '06:00 PM',
    venue: 'Kavita Cafe Cultural Courtyard, Navrangpura',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 150,
    totalSeats: 80,
    availableSeats: 80,
    isPublished: true
  },
  {
    title: 'Retro Bollywood Brass & Ghazal Symphony Night',
    description:
      'A magical orchestral evening reviving golden era melodies of Kishore Kumar, Lata Mangeshkar, and R.D. Burman performed by a 24-piece live brass and strings ensemble.',
    category: 'Music',
    date: new Date('2026-11-22T19:00:00.000Z'),
    time: '07:00 PM',
    venue: 'Tagore Memorial Hall, Paldi',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 599,
    totalSeats: 400,
    availableSeats: 400,
    isPublished: true
  },
  {
    title: 'Ahmedabad 5v5 Turf Football Night Champions Cup',
    description:
      'Under-the-lights fast-paced 5v5 turf football tournament. 32 corporate and club teams compete in knockout stages with professional referees, live streaming, and trophy presentations.',
    category: 'Sports',
    date: new Date('2026-12-04T19:00:00.000Z'),
    time: '07:00 PM',
    venue: 'Kickoff Arena Turf, Sindhu Bhavan Road',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 200,
    totalSeats: 250,
    availableSeats: 250,
    isPublished: true
  },
  {
    title: 'French Pastry, Macarons & Artisanal Baking Masterclass',
    description:
      'Learn the intricate science of French patisserie from Le Cordon Bleu certified chefs. Master delicate macarons, chocolate eclairs, flaky croissants, and tart shells.',
    category: 'Food & Drink',
    date: new Date('2026-12-11T14:00:00.000Z'),
    time: '02:00 PM',
    venue: 'The Culinary Academy Studio, Bodakdev',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 850,
    totalSeats: 35,
    availableSeats: 35,
    isPublished: true
  },
  {
    title: 'Cybersecurity, Ethical Hacking & Zero-Trust Architecture Conclave',
    description:
      'Leading InfoSec experts dissect live vulnerability demonstrations, ransomware defense, cloud identity governance, and penetration testing methodologies.',
    category: 'Technology',
    date: new Date('2026-12-18T09:30:00.000Z'),
    time: '09:30 AM',
    venue: 'Gujarat Technological University Auditorium, Chandkheda',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 499,
    totalSeats: 220,
    availableSeats: 220,
    isPublished: true
  },
  {
    title: 'Sunday Open-Air Watercolor Botanical Painting on the Lawn',
    description:
      'Relax in nature with artist-grade watercolor paints, cold-press paper, and expert guidance on botanical illustration, color blending, and plein-air painting techniques.',
    category: 'Arts',
    date: new Date('2026-12-27T09:00:00.000Z'),
    time: '09:00 AM',
    venue: 'Parimal Garden Botanical Lawns',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 350,
    totalSeats: 60,
    availableSeats: 60,
    isPublished: true
  },
  {
    title: 'Ahmedabad Pet Gala: Dog Carnival, Agility Race & Adoption Fair',
    description:
      'The biggest family pet celebration in town! Features agility obstacle courses, veterinary health checks, pet grooming demos, pop-up treats, and shelter pet adoption drives.',
    category: 'Community',
    date: new Date('2027-01-03T11:00:00.000Z'),
    time: '11:00 AM',
    venue: 'Gulmohar Greens Open Lawns, Sanand Highway',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 100,
    totalSeats: 500,
    availableSeats: 500,
    isPublished: true
  },
  {
    title: 'Gujarat D2C Brands, E-Commerce & Retail Accelerator Summit',
    description:
      'Unpack modern consumer behavior, performance marketing, supply-chain scale, and venture financing for founders scaling consumer brands from ₹1 Cr to ₹100 Cr.',
    category: 'Business',
    date: new Date('2027-01-15T10:00:00.000Z'),
    time: '10:00 AM',
    venue: 'Crowne Plaza Grand Ballroom, SG Highway',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 1199,
    totalSeats: 180,
    availableSeats: 180,
    isPublished: true
  },
  {
    title: 'Sufi Under The Stars: Live Qawwali & Mystical Evening',
    description:
      'Experience transcending Sufi kalam, soulful harmonies, and traditional harmonium accompaniment in the historic ambient surroundings of Sarkhej Roza.',
    category: 'Music',
    date: new Date('2027-01-22T19:30:00.000Z'),
    time: '07:30 PM',
    venue: 'Sarkhej Roza Heritage Courtyard',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 450,
    totalSeats: 350,
    availableSeats: 350,
    isPublished: true
  },
  {
    title: 'Speed Chess Grandmaster Open & Rapid Blitz Championship',
    description:
      'FIDE-rated rapid and blitz chess tournament with digital clocks, international arbiters, cash prizes, and exhibition matches against Grandmasters.',
    category: 'Sports',
    date: new Date('2027-01-29T13:00:00.000Z'),
    time: '01:00 PM',
    venue: 'Sports Club of Gujarat, Stadium Road',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 250,
    totalSeats: 120,
    availableSeats: 120,
    isPublished: true
  },
  {
    title: 'Modern Calligraphy, Hand Lettering & Journaling Workshop',
    description:
      'Transform your handwriting into bespoke art. Learn brush-pen mechanics, gothic flourishes, modern copperplate scripts, and personal wax-seal stationery stamping.',
    category: 'Workshop',
    date: new Date('2027-02-05T15:30:00.000Z'),
    time: '03:30 PM',
    venue: 'Artizen Creative Studio, Ellisbridge',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 499,
    totalSeats: 45,
    availableSeats: 45,
    isPublished: true
  },
  {
    title: 'Cloud DevOps, Kubernetes & Cloud-Native Infrastructure Bootcamp',
    description:
      'Deep dive into GitOps, automated CI/CD pipelines, Terraform infrastructure-as-code, and resilient multi-cluster Kubernetes deployments.',
    category: 'Technology',
    date: new Date('2027-02-12T10:00:00.000Z'),
    time: '10:00 AM',
    venue: 'Infocity Tower II Tech Hub, Gandhinagar',
    location: 'Gandhinagar, Gujarat',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 750,
    totalSeats: 90,
    availableSeats: 90,
    isPublished: true
  },
  {
    title: 'The Great Ahmedabad Burger & Street Food Cook-Off',
    description:
      'Feast on smoky smashed burgers, artisanal loaded fries, craft sauces, and live grilling battles featuring top city chefs competing for the Golden Spatula.',
    category: 'Food & Drink',
    date: new Date('2027-02-19T13:00:00.000Z'),
    time: '01:00 PM',
    venue: 'Riverfront Event Ground, Subhash Bridge',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 250,
    totalSeats: 450,
    availableSeats: 450,
    isPublished: true
  },
  {
    title: 'Original Gujarati Theater Play & Dramatic Monologues',
    description:
      'An award-winning theatrical performance exploring contemporary social relationships with poignant drama, satirical humor, and powerful ensemble stage acting.',
    category: 'Arts',
    date: new Date('2027-02-26T20:00:00.000Z'),
    time: '08:00 PM',
    venue: 'Natrani Amphitheatre, Usmanpura',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 300,
    totalSeats: 280,
    availableSeats: 280,
    isPublished: true
  },
  {
    title: 'Night Sky Stargazing, Astrophotography & Telescope Camp',
    description:
      'Spend a clear night exploring the rings of Saturn, craters of the Moon, and deep-sky nebulae through high-powered computerized telescopes with astronomers.',
    category: 'Community',
    date: new Date('2027-03-05T20:30:00.000Z'),
    time: '08:30 PM',
    venue: 'Thol Bird Sanctuary Eco Camp Site',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 399,
    totalSeats: 100,
    availableSeats: 100,
    isPublished: true
  },
  {
    title: 'Stock Market Trading, Technical Analysis & Wealth Building Summit',
    description:
      'Professional strategies for options trading, risk management, quantitative charting, and long-term equity portfolio construction from SEBI-registered analysts.',
    category: 'Business',
    date: new Date('2027-03-12T10:30:00.000Z'),
    time: '10:30 AM',
    venue: 'Gujarat Chamber of Commerce Convention Hall, Ashram Road',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 899,
    totalSeats: 200,
    availableSeats: 200,
    isPublished: true
  },
  {
    title: 'Sunday Cycling Heritage City Peloton & Sunrise Ride',
    description:
      'A 25 km guided bicycle ride through ancient pols, heritage gates, and the riverfront. Includes support vehicle, mechanical aid, energy drinks, and authentic breakfast.',
    category: 'Sports',
    date: new Date('2027-03-19T05:45:00.000Z'),
    time: '05:45 AM',
    venue: 'Teen Darwaza Historic Gate, Old City',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 150,
    totalSeats: 300,
    availableSeats: 300,
    isPublished: true
  },
  {
    title: 'Indie Rock Jam & Battle of the College Bands 2027',
    description:
      'Watch 12 energetic rock, metal, and fusion bands battle it out on stage for regional bragging rights, recording studio contracts, and festival headliner spots.',
    category: 'Music',
    date: new Date('2027-03-26T18:30:00.000Z'),
    time: '06:30 PM',
    venue: 'LD Arts College Open Amphitheater',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 350,
    totalSeats: 400,
    availableSeats: 400,
    isPublished: true
  },
  {
    title: 'Sourdough Bread Crafting & Fermentation Workshop',
    description:
      'Learn the ancient art of wild yeast fermentation. From cultivating your own sourdough starter to scoring, kneading, and Dutch-oven baking crusty sourdough loaves.',
    category: 'Workshop',
    date: new Date('2027-04-02T11:00:00.000Z'),
    time: '11:00 AM',
    venue: 'Bake Artisan Studio, Satellite',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 600,
    totalSeats: 30,
    availableSeats: 30,
    isPublished: true
  },
  {
    title: 'Web3, Decentralized Apps & Smart Contract Security Meetup',
    description:
      'Explore Solidity security patterns, zero-knowledge proofs, DeFi protocols, and decentralized governance frameworks with active Web3 blockchain developers.',
    category: 'Technology',
    date: new Date('2027-04-09T17:00:00.000Z'),
    time: '05:00 PM',
    venue: 'Gift City FinTech Hub Tower, Gandhinagar',
    location: 'Gandhinagar, Gujarat',
    image:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 300,
    totalSeats: 150,
    availableSeats: 150,
    isPublished: true
  },
  {
    title: 'Women Entrepreneurs & Startup Innovators Leadership Expo',
    description:
      'A power-packed networking symposium bringing together female founders, corporate executives, angel investors, and mentors to unlock startup growth and scaling.',
    category: 'Business',
    date: new Date('2027-04-16T10:00:00.000Z'),
    time: '10:00 AM',
    venue: 'Hyatt Regency Grand Ballroom, Ashram Road',
    location: 'Ahmedabad, Gujarat',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    ticketPrice: 699,
    totalSeats: 250,
    availableSeats: 250,
    isPublished: true
  }
];

export const seedEvents = async ({ force = false } = {}) => {
  // Check if seeding is enabled
  if (!environment.seedEvents) {
    console.log('Eventora event seeding skipped: SEED_EVENTS is disabled.');
    return;
  }

  try {
    const existingCount = await Event.countDocuments();

    if (existingCount > 0 && !force) {
      console.log('Eventora event seeding skipped: events already exist.');
      return;
    }

    // Find or create an admin/organizer user for the required createdBy field
    let organizer = await User.findOne({ role: 'admin' });

    if (!organizer && environment.adminEmail) {
      organizer = await User.findOne({ email: environment.adminEmail.toLowerCase().trim() });
    }

    if (!organizer) {
      // Create a default administrator/organizer account
      const adminEmail = (environment.adminEmail || 'admin@eventora.com').toLowerCase().trim();
      const adminPassword = environment.adminPassword || 'Admin@12345';
      const adminName = environment.adminName || 'Eventora Admin';

      organizer = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true
      });
      console.log(`Created default organizer account for seed events: ${adminEmail}`);
    }

    // Avoid duplicate events by title
    const existingTitles = new Set((await Event.find({}, 'title').lean()).map((e) => e.title));
    const eventsToInsert = sampleEventsData
      .filter((item) => !existingTitles.has(item.title))
      .map((item) => ({
        ...item,
        createdBy: organizer._id
      }));

    if (eventsToInsert.length === 0) {
      console.log('Eventora event seeding skipped: all sample events already exist in the database.');
      return;
    }

    await Event.insertMany(eventsToInsert);
    console.log(`Eventora event seeding completed: ${eventsToInsert.length} events inserted.`);
  } catch (error) {
    console.error(`Eventora event seeding failed: ${error.message}`);
  }
};

export default seedEvents;
