import request from 'supertest';
import app from '../app';
import { FileStorage } from '../config/fileStorage';
import { cache } from '../config/cache';
import { v4 as uuidv4 } from 'uuid';

describe('My List API Integration Tests (File-based)', () => {
  let testUserId: string;
  let testMovieId: string;
  let testTVShowId: string;

  beforeAll(async () => {
    // Create test data
    testUserId = 'test-user-' + uuidv4();
    testMovieId = uuidv4();
    testTVShowId = uuidv4();

    // Create test user
    const testUser = {
      id: testUserId,
      username: 'testuser',
      preferences: {
        favoriteGenres: ['Action', 'Comedy'],
        dislikedGenres: ['Horror']
      },
      watchHistory: []
    };
    await FileStorage.writeFile('users.json', [testUser]);

    // Create test movie
    const testMovie = {
      id: testMovieId,
      title: 'Test Movie',
      description: 'A test movie for integration testing',
      genres: ['Action', 'Comedy'],
      releaseDate: new Date('2023-01-01'),
      director: 'Test Director',
      actors: ['Actor 1', 'Actor 2'],
      posterUrl: 'https://example.com/poster.jpg',
      backdropUrl: 'https://example.com/backdrop.jpg'
    };
    await FileStorage.writeFile('movies.json', [testMovie]);

    // Create test TV show
    const testTVShow = {
      id: testTVShowId,
      title: 'Test TV Show',
      description: 'A test TV show for integration testing',
      genres: ['Drama', 'SciFi'],
      posterUrl: 'https://example.com/poster.jpg',
      backdropUrl: 'https://example.com/backdrop.jpg',
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2023-01-01'),
          director: 'Episode Director',
          actors: ['Actor 3', 'Actor 4']
        }
      ]
    };
    await FileStorage.writeFile('tvshows.json', [testTVShow]);
  });

  afterAll(async () => {
    // Clean up test data
    await FileStorage.writeFile('mylist.json', []);
    await FileStorage.writeFile('users.json', []);
    await FileStorage.writeFile('movies.json', []);
    await FileStorage.writeFile('tvshows.json', []);
  });

  beforeEach(async () => {
    // Clear my_list for each test
    await FileStorage.writeFile('mylist.json', []);
    // Clear cache
    cache.clear();
  });

  describe('POST /api/my-list/:userId/add', () => {
    it('should add a movie to my list successfully', async () => {
      const response = await request(app)
        .post(`/api/my-list/${testUserId}/add`)
        .send({
          contentId: testMovieId,
          contentType: 'movie'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contentId).toBe(testMovieId);
      expect(response.body.data.contentType).toBe('movie');
      expect(response.body.data.userId).toBe(testUserId);
    });

    it('should add a TV show to my list successfully', async () => {
      const response = await request(app)
        .post(`/api/my-list/${testUserId}/add`)
        .send({
          contentId: testTVShowId,
          contentType: 'tvshow'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.contentId).toBe(testTVShowId);
      expect(response.body.data.contentType).toBe('tvshow');
    });

    it('should return 409 when adding duplicate item', async () => {
      // Add item first time
      await request(app)
        .post(`/api/my-list/${testUserId}/add`)
        .send({
          contentId: testMovieId,
          contentType: 'movie'
        });

      // Try to add same item again
      const response = await request(app)
        .post(`/api/my-list/${testUserId}/add`)
        .send({
          contentId: testMovieId,
          contentType: 'movie'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });

    it('should return 404 for non-existent content', async () => {
      const response = await request(app)
        .post(`/api/my-list/${testUserId}/add`)
        .send({
          contentId: '550e8400-e29b-41d4-a716-446655440000',
          contentType: 'movie'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 for invalid request data', async () => {
      const response = await request(app)
        .post(`/api/my-list/${testUserId}/add`)
        .send({
          contentId: 'invalid-uuid',
          contentType: 'invalid-type'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/my-list/:userId/remove', () => {
    beforeEach(async () => {
      // Add test item to remove
      await request(app)
        .post(`/api/my-list/${testUserId}/add`)
        .send({
          contentId: testMovieId,
          contentType: 'movie'
        });
    });

    it('should remove item from my list successfully', async () => {
      const response = await request(app)
        .delete(`/api/my-list/${testUserId}/remove`)
        .send({
          contentId: testMovieId,
          contentType: 'movie'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('removed');
    });

    it('should return 404 when removing non-existent item', async () => {
      const response = await request(app)
        .delete(`/api/my-list/${testUserId}/remove`)
        .send({
          contentId: testTVShowId,
          contentType: 'tvshow'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/my-list/:userId', () => {
    beforeEach(async () => {
      // Add multiple test items
      await request(app)
        .post(`/api/my-list/${testUserId}/add`)
        .send({
          contentId: testMovieId,
          contentType: 'movie'
        });

      await request(app)
        .post(`/api/my-list/${testUserId}/add`)
        .send({
          contentId: testTVShowId,
          contentType: 'tvshow'
        });
    });

    it('should get my list successfully with default pagination', async () => {
      const response = await request(app)
        .get(`/api/my-list/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(20);
      expect(response.body.data.pagination.total).toBe(2);
      expect(response.body.data.pagination.totalPages).toBe(1);
    });

    it('should get my list with custom pagination', async () => {
      const response = await request(app)
        .get(`/api/my-list/${testUserId}?page=1&limit=1`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
      expect(response.body.data.pagination.total).toBe(2);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should include content details in response', async () => {
      const response = await request(app)
        .get(`/api/my-list/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data[0].content).toBeDefined();
      expect(response.body.data.data[0].content.title).toBeDefined();
      expect(response.body.data.data[0].content.genres).toBeDefined();
    });

    it('should return empty list for user with no items', async () => {
      // Clear the list first
      await FileStorage.writeFile('mylist.json', []);

      const response = await request(app)
        .get(`/api/my-list/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(0);
      expect(response.body.data.pagination.total).toBe(0);
    });

    it('should use cache on subsequent requests', async () => {
      // First request
      const response1 = await request(app)
        .get(`/api/my-list/${testUserId}`);

      expect(response1.status).toBe(200);

      // Second request should use cache
      const response2 = await request(app)
        .get(`/api/my-list/${testUserId}`);

      expect(response2.status).toBe(200);
      expect(response2.body.data.pagination.total).toBe(response1.body.data.pagination.total);
    });
  });
});
