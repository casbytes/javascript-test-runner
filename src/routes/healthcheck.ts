import { Hono } from "hono";

const healtcheck = new Hono();

healtcheck.get("/", async (c) => {
  const host =
    c.req.header("X-Forwarded-Host") ?? c.req.header("host") ?? "localhost";
  console.log("Healthcheck", host);

  try {
    await Promise.all([
      //some other checks
      fetch(`${new URL(c.req.url).protocol}${host}`, {
        method: "HEAD",
        headers: { "X-Healthcheck": "true" },
      }).then((r) => {
        if (!r.ok) return Promise.reject(r);
      }),
    ]);
    return new Response("OK");
  } catch (error: unknown) {
    console.error(c.req.url, "healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
});

export { healtcheck };
