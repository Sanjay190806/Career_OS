import app from './app.js';
import { env } from './config/env.js';

const port = env.PORT;
console.log(`Groq configured: ${Boolean(env.GROQ_API_KEY?.trim())}`);

app.listen(port, () => {
  console.log(`Server started in ${env.NODE_ENV} mode on port ${port}`);
});
