import type { PersonalizationConfidence } from "./types";

export function personalizationConfidence(
  evidenceCount: number,
): PersonalizationConfidence {
  if (evidenceCount < 3) return "insufficient";
  if (evidenceCount < 6) return "emerging";
  return "established";
}

export const confidenceCopy = (
  confidence: PersonalizationConfidence,
): string => {
  switch (confidence) {
    case "established":
      return "Repeated observations support this pattern.";
    case "emerging":
      return "A pattern may be forming, but more completed training is needed.";
    case "insufficient":
    default:
      return "There is not enough completed training evidence to personalize this yet.";
  }
};
