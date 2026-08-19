import { createApp } from './app/create-app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`API đang chạy tại http://localhost:${env.port}`);
});
