import { randomUUID } from "crypto";

export const requestContext = (req, res, next) => {
  const incomingId = req.get("x-request-id");
  const requestId = incomingId || randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};
