import { env } from '../../config/env.js';
import { reconcileExpiredPayments } from './order.service.js';

const RECONCILIATION_INTERVAL_MS = 60_000;

export function startPaymentReconciliation() {
  if (!env.zaloPay) return () => undefined;

  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await reconcileExpiredPayments();
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => void run(), RECONCILIATION_INTERVAL_MS);
  timer.unref();
  void run();
  return () => clearInterval(timer);
}
