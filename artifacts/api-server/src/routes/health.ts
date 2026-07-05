import { Router, type IRouter, Request, Response } from "express"; // Make sure Request, Response are here
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req: Request, res: Response) => { // Make sure these are here
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
