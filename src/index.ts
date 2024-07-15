import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { exec } from "./exec";
import path from "node:path";
import fs from "node:fs";
import fsExtra from "fs-extra";

const app = new Hono();

app.get("/", async (c) => {
  return c.text("Hello Hono!");
});

const port = Number(process.env.PORT) ?? 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
