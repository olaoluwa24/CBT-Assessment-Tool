import { Router, type IRouter, Request, Response } from "express"; // Added Request, Response
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Added Request and Response types to the parameters
router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
