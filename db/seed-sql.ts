import { z } from "zod";

export const seedEnvs = ["local", "preview", "prod"] as const;
export type SeedEnv = (typeof seedEnvs)[number];

export const seedOptionsSchema = z
  .object({
    env: z.enum(seedEnvs),
    adminEmail: z
      .email()
      .transform((email) => email.toLowerCase())
      .optional(),
    confirm: z.boolean().default(false),
  })
  .refine((opts) => opts.env !== "prod" || opts.confirm, {
    message: "Seeding prod requires --confirm",
    path: ["confirm"],
  });

export type SeedOptions = z.infer<typeof seedOptionsSchema>;

export function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

// Builds idempotent SQL so the seed can be re-run safely on any environment.
export function buildSeedSql(opts: SeedOptions, now: Date = new Date()): string {
  const ts = Math.floor(now.getTime() / 1000);
  const statements = [
    `INSERT INTO app_meta (key, value, updated_at) VALUES ('seeded_at', ${sqlString(now.toISOString())}, ${ts})
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
  ];

  if (opts.adminEmail) {
    // TODO(auth phase): create the first admin user + admin role here once the
    // Better Auth tables exist. The first admin is only ever created by this command.
    statements.push(
      `INSERT INTO app_meta (key, value, updated_at) VALUES ('pending_first_admin', ${sqlString(opts.adminEmail)}, ${ts})
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
    );
  }

  return statements.join("\n") + "\n";
}

export function wranglerArgs(env: SeedEnv, file: string): string[] {
  const target = env === "local" ? ["--local"] : ["--remote"];
  const wranglerEnv = env === "preview" ? ["--env", "preview"] : [];
  return ["d1", "execute", "DB", ...target, ...wranglerEnv, "--file", file, "--yes"];
}
