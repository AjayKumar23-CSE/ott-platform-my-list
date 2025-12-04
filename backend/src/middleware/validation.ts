import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const schemas = {
  addToMyList: Joi.object({
    contentId: Joi.string().uuid().required(),
    contentType: Joi.string().valid('movie', 'tvshow').required()
  }),

  removeFromMyList: Joi.object({
    contentId: Joi.string().uuid().required(),
    contentType: Joi.string().valid('movie', 'tvshow').required()
  }),

  getMyList: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(20)
  }),

  userId: Joi.string().min(1).required()
};

export const validateAddToMyList = (req: Request, res: Response, next: NextFunction) => {
  const { error } = schemas.addToMyList.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

export const validateRemoveFromMyList = (req: Request, res: Response, next: NextFunction) => {
  const { error } = schemas.removeFromMyList.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  next();
};

export const validateGetMyList = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = schemas.getMyList.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  req.query = value;
  next();
};

export const validateUserId = (req: Request, res: Response, next: NextFunction) => {
  const { error } = schemas.userId.validate(req.params.userId);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID format'
    });
  }
  next();
};
