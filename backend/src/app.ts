import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import myListRoutes from './routes/myListRoutes';
import contentRoutes from './routes/contentRoutes';
import authRoutes from './routes/authRoutes';
import { ApiResponse } from './types';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://ott-platform-my-list-git-main-ajay-kumars-projects-eb5c30ca.vercel.app',
    'https://ott-platform-my-list-pzaovikuo-ajay-kumars-projects-eb5c30ca.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Server is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  };
  res.json(response);
});

// Manual seed endpoint for debugging
app.post('/seed', async (req, res) => {
  try {
    const seedModule = require('./scripts/seed');
    const seedDatabase = seedModule.seedDatabase || seedModule.default;
    if (typeof seedDatabase === 'function') {
      await seedDatabase();
      res.json({ success: true, message: 'Database seeded successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Seeder function not found' });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Seeding failed', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Debug endpoint to check data files
app.get('/debug', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(__dirname, '../data');
    
    const files = ['movies.json', 'tvshows.json', 'users.json', 'auth-users.json'];
    const debug: Record<string, any> = {};
    
    files.forEach(file => {
      const filePath = path.join(dataDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        debug[file] = {
          exists: true,
          size: content.length,
          content: content.substring(0, 200) + (content.length > 200 ? '...' : '')
        };
      } else {
        debug[file] = { exists: false };
      }
    });
    
    res.json({ success: true, debug });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Manual data creation endpoint
app.post('/create-sample-data', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const { v4: uuidv4 } = require('uuid');
    
    const dataDir = path.join(__dirname, '../data');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Sample movies (30 movies)
    const movies = [
      {
        id: uuidv4(),
        title: "The Matrix",
        description: "A computer hacker learns about the true nature of reality.",
        genres: ["SciFi", "Action"],
        releaseDate: "1999-03-31T00:00:00.000Z",
        duration: 136,
        rating: 8.7,
        actors: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
        posterUrl: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=The+Matrix",
        trailerUrl: "https://www.youtube.com/watch?v=vKQi3bBA1y8"
      },
      {
        id: uuidv4(),
        title: "Inception",
        description: "A thief who steals corporate secrets through dream-sharing technology.",
        genres: ["SciFi", "Thriller"],
        releaseDate: "2010-07-16T00:00:00.000Z",
        duration: 148,
        rating: 8.8,
        actors: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy"],
        posterUrl: "https://via.placeholder.com/300x450/2c3e50/ffffff?text=Inception",
        trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0"
      },
      {
        id: uuidv4(),
        title: "The Dark Knight",
        description: "Batman faces the Joker in this epic superhero thriller.",
        genres: ["Action", "Crime", "Drama"],
        releaseDate: "2008-07-18T00:00:00.000Z",
        duration: 152,
        rating: 9.0,
        actors: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
        posterUrl: "https://via.placeholder.com/300x450/34495e/ffffff?text=Dark+Knight",
        trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY"
      },
      {
        id: uuidv4(),
        title: "Pulp Fiction",
        description: "The lives of two mob hitmen, a boxer, and others intertwine.",
        genres: ["Crime", "Drama"],
        releaseDate: "1994-10-14T00:00:00.000Z",
        duration: 154,
        rating: 8.9,
        actors: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
        posterUrl: "https://via.placeholder.com/300x450/8e44ad/ffffff?text=Pulp+Fiction",
        trailerUrl: "https://www.youtube.com/watch?v=s7EdQ4FqbhY"
      },
      {
        id: uuidv4(),
        title: "The Shawshank Redemption",
        description: "Two imprisoned men bond over years, finding solace through acts of decency.",
        genres: ["Drama"],
        releaseDate: "1994-09-23T00:00:00.000Z",
        duration: 142,
        rating: 9.3,
        actors: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
        posterUrl: "https://via.placeholder.com/300x450/27ae60/ffffff?text=Shawshank",
        trailerUrl: "https://www.youtube.com/watch?v=6hB3S9bIaco"
      },
      {
        id: uuidv4(),
        title: "Forrest Gump",
        description: "The story of a man with low IQ who accomplishes great things.",
        genres: ["Drama", "Romance"],
        releaseDate: "1994-07-06T00:00:00.000Z",
        duration: 142,
        rating: 8.8,
        actors: ["Tom Hanks", "Robin Wright", "Gary Sinise"],
        posterUrl: "https://via.placeholder.com/300x450/f39c12/ffffff?text=Forrest+Gump",
        trailerUrl: "https://www.youtube.com/watch?v=bLvqoHBptjg"
      },
      {
        id: uuidv4(),
        title: "The Godfather",
        description: "The aging patriarch of a crime dynasty transfers control to his son.",
        genres: ["Crime", "Drama"],
        releaseDate: "1972-03-24T00:00:00.000Z",
        duration: 175,
        rating: 9.2,
        actors: ["Marlon Brando", "Al Pacino", "James Caan"],
        posterUrl: "https://via.placeholder.com/300x450/c0392b/ffffff?text=The+Godfather",
        trailerUrl: "https://www.youtube.com/watch?v=sY1S34973zA"
      },
      {
        id: uuidv4(),
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space.",
        genres: ["SciFi", "Drama"],
        releaseDate: "2014-11-07T00:00:00.000Z",
        duration: 169,
        rating: 8.6,
        actors: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        posterUrl: "https://via.placeholder.com/300x450/16a085/ffffff?text=Interstellar",
        trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E"
      },
      {
        id: uuidv4(),
        title: "Goodfellas",
        description: "The story of Henry Hill and his life in the mob.",
        genres: ["Crime", "Drama"],
        releaseDate: "1990-09-21T00:00:00.000Z",
        duration: 146,
        rating: 8.7,
        actors: ["Robert De Niro", "Ray Liotta", "Joe Pesci"],
        posterUrl: "https://via.placeholder.com/300x450/e74c3c/ffffff?text=Goodfellas",
        trailerUrl: "https://www.youtube.com/watch?v=qo5jJpHtI1Y"
      },
      {
        id: uuidv4(),
        title: "The Lord of the Rings",
        description: "A hobbit and his companions set out to destroy the One Ring.",
        genres: ["Adventure", "Fantasy"],
        releaseDate: "2001-12-19T00:00:00.000Z",
        duration: 178,
        rating: 8.8,
        actors: ["Elijah Wood", "Ian McKellen", "Orlando Bloom"],
        posterUrl: "https://via.placeholder.com/300x450/9b59b6/ffffff?text=LOTR",
        trailerUrl: "https://www.youtube.com/watch?v=V75dMMIW2B4"
      },
      {
        id: uuidv4(),
        title: "Fight Club",
        description: "An insomniac office worker forms an underground fight club.",
        genres: ["Drama", "Thriller"],
        releaseDate: "1999-10-15T00:00:00.000Z",
        duration: 139,
        rating: 8.8,
        actors: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
        posterUrl: "https://via.placeholder.com/300x450/e67e22/ffffff?text=Fight+Club",
        trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg"
      },
      {
        id: uuidv4(),
        title: "Star Wars",
        description: "Luke Skywalker joins forces with rebels to battle the Empire.",
        genres: ["SciFi", "Adventure"],
        releaseDate: "1977-05-25T00:00:00.000Z",
        duration: 121,
        rating: 8.6,
        actors: ["Mark Hamill", "Harrison Ford", "Carrie Fisher"],
        posterUrl: "https://via.placeholder.com/300x450/3498db/ffffff?text=Star+Wars",
        trailerUrl: "https://www.youtube.com/watch?v=vZ734NWnAHA"
      },
      {
        id: uuidv4(),
        title: "Avengers: Endgame",
        description: "The Avengers assemble for a final battle against Thanos.",
        genres: ["Action", "Adventure", "SciFi"],
        releaseDate: "2019-04-26T00:00:00.000Z",
        duration: 181,
        rating: 8.4,
        actors: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson"],
        posterUrl: "https://via.placeholder.com/300x450/1abc9c/ffffff?text=Endgame",
        trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c"
      },
      {
        id: uuidv4(),
        title: "Titanic",
        description: "A love story aboard the ill-fated RMS Titanic.",
        genres: ["Romance", "Drama"],
        releaseDate: "1997-12-19T00:00:00.000Z",
        duration: 194,
        rating: 7.8,
        actors: ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane"],
        posterUrl: "https://via.placeholder.com/300x450/2980b9/ffffff?text=Titanic",
        trailerUrl: "https://www.youtube.com/watch?v=2e-eXJ6HgkQ"
      },
      {
        id: uuidv4(),
        title: "Jurassic Park",
        description: "Scientists clone dinosaurs to populate a theme park.",
        genres: ["Adventure", "SciFi", "Thriller"],
        releaseDate: "1993-06-11T00:00:00.000Z",
        duration: 127,
        rating: 8.1,
        actors: ["Sam Neill", "Laura Dern", "Jeff Goldblum"],
        posterUrl: "https://via.placeholder.com/300x450/f1c40f/000000?text=Jurassic+Park",
        trailerUrl: "https://www.youtube.com/watch?v=lc0UehYemOA"
      },
      {
        id: uuidv4(),
        title: "The Silence of the Lambs",
        description: "A young FBI cadet seeks help from imprisoned cannibal Dr. Lecter.",
        genres: ["Crime", "Drama", "Thriller"],
        releaseDate: "1991-02-14T00:00:00.000Z",
        duration: 118,
        rating: 8.6,
        actors: ["Jodie Foster", "Anthony Hopkins", "Scott Glenn"],
        posterUrl: "https://via.placeholder.com/300x450/95a5a6/ffffff?text=Silence+Lambs",
        trailerUrl: "https://www.youtube.com/watch?v=W6Mm8Sbe__o"
      },
      {
        id: uuidv4(),
        title: "Saving Private Ryan",
        description: "Following D-Day, a group of soldiers search for a paratrooper.",
        genres: ["Drama", "War"],
        releaseDate: "1998-07-24T00:00:00.000Z",
        duration: 169,
        rating: 8.6,
        actors: ["Tom Hanks", "Matt Damon", "Tom Sizemore"],
        posterUrl: "https://via.placeholder.com/300x450/7f8c8d/ffffff?text=Private+Ryan",
        trailerUrl: "https://www.youtube.com/watch?v=9CiW_DgxCnQ"
      },
      {
        id: uuidv4(),
        title: "The Lion King",
        description: "A young lion prince flees his kingdom after his father's murder.",
        genres: ["Animation", "Adventure", "Drama"],
        releaseDate: "1994-06-24T00:00:00.000Z",
        duration: 88,
        rating: 8.5,
        actors: ["Matthew Broderick", "Jeremy Irons", "James Earl Jones"],
        posterUrl: "https://via.placeholder.com/300x450/d35400/ffffff?text=Lion+King",
        trailerUrl: "https://www.youtube.com/watch?v=4sj1MT05lAA"
      },
      {
        id: uuidv4(),
        title: "Gladiator",
        description: "A former Roman general seeks vengeance against the emperor.",
        genres: ["Action", "Adventure", "Drama"],
        releaseDate: "2000-05-05T00:00:00.000Z",
        duration: 155,
        rating: 8.5,
        actors: ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen"],
        posterUrl: "https://via.placeholder.com/300x450/a569bd/ffffff?text=Gladiator",
        trailerUrl: "https://www.youtube.com/watch?v=owK1qxDselE"
      },
      {
        id: uuidv4(),
        title: "The Departed",
        description: "An undercover cop and a police informant try to identify each other.",
        genres: ["Crime", "Drama", "Thriller"],
        releaseDate: "2006-10-06T00:00:00.000Z",
        duration: 151,
        rating: 8.5,
        actors: ["Leonardo DiCaprio", "Matt Damon", "Jack Nicholson"],
        posterUrl: "https://via.placeholder.com/300x450/c0392b/ffffff?text=The+Departed",
        trailerUrl: "https://www.youtube.com/watch?v=auYbpnEwBBg"
      },
      {
        id: uuidv4(),
        title: "The Prestige",
        description: "Two magicians engage in a bitter rivalry.",
        genres: ["Drama", "Mystery", "Thriller"],
        releaseDate: "2006-10-20T00:00:00.000Z",
        duration: 130,
        rating: 8.5,
        actors: ["Christian Bale", "Hugh Jackman", "Scarlett Johansson"],
        posterUrl: "https://via.placeholder.com/300x450/8e44ad/ffffff?text=The+Prestige",
        trailerUrl: "https://www.youtube.com/watch?v=o4gHCmTQDVI"
      },
      {
        id: uuidv4(),
        title: "Whiplash",
        description: "A young drummer enrolls at a music conservatory.",
        genres: ["Drama", "Music"],
        releaseDate: "2014-10-10T00:00:00.000Z",
        duration: 106,
        rating: 8.5,
        actors: ["Miles Teller", "J.K. Simmons", "Melissa Benoist"],
        posterUrl: "https://via.placeholder.com/300x450/f39c12/000000?text=Whiplash",
        trailerUrl: "https://www.youtube.com/watch?v=7d_jQycdQGo"
      },
      {
        id: uuidv4(),
        title: "The Green Mile",
        description: "The lives of guards on Death Row are affected by one of their charges.",
        genres: ["Crime", "Drama", "Fantasy"],
        releaseDate: "1999-12-10T00:00:00.000Z",
        duration: 189,
        rating: 8.6,
        actors: ["Tom Hanks", "Michael Clarke Duncan", "David Morse"],
        posterUrl: "https://via.placeholder.com/300x450/27ae60/ffffff?text=Green+Mile",
        trailerUrl: "https://www.youtube.com/watch?v=Ki4haFrqSrw"
      },
      {
        id: uuidv4(),
        title: "Se7en",
        description: "Two detectives hunt a serial killer who uses the seven deadly sins.",
        genres: ["Crime", "Drama", "Mystery"],
        releaseDate: "1995-09-22T00:00:00.000Z",
        duration: 127,
        rating: 8.6,
        actors: ["Morgan Freeman", "Brad Pitt", "Kevin Spacey"],
        posterUrl: "https://via.placeholder.com/300x450/34495e/ffffff?text=Se7en",
        trailerUrl: "https://www.youtube.com/watch?v=znmZoVkCjpI"
      },
      {
        id: uuidv4(),
        title: "The Usual Suspects",
        description: "A sole survivor tells of the twisty events leading up to a horrific gun battle.",
        genres: ["Crime", "Mystery", "Thriller"],
        releaseDate: "1995-07-19T00:00:00.000Z",
        duration: 106,
        rating: 8.5,
        actors: ["Kevin Spacey", "Gabriel Byrne", "Chazz Palminteri"],
        posterUrl: "https://via.placeholder.com/300x450/e74c3c/ffffff?text=Usual+Suspects",
        trailerUrl: "https://www.youtube.com/watch?v=oiXdPolca5w"
      },
      {
        id: uuidv4(),
        title: "Casablanca",
        description: "A cynical American expatriate struggles to decide whether to help his former lover.",
        genres: ["Drama", "Romance", "War"],
        releaseDate: "1942-11-26T00:00:00.000Z",
        duration: 102,
        rating: 8.5,
        actors: ["Humphrey Bogart", "Ingrid Bergman", "Paul Henreid"],
        posterUrl: "https://via.placeholder.com/300x450/bdc3c7/000000?text=Casablanca",
        trailerUrl: "https://www.youtube.com/watch?v=BkL9l7qovsE"
      },
      {
        id: uuidv4(),
        title: "Schindler's List",
        description: "In German-occupied Poland, Oskar Schindler saves over a thousand Jewish lives.",
        genres: ["Biography", "Drama", "History"],
        releaseDate: "1993-12-15T00:00:00.000Z",
        duration: 195,
        rating: 8.9,
        actors: ["Liam Neeson", "Ralph Fiennes", "Ben Kingsley"],
        posterUrl: "https://via.placeholder.com/300x450/95a5a6/ffffff?text=Schindlers+List",
        trailerUrl: "https://www.youtube.com/watch?v=gG22XNhtnoY"
      },
      {
        id: uuidv4(),
        title: "One Flew Over the Cuckoo's Nest",
        description: "A criminal pleads insanity and is admitted to a mental institution.",
        genres: ["Drama"],
        releaseDate: "1975-11-19T00:00:00.000Z",
        duration: 133,
        rating: 8.7,
        actors: ["Jack Nicholson", "Louise Fletcher", "Danny DeVito"],
        posterUrl: "https://via.placeholder.com/300x450/16a085/ffffff?text=Cuckoos+Nest",
        trailerUrl: "https://www.youtube.com/watch?v=OXrcDonY-B8"
      },
      {
        id: uuidv4(),
        title: "Goodwill Hunting",
        description: "Will Hunting, a janitor at M.I.T., has a gift for mathematics.",
        genres: ["Drama", "Romance"],
        releaseDate: "1997-12-05T00:00:00.000Z",
        duration: 126,
        rating: 8.3,
        actors: ["Robin Williams", "Matt Damon", "Ben Affleck"],
        posterUrl: "https://via.placeholder.com/300x450/3498db/ffffff?text=Good+Will+Hunting",
        trailerUrl: "https://www.youtube.com/watch?v=PaZVjZEFkRs"
      },
      {
        id: uuidv4(),
        title: "The Shining",
        description: "A family heads to an isolated hotel where an evil presence influences the father.",
        genres: ["Drama", "Horror", "Thriller"],
        releaseDate: "1980-05-23T00:00:00.000Z",
        duration: 146,
        rating: 8.4,
        actors: ["Jack Nicholson", "Shelley Duvall", "Danny Lloyd"],
        posterUrl: "https://via.placeholder.com/300x450/e67e22/ffffff?text=The+Shining",
        trailerUrl: "https://www.youtube.com/watch?v=5Cb3ik6zP2I"
      }
    ];
    
    // Sample TV shows (25 TV shows)
    const tvshows = [
      {
        id: uuidv4(),
        title: "Breaking Bad",
        description: "A high school chemistry teacher turned methamphetamine manufacturer.",
        genres: ["Drama", "Crime"],
        seasons: 5,
        episodes: [
          {
            id: uuidv4(),
            title: "Pilot",
            season: 1,
            episode: 1,
            duration: 58,
            releaseDate: "2008-01-20T00:00:00.000Z",
            description: "Walter White begins his journey into the drug trade."
          }
        ],
        rating: 9.5,
        posterUrl: "https://via.placeholder.com/300x450/c0392b/ffffff?text=Breaking+Bad",
        trailerUrl: "https://www.youtube.com/watch?v=HhesaQXLuRY"
      },
      {
        id: uuidv4(),
        title: "Game of Thrones",
        description: "Nine noble families fight for control over the lands of Westeros.",
        genres: ["Action", "Adventure", "Drama"],
        seasons: 8,
        episodes: [
          {
            id: uuidv4(),
            title: "Winter Is Coming",
            season: 1,
            episode: 1,
            duration: 62,
            releaseDate: "2011-04-17T00:00:00.000Z",
            description: "Eddard Stark is torn between his family and an old friend."
          }
        ],
        rating: 9.3,
        posterUrl: "https://via.placeholder.com/300x450/8e44ad/ffffff?text=Game+of+Thrones",
        trailerUrl: "https://www.youtube.com/watch?v=rlR4PJn8b8I"
      },
      {
        id: uuidv4(),
        title: "The Sopranos",
        description: "A New Jersey mob boss seeks therapy while running his criminal organization.",
        genres: ["Crime", "Drama"],
        seasons: 6,
        episodes: [
          {
            id: uuidv4(),
            title: "The Sopranos",
            season: 1,
            episode: 1,
            duration: 58,
            releaseDate: "1999-01-10T00:00:00.000Z",
            description: "Tony Soprano begins therapy with Dr. Melfi."
          }
        ],
        rating: 9.2,
        posterUrl: "https://via.placeholder.com/300x450/34495e/ffffff?text=The+Sopranos",
        trailerUrl: "https://www.youtube.com/watch?v=RDc5CwqzCQk"
      },
      {
        id: uuidv4(),
        title: "The Wire",
        description: "Baltimore drug scene, as seen through the eyes of drug dealers and law enforcement.",
        genres: ["Crime", "Drama", "Thriller"],
        seasons: 5,
        episodes: [
          {
            id: uuidv4(),
            title: "The Target",
            season: 1,
            episode: 1,
            duration: 60,
            releaseDate: "2002-06-02T00:00:00.000Z",
            description: "Detective McNulty begins investigating the Barksdale organization."
          }
        ],
        rating: 9.3,
        posterUrl: "https://via.placeholder.com/300x450/e74c3c/ffffff?text=The+Wire",
        trailerUrl: "https://www.youtube.com/watch?v=zlZdpBarOw0"
      },
      {
        id: uuidv4(),
        title: "Stranger Things",
        description: "When a young boy disappears, his mother and friends uncover supernatural forces.",
        genres: ["Drama", "Fantasy", "Horror"],
        seasons: 4,
        episodes: [
          {
            id: uuidv4(),
            title: "Chapter One: The Vanishing of Will Byers",
            season: 1,
            episode: 1,
            duration: 47,
            releaseDate: "2016-07-15T00:00:00.000Z",
            description: "Will Byers disappears in the small town of Hawkins."
          }
        ],
        rating: 8.7,
        posterUrl: "https://via.placeholder.com/300x450/9b59b6/ffffff?text=Stranger+Things",
        trailerUrl: "https://www.youtube.com/watch?v=b9EkMc79ZSU"
      },
      {
        id: uuidv4(),
        title: "The Office",
        description: "A mockumentary on a group of typical office workers.",
        genres: ["Comedy"],
        seasons: 9,
        episodes: [
          {
            id: uuidv4(),
            title: "Pilot",
            season: 1,
            episode: 1,
            duration: 22,
            releaseDate: "2005-03-24T00:00:00.000Z",
            description: "Michael Scott shows a documentary crew around the office."
          }
        ],
        rating: 8.9,
        posterUrl: "https://via.placeholder.com/300x450/f39c12/000000?text=The+Office",
        trailerUrl: "https://www.youtube.com/watch?v=LHOtME2DL4g"
      },
      {
        id: uuidv4(),
        title: "Friends",
        description: "Follows the personal and professional lives of six friends living in Manhattan.",
        genres: ["Comedy", "Romance"],
        seasons: 10,
        episodes: [
          {
            id: uuidv4(),
            title: "The One Where Monica Gets a Roommate",
            season: 1,
            episode: 1,
            duration: 22,
            releaseDate: "1994-09-22T00:00:00.000Z",
            description: "Monica's friend Rachel leaves her fiancé at the altar."
          }
        ],
        rating: 8.9,
        posterUrl: "https://via.placeholder.com/300x450/3498db/ffffff?text=Friends",
        trailerUrl: "https://www.youtube.com/watch?v=hDNNmeeJs1Q"
      },
      {
        id: uuidv4(),
        title: "The Crown",
        description: "Follows the political rivalries and romance of Queen Elizabeth II's reign.",
        genres: ["Biography", "Drama", "History"],
        seasons: 6,
        episodes: [
          {
            id: uuidv4(),
            title: "Wolferton Splash",
            season: 1,
            episode: 1,
            duration: 57,
            releaseDate: "2016-11-04T00:00:00.000Z",
            description: "A young Princess Elizabeth marries Prince Philip."
          }
        ],
        rating: 8.7,
        posterUrl: "https://via.placeholder.com/300x450/d35400/ffffff?text=The+Crown",
        trailerUrl: "https://www.youtube.com/watch?v=JWtnJjn6ng0"
      },
      {
        id: uuidv4(),
        title: "Sherlock",
        description: "A modern update finds the famous sleuth and his doctor partner solving crime.",
        genres: ["Crime", "Drama", "Mystery"],
        seasons: 4,
        episodes: [
          {
            id: uuidv4(),
            title: "A Study in Pink",
            season: 1,
            episode: 1,
            duration: 88,
            releaseDate: "2010-07-25T00:00:00.000Z",
            description: "Sherlock Holmes and Dr. Watson meet for the first time."
          }
        ],
        rating: 9.1,
        posterUrl: "https://via.placeholder.com/300x450/2c3e50/ffffff?text=Sherlock",
        trailerUrl: "https://www.youtube.com/watch?v=xK7S9mrFWL4"
      },
      {
        id: uuidv4(),
        title: "House of Cards",
        description: "A Congressman works with his wife to exact revenge on those who betrayed him.",
        genres: ["Drama"],
        seasons: 6,
        episodes: [
          {
            id: uuidv4(),
            title: "Chapter 1",
            season: 1,
            episode: 1,
            duration: 68,
            releaseDate: "2013-02-01T00:00:00.000Z",
            description: "Frank Underwood begins his quest for power."
          }
        ],
        rating: 8.7,
        posterUrl: "https://via.placeholder.com/300x450/95a5a6/ffffff?text=House+of+Cards",
        trailerUrl: "https://www.youtube.com/watch?v=ULwUzF1q5w4"
      },
      {
        id: uuidv4(),
        title: "Black Mirror",
        description: "An anthology series exploring a twisted, high-tech multiverse.",
        genres: ["Drama", "SciFi", "Thriller"],
        seasons: 5,
        episodes: [
          {
            id: uuidv4(),
            title: "The National Anthem",
            season: 1,
            episode: 1,
            duration: 44,
            releaseDate: "2011-12-04T00:00:00.000Z",
            description: "The Prime Minister faces an unusual crisis."
          }
        ],
        rating: 8.8,
        posterUrl: "https://via.placeholder.com/300x450/1a1a1a/ffffff?text=Black+Mirror",
        trailerUrl: "https://www.youtube.com/watch?v=jROLrhQkK78"
      },
      {
        id: uuidv4(),
        title: "The Mandalorian",
        description: "The travels of a lone bounty hunter in the outer reaches of the galaxy.",
        genres: ["Action", "Adventure", "SciFi"],
        seasons: 3,
        episodes: [
          {
            id: uuidv4(),
            title: "Chapter 1: The Mandalorian",
            season: 1,
            episode: 1,
            duration: 39,
            releaseDate: "2019-11-12T00:00:00.000Z",
            description: "A Mandalorian bounty hunter tracks a fugitive."
          }
        ],
        rating: 8.7,
        posterUrl: "https://via.placeholder.com/300x450/16a085/ffffff?text=The+Mandalorian",
        trailerUrl: "https://www.youtube.com/watch?v=aOC8E8z_ifw"
      },
      {
        id: uuidv4(),
        title: "Better Call Saul",
        description: "The trials and tribulations of criminal lawyer Jimmy McGill.",
        genres: ["Crime", "Drama"],
        seasons: 6,
        episodes: [
          {
            id: uuidv4(),
            title: "Uno",
            season: 1,
            episode: 1,
            duration: 47,
            releaseDate: "2015-02-08T00:00:00.000Z",
            description: "Jimmy McGill struggles to make ends meet as a lawyer."
          }
        ],
        rating: 8.8,
        posterUrl: "https://via.placeholder.com/300x450/e67e22/ffffff?text=Better+Call+Saul",
        trailerUrl: "https://www.youtube.com/watch?v=HN4oydykJFc"
      },
      {
        id: uuidv4(),
        title: "Westworld",
        description: "Set at the intersection of the near future and the reimagined past.",
        genres: ["Drama", "Mystery", "SciFi"],
        seasons: 4,
        episodes: [
          {
            id: uuidv4(),
            title: "The Original",
            season: 1,
            episode: 1,
            duration: 68,
            releaseDate: "2016-10-02T00:00:00.000Z",
            description: "Guests enjoy the park's offerings while employees question their reality."
          }
        ],
        rating: 8.6,
        posterUrl: "https://via.placeholder.com/300x450/27ae60/ffffff?text=Westworld",
        trailerUrl: "https://www.youtube.com/watch?v=eX3u0IlBBO4"
      },
      {
        id: uuidv4(),
        title: "The Walking Dead",
        description: "Sheriff's deputy Rick Grimes awakens from a coma to find a post-apocalyptic world.",
        genres: ["Drama", "Horror", "Thriller"],
        seasons: 11,
        episodes: [
          {
            id: uuidv4(),
            title: "Days Gone Bye",
            season: 1,
            episode: 1,
            duration: 67,
            releaseDate: "2010-10-31T00:00:00.000Z",
            description: "Rick Grimes wakes up in a zombie apocalypse."
          }
        ],
        rating: 8.2,
        posterUrl: "https://via.placeholder.com/300x450/7f8c8d/ffffff?text=Walking+Dead",
        trailerUrl: "https://www.youtube.com/watch?v=sfAc2U20uyg"
      },
      {
        id: uuidv4(),
        title: "Lost",
        description: "The survivors of a plane crash are forced to work together to survive.",
        genres: ["Adventure", "Drama", "Fantasy"],
        seasons: 6,
        episodes: [
          {
            id: uuidv4(),
            title: "Pilot",
            season: 1,
            episode: 1,
            duration: 81,
            releaseDate: "2004-09-22T00:00:00.000Z",
            description: "Survivors of a plane crash find themselves on a mysterious island."
          }
        ],
        rating: 8.3,
        posterUrl: "https://via.placeholder.com/300x450/1abc9c/ffffff?text=Lost",
        trailerUrl: "https://www.youtube.com/watch?v=KTu8iDynwNc"
      },
      {
        id: uuidv4(),
        title: "Dexter",
        description: "He's smart, he's good looking, and he's got a great sense of humor. He's Dexter Morgan.",
        genres: ["Crime", "Drama", "Mystery"],
        seasons: 8,
        episodes: [
          {
            id: uuidv4(),
            title: "Dexter",
            season: 1,
            episode: 1,
            duration: 54,
            releaseDate: "2006-10-01T00:00:00.000Z",
            description: "Dexter Morgan balances his day job with his nighttime hobby."
          }
        ],
        rating: 8.6,
        posterUrl: "https://via.placeholder.com/300x450/c0392b/ffffff?text=Dexter",
        trailerUrl: "https://www.youtube.com/watch?v=YQeUmSD1c3g"
      },
      {
        id: uuidv4(),
        title: "Mad Men",
        description: "A drama about one of New York's most prestigious ad agencies at the beginning of the 1960s.",
        genres: ["Drama"],
        seasons: 7,
        episodes: [
          {
            id: uuidv4(),
            title: "Smoke Gets in Your Eyes",
            season: 1,
            episode: 1,
            duration: 47,
            releaseDate: "2007-07-19T00:00:00.000Z",
            description: "Don Draper navigates the advertising world of the 1960s."
          }
        ],
        rating: 8.6,
        posterUrl: "https://via.placeholder.com/300x450/2980b9/ffffff?text=Mad+Men",
        trailerUrl: "https://www.youtube.com/watch?v=H6aHYNlClo4"
      },
      {
        id: uuidv4(),
        title: "True Detective",
        description: "Seasonal anthology series in which police investigations unearth secrets.",
        genres: ["Crime", "Drama", "Mystery"],
        seasons: 3,
        episodes: [
          {
            id: uuidv4(),
            title: "The Long Bright Dark",
            season: 1,
            episode: 1,
            duration: 58,
            releaseDate: "2014-01-12T00:00:00.000Z",
            description: "Detectives investigate ritualistic murders in Louisiana."
          }
        ],
        rating: 8.9,
        posterUrl: "https://via.placeholder.com/300x450/f1c40f/000000?text=True+Detective",
        trailerUrl: "https://www.youtube.com/watch?v=TXwCoNwBSkQ"
      },
      {
        id: uuidv4(),
        title: "Fargo",
        description: "Various chronicles of deception, intrigue and murder in and around frozen Minnesota.",
        genres: ["Crime", "Drama", "Thriller"],
        seasons: 4,
        episodes: [
          {
            id: uuidv4(),
            title: "The Crocodile's Dilemma",
            season: 1,
            episode: 1,
            duration: 68,
            releaseDate: "2014-04-15T00:00:00.000Z",
            description: "A meek insurance salesman gets in over his head."
          }
        ],
        rating: 8.9,
        posterUrl: "https://via.placeholder.com/300x450/bdc3c7/000000?text=Fargo",
        trailerUrl: "https://www.youtube.com/watch?v=gKs8DzjPDMU"
      },
      {
        id: uuidv4(),
        title: "The Witcher",
        description: "Geralt of Rivia, a solitary monster hunter, struggles to find his place.",
        genres: ["Action", "Adventure", "Drama"],
        seasons: 3,
        episodes: [
          {
            id: uuidv4(),
            title: "The End's Beginning",
            season: 1,
            episode: 1,
            duration: 60,
            releaseDate: "2019-12-20T00:00:00.000Z",
            description: "Geralt encounters a djinn and meets Yennefer."
          }
        ],
        rating: 8.2,
        posterUrl: "https://via.placeholder.com/300x450/a569bd/ffffff?text=The+Witcher",
        trailerUrl: "https://www.youtube.com/watch?v=ndl1W4ltcmg"
      },
      {
        id: uuidv4(),
        title: "Ozark",
        description: "A financial advisor drags his family to the Missouri Ozarks to launder money.",
        genres: ["Crime", "Drama", "Thriller"],
        seasons: 4,
        episodes: [
          {
            id: uuidv4(),
            title: "Sugarwood",
            season: 1,
            episode: 1,
            duration: 60,
            releaseDate: "2017-07-21T00:00:00.000Z",
            description: "Marty Byrde moves his family to the Ozarks to launder money."
          }
        ],
        rating: 8.4,
        posterUrl: "https://via.placeholder.com/300x450/34495e/ffffff?text=Ozark",
        trailerUrl: "https://www.youtube.com/watch?v=5hAXVqrljbs"
      },
      {
        id: uuidv4(),
        title: "Narcos",
        description: "A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar.",
        genres: ["Biography", "Crime", "Drama"],
        seasons: 3,
        episodes: [
          {
            id: uuidv4(),
            title: "Descenso",
            season: 1,
            episode: 1,
            duration: 57,
            releaseDate: "2015-08-28T00:00:00.000Z",
            description: "DEA agents track Pablo Escobar's rise to power."
          }
        ],
        rating: 8.8,
        posterUrl: "https://via.placeholder.com/300x450/e74c3c/ffffff?text=Narcos",
        trailerUrl: "https://www.youtube.com/watch?v=xl8zdCY-abw"
      },
      {
        id: uuidv4(),
        title: "The Boys",
        description: "A group of vigilantes set out to take down corrupt superheroes.",
        genres: ["Action", "Comedy", "Crime"],
        seasons: 3,
        episodes: [
          {
            id: uuidv4(),
            title: "The Name of the Game",
            season: 1,
            episode: 1,
            duration: 61,
            releaseDate: "2019-07-26T00:00:00.000Z",
            description: "Hughie Campbell's life is shattered by a superhero."
          }
        ],
        rating: 8.7,
        posterUrl: "https://via.placeholder.com/300x450/8e44ad/ffffff?text=The+Boys",
        trailerUrl: "https://www.youtube.com/watch?v=tcrNsIaQkb4"
      },
      {
        id: uuidv4(),
        title: "Squid Game",
        description: "Hundreds of cash-strapped players accept an invitation to compete in children's games.",
        genres: ["Action", "Drama", "Mystery"],
        seasons: 1,
        episodes: [
          {
            id: uuidv4(),
            title: "Red Light, Green Light",
            season: 1,
            episode: 1,
            duration: 59,
            releaseDate: "2021-09-17T00:00:00.000Z",
            description: "Desperate contestants enter a deadly competition."
          }
        ],
        rating: 8.0,
        posterUrl: "https://via.placeholder.com/300x450/e67e22/ffffff?text=Squid+Game",
        trailerUrl: "https://www.youtube.com/watch?v=oqxAJKy0ii4"
      }
    ];
    
    // Write files
    fs.writeFileSync(path.join(dataDir, 'movies.json'), JSON.stringify(movies, null, 2));
    fs.writeFileSync(path.join(dataDir, 'tvshows.json'), JSON.stringify(tvshows, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Sample data created successfully',
      data: { movies: movies.length, tvshows: tvshows.length }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/my-list', myListRoutes);
app.use('/api', contentRoutes);

// 404 handler
app.use('*', (req, res) => {
  const response: ApiResponse = {
    success: false,
    error: 'Endpoint not found'
  };
  res.status(404).json(response);
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  const response: ApiResponse = {
    success: false,
    error: 'Internal server error'
  };
  
  res.status(500).json(response);
});

export default app;
