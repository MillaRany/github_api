import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

type RequestProperty = 'body' | 'params' | 'query';

function validate(schema: z.ZodObject<any, any>, property: RequestProperty = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[property]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => ({
          message: `${issue.path.join('.')} is ${issue.message}`,
        }))
        res.status(400).json({ error: 'Invalid data', details: errorMessages });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
}

export const validateBody = (schema: z.ZodObject<any, any>) => validate(schema, 'body');
export const validateParams = (schema: z.ZodObject<any, any>) => validate(schema, 'params');
export const validateQuery = (schema: z.ZodObject<any, any>) => validate(schema, 'query');