import app from './app';
import { port } from './config';

const main = async () => {
  try {
    app.listen(port);
    console.info(`Server on http://localhost:${port}`);
  } catch (error) {
    console.error(error);
  }
};

main();
