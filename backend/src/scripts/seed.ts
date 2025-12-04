import { FileStorage } from '../config/fileStorage';
import { Genre, User, Movie, TVShow } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface SeedUser extends Omit<User, 'id'> {
  id?: string;
}

interface SeedMovie extends Omit<Movie, 'id' | 'releaseDate'> {
  id?: string;
  releaseDate: string;
}

interface SeedTVShow extends Omit<TVShow, 'id' | 'episodes'> {
  id?: string;
  episodes: Array<{
    episodeNumber: number;
    seasonNumber: number;
    releaseDate: string;
    director: string;
    actors: string[];
  }>;
}

const seedUsers: SeedUser[] = [
  {
    id: 'john_doe',
    username: 'john_doe',
    preferences: {
      favoriteGenres: ['Action', 'SciFi'],
      dislikedGenres: ['Horror']
    },
    watchHistory: []
  },
  {
    id: 'jane_smith',
    username: 'jane_smith',
    preferences: {
      favoriteGenres: ['Romance', 'Comedy'],
      dislikedGenres: ['Action', 'Horror']
    },
    watchHistory: []
  },
  {
    id: 'movie_buff',
    username: 'movie_buff',
    preferences: {
      favoriteGenres: ['Drama', 'Fantasy'],
      dislikedGenres: []
    },
    watchHistory: []
  }
];

const seedMovies: SeedMovie[] = [
  {
    id: '13a07c8d-f360-42ff-80ff-59db8e779c1f',
    title: 'The Matrix',
    description: 'A computer programmer discovers that reality as he knows it is a simulation.',
    genres: ['Action', 'SciFi'],
    releaseDate: '1999-03-31',
    director: 'The Wachowskis',
    actors: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop&crop=center',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=450&fit=crop&crop=center'
  },
  {
    id: 'e1ad42f6-f0bf-470a-8820-b79eef7c1fe7',
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption.',
    genres: ['Drama'],
    releaseDate: '1994-09-23',
    director: 'Frank Darabont',
    actors: ['Tim Robbins', 'Morgan Freeman'],
    posterUrl: 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=300&h=450&fit=crop&crop=center',
    backdropUrl: 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=800&h=450&fit=crop&crop=center'
  },
  {
    id: 'f2be53c7-e1c8-4a1b-9f3d-8e4a5b6c7d8e',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through dream-sharing technology.',
    genres: ['Action', 'SciFi', 'Drama'],
    releaseDate: '2010-07-16',
    director: 'Christopher Nolan',
    actors: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop&crop=center',
    backdropUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=450&fit=crop&crop=center'
  },
  {
    id: 'a3b4c5d6-e7f8-9a0b-1c2d-3e4f5a6b7c8d',
    title: 'The Princess Bride',
    description: 'A classic fairy tale adventure with romance, comedy, and sword fighting.',
    genres: ['Romance', 'Comedy', 'Fantasy'],
    releaseDate: '1987-09-25',
    director: 'Rob Reiner',
    actors: ['Cary Elwes', 'Robin Wright', 'Mandy Patinkin'],
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop&crop=center',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=450&fit=crop&crop=center'
  },
  {
    id: 'b4c5d6e7-f8a9-0b1c-2d3e-4f5a6b7c8d9e',
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, and others intertwine in Los Angeles.',
    genres: ['Drama', 'Comedy'],
    releaseDate: '1994-10-14',
    director: 'Quentin Tarantino',
    actors: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman'],
    posterUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=450&fit=crop&crop=center',
    backdropUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=450&fit=crop&crop=center'
  }
];

