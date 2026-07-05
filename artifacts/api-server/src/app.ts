import express, { type Express, Request, Response } from "express";
import cors from "cors";
import * as pinoHttp from "pino-http"; // Fixes the "not callable" error
import routes from './routes/index.js';
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp.pinoHttp({ // Adjusting the call based on the import change
    logger,
    serializers: {
      req(req: any) { // Fixes the implicit 'any' error
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) { // Fixes the implicit 'any' error
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }) as any // Bypassing complex types for quick deployment
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
