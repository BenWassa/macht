import { TRAINING_TEMPLATES } from "./exercises";
import type { SessionLog, TemplatePlan } from "./types";

const ROTATION = TRAINING_TEMPLATES.filter(
  (template) => !template.isMinimumSession,
);

function matchesTemplate(session: SessionLog, template: TemplatePlan): boolean {
  return session.template.startsWith(template.name);
}

export function getNextTrainingTemplate(
  sessions: SessionLog[],
): TemplatePlan {
  const lastRotationSession = [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .find((session) =>
      ROTATION.some((template) => matchesTemplate(session, template)),
    );

  if (!lastRotationSession) return ROTATION[0] ?? TRAINING_TEMPLATES[0];

  const currentIndex = ROTATION.findIndex((template) =>
    matchesTemplate(lastRotationSession, template),
  );
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % ROTATION.length;

  return ROTATION[nextIndex] ?? ROTATION[0] ?? TRAINING_TEMPLATES[0];
}
