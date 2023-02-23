import { Router } from 'express';

import { searchGoogle, searchGoogleV2 } from '../controllers';

const apiRouter = Router();

apiRouter.post('/v1/search', searchGoogle);
apiRouter.post('/v2/search', searchGoogleV2);

export default apiRouter;
