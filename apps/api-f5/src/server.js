import { app } from './app.js';
import { serveApi } from '../../../scripts/serve-api.js';
serveApi(app, 'F5', 8001);
