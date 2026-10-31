import { z } from "zod";
import {
  emptyMobilityApplication,
  type MobilityApplication,
} from "./mobility-application";
const strings = [
  "type",
  "businessType",
  "name",
  "description",
  "location",
  "title",
  "category",
  "make",
  "model",
  "operator",
  "terms",
  "unit",
  "contactName",
  "phone",
  "email",
] as const;
const numbers = ["year", "passengers", "cargoKg", "rate"] as const;
const normalized = z.object({
  ...(Object.fromEntries(strings.map((key) => [key, z.string()])) as Record<
    (typeof strings)[number],
    z.ZodString
  >),
  ...(Object.fromEntries(
    numbers.map((key) => [
      key,
      z.number().int().nonnegative().safe().nullable(),
    ]),
  ) as Record<(typeof numbers)[number], z.ZodNullable<z.ZodNumber>>),
  serviceAreas: z.array(z.string()),
  publishPhone: z.boolean(),
});
export function mobilityDraft(
  draft: MobilityApplication,
  publishPhone: boolean,
) {
  return normalized.parse({
    ...Object.fromEntries(strings.map((key) => [key, draft[key].trim()])),
    ...Object.fromEntries(
      numbers.map((key) => [
        key,
        draft[key].trim() ? Number(draft[key].replaceAll(",", "")) : null,
      ]),
    ),
    serviceAreas: draft.areas
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
    publishPhone,
  });
}
export function restoreMobilityDraft(input: unknown) {
  const value = normalized.parse(input);
  const draft = emptyMobilityApplication();
  for (const key of strings) draft[key] = value[key];
  for (const key of numbers)
    draft[key] = value[key] === null ? "" : String(value[key]);
  draft.areas = value.serviceAreas.join(", ");
  return { draft, publishPhone: value.publishPhone };
}
