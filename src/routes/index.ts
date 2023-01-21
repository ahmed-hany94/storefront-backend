import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

router.route('/').get(function (req: Request, res: Response) {
  res.send('Hello World!');
});

export { router };
