import { criarApp } from './app.js';
import { env } from './config/env.js';

const app = criarApp();

app.listen(env.PORT, () => {
  console.log(`API a correr em http://localhost:${env.PORT}/api/v1`);
});
