import { Router } from 'express';
import { MyListController } from '../controllers/myListController';
import { 
  validateAddToMyList, 
  validateRemoveFromMyList, 
  validateGetMyList, 
  validateUserId 
} from '../middleware/validation';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Add item to My List
router.post(
  '/:userId/add',
  optionalAuth,
  validateUserId,
  validateAddToMyList,
  MyListController.addToMyList
);

// Remove item from My List
router.delete(
  '/:userId/remove',
  optionalAuth,
  validateUserId,
  validateRemoveFromMyList,
  MyListController.removeFromMyList
);

// Get user's My List with pagination
router.get(
  '/:userId',
  optionalAuth,
  validateUserId,
  validateGetMyList,
  MyListController.getMyList
);

export default router;
