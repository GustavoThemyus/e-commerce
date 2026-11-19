import "dotenv/config";
import app from "./app.js";
import { parsePort } from "./shared/config/env.js";

const PORT = parsePort(process.env.PORT);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});