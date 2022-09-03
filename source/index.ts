import http from 'http';
import express,{ Express } from 'express';
import morgan from 'morgan';
import {router} from './routes/products';
import {router as admin} from './routes/vendingMachine';

const app = express();
app.use(express.json());
app.use('/', admin)
app.use('/', router)
const httpServer = http.createServer(app);
const PORT: any = process.env.PORT ?? 6060;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));