import { Router } from 'express';
import { ContentController } from '../controllers/contentController';
import { validateGetMyList } from '../middleware/validation';

const router = Router();

/**
 * @route GET /api/movies
 * @desc Get all movies with pagination
 * @access Public (in real app, would be authenticated)
 */
router.get('/movies', validateGetMyList, ContentController.getMovies);

/**
 * @route GET /api/tvshows
 * @desc Get all TV shows with pagination
 * @access Public (in real app, would be authenticated)
 */
router.get('/tvshows', validateGetMyList, ContentController.getTVShows);

/**
 * @route GET /api/content
 * @desc Get all content (movies + TV shows) with pagination
 * @access Public (in real app, would be authenticated)
 */
router.get('/content', validateGetMyList, ContentController.getAllContent);

export default router;
