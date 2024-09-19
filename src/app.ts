import "dotenv/config";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { checker, healtcheck } from "./routes";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Test runner." });
});
app.route("/checker", checker);
app.route("/healthcheck", healtcheck);

app.get("*", () => {
  throw new HTTPException(404, { message: "Route not found." });
});

export { app };