const seedTVShows: SeedTVShow[] = [
  {
    id: '3312dd2f-c0be-45f2-a0f2-d9347cc17fab',
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher turned methamphetamine manufacturer.',
    genres: ['Drama'],
    posterUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=450&fit=crop&crop=center',
    backdropUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=450&fit=crop&crop=center',
    episodes: [
      {
        episodeNumber: 1,
        seasonNumber: 1,
        releaseDate: '2008-01-20',
        director: 'Vince Gilligan',
        actors: ['Bryan Cranston', 'Aaron Paul']
      },
      {
        episodeNumber: 2,
        seasonNumber: 1,
        releaseDate: '2008-01-27',
        director: 'Adam Bernstein',
        actors: ['Bryan Cranston', 'Aaron Paul']
      }
    ]
  },
  {
    id: '4423ee3f-d1cf-46f3-b1f3-ea48dd28fcbc',
    title: 'Stranger Things',
    description: 'A group of kids in a small town uncover supernatural mysteries.',
    genres: ['SciFi', 'Horror', 'Drama'],
    posterUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop&crop=center',
    backdropUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop&crop=center',
    episodes: [
      {
        episodeNumber: 1,
        seasonNumber: 1,
        releaseDate: '2016-07-15',
        director: 'The Duffer Brothers',
        actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'David Harbour']
      },
      {
        episodeNumber: 2,
        seasonNumber: 1,
        releaseDate: '2016-07-15',
        director: 'The Duffer Brothers',
        actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'David Harbour']
      }
    ]
  },
  {
    id: '5534ff4g-e2d0-47g4-c2g4-fb59ee39gdcd',
    title: 'The Office',
    description: 'A mockumentary about office employees in Scranton, Pennsylvania.',
    genres: ['Comedy'],
    posterUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=300&h=450&fit=crop&crop=center',
    backdropUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&h=450&fit=crop&crop=center',
    episodes: [
      {
        episodeNumber: 1,
        seasonNumber: 1,
        releaseDate: '2005-03-24',
        director: 'Ken Kwapis',
        actors: ['Steve Carell', 'John Krasinski', 'Jenna Fischer']
      },
      {
        episodeNumber: 2,
        seasonNumber: 1,
        releaseDate: '2005-03-29',
        director: 'Ken Kwapis',
        actors: ['Steve Carell', 'John Krasinski', 'Jenna Fischer']
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting file-based database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await FileStorage.writeFile('mylist', []);
    await FileStorage.writeFile('users', []);
    await FileStorage.writeFile('movies', []);
    await FileStorage.writeFile('tvshows', []);

    // Seed users
    console.log('👥 Seeding users...');
    const users: User[] = seedUsers.map(user => ({
      ...user,
      id: user.id || uuidv4(),
      watchHistory: user.watchHistory.map(wh => ({
        ...wh,
        watchedOn: new Date(wh.watchedOn || Date.now())
      }))
    }));

    await FileStorage.writeFile('users', users);
    users.forEach(user => console.log(`  ✅ Created user: ${user.username}`));

    // Seed movies
    console.log('🎬 Seeding movies...');
    const movies: Movie[] = seedMovies.map(movie => ({
      ...movie,
      id: uuidv4(),
      releaseDate: new Date(movie.releaseDate)
    }));

    await FileStorage.writeFile('movies', movies);
    movies.forEach(movie => console.log(`  ✅ Created movie: ${movie.title}`));

    // Seed TV shows
    console.log('📺 Seeding TV shows...');
    const tvShows: TVShow[] = seedTVShows.map(tvShow => ({
      ...tvShow,
      id: uuidv4(),
      episodes: tvShow.episodes.map(ep => ({
        ...ep,
        releaseDate: new Date(ep.releaseDate)
      }))
    }));

    await FileStorage.writeFile('tvshows', tvShows);
    tvShows.forEach(tvShow => console.log(`  ✅ Created TV show: ${tvShow.title}`));

    // Seed some my list items
    console.log('⭐ Seeding My List items...');
    const myListItems = [];
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Add some movies to my list
      const movieCount = Math.min(2, movies.length);
      for (let j = 0; j < movieCount; j++) {
        myListItems.push({
          id: uuidv4(),
          userId: user.id,
          contentId: movies[j].id,
          contentType: 'movie' as const,
          addedAt: new Date().toISOString()
        });
      }

      // Add some TV shows to my list
      const tvShowCount = Math.min(1, tvShows.length);
      for (let j = 0; j < tvShowCount; j++) {
        myListItems.push({
          id: uuidv4(),
          userId: user.id,
          contentId: tvShows[j].id,
          contentType: 'tvshow' as const,
          addedAt: new Date().toISOString()
        });
      }
    }

    await FileStorage.writeFile('mylist', myListItems);

    console.log('🎉 File-based database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Movies: ${movies.length}`);
    console.log(`  - TV Shows: ${tvShows.length}`);
    console.log(`  - My List Items: ${myListItems.length}`);

    // Display sample user IDs for testing
    console.log('\n🔑 Sample User IDs for testing:');
    users.forEach(user => {
      console.log(`  ${user.username}: ${user.id}`);
    });

    console.log('\n📁 Data files created in: backend/data/');
    console.log('  - users.json');
    console.log('  - movies.json');
    console.log('  - tvshows.json');
    console.log('  - mylist.json');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
