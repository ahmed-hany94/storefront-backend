import cookieParser from 'cookie-parser';
import express, { Express, json } from 'express';

import { PORT } from './modules/constants';
import { connect_db } from './db';
import { router } from './routes';

// Connect to database
(async function () {
  if ((await connect_db()) === false) {
    process.exit(process.exitCode);
  }
})();

// Setup express server
const app: Express = express();

app.use(json());
app.use(cookieParser());

app.use('/api', router);

app.listen(PORT, function () {
  console.log(`Listening on http://localhost:${PORT}`);
});

export { app };
