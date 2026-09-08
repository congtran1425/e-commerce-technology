import { createApp } from './app/create-app.js';
import { database } from './config/database.js';
import { env } from './config/env.js';
import { startPaymentReconciliation } from './modules/orders/order.reconciliation.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`API đang chạy tại http://localhost:${env.port}`);
});
const stopPaymentReconciliation = startPaymentReconciliation();

let shuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  stopPaymentReconciliation();
  console.log(`Nhận ${signal}; đang dừng API an toàn.`);

  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();

  server.close(async (error) => {
    await database.$disconnect();
    if (error) {
      console.error('Không thể dừng HTTP server sạch sẽ.', error);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
