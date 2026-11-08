import { table, t } from 'spacetimedb/server';

export const demoAlertSettings = table(
  { name: 'demo_alert_settings', public: false },
  {
    owner: t.identity().primaryKey(),
    cardBalanceRising: t.bool(),
  }
);
