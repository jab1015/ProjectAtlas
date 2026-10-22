const GENERATED_SURVEY_PREFIX = /^InventSmith prepared this short survey because the current evidence score is /i;

const STABLE_SURVEY_INTRODUCTION =
  "InventSmith prepared this short survey to learn how people experience the problem and what would make a solution useful. Responses are collected as customer-validation signals and are not independently verified.";

export function publicSurveyIntroduction(introduction: string): string {
  return GENERATED_SURVEY_PREFIX.test(introduction) ? STABLE_SURVEY_INTRODUCTION : introduction;
}
