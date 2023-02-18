import { Router } from 'express';

import { searchGoogle } from '../controllers';

const apiRouter = Router();

apiRouter.post('/search', searchGoogle);

export default apiRouter;
