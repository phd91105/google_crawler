import app from "./app";
import { PORT } from "./config";

const main = async () => {
  try {
    app.listen(PORT);
    console.info(`Server on http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
  }
};

main();
