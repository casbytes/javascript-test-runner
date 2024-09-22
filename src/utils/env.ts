import { z } from "zod";

export const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"] as const),
  PORT: z.string(),
  BASE_URL: z.string(),
  QSTASH_NEXT_SIGNING_KEY: z.string(),
  QSTASH_CURRENT_SIGNING_KEY: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );

    throw new Error("Invalid environment variables");
  }
}
