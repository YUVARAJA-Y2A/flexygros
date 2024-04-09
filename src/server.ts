import Logger from './core/Logger';
import { port } from './config';
import app from './app';

app
  .listen(port, () => {
    Logger.info(`Server Running on Port : ${port}`);
  })
  .on('error', (e) => Logger.error(e));
