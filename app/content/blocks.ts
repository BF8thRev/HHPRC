import { z } from "zod";

// Registry of the fixed block types editors can pick from. Editors choose a
// type and fill in its fields; they never control layout, colors or fonts.
// Block types are added in the content phase; the AI update box validates
// every proposed edit against these schemas.
export const blockSchemas = {} satisfies Record<string, z.ZodType>;

export type BlockType = keyof typeof blockSchemas;
