import app from "./app.js";
import { PORT } from "./config/index.js";

const main = async () => {
  try {
    app.listen(PORT);
    console.info(`Server on http://localhost:${PORT}`);
  } catch (error) {
    console.error(error);
  }
};

main();
