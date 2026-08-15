import { cronJobs, makeFunctionReference } from "convex/server";

const crons = cronJobs();
const resumeEligibleInventions = makeFunctionReference<"action", Record<string, never>, unknown>("autonomyMaintenance:resumeEligibleInventions");

crons.interval("Atlas autonomous recovery", { minutes: 15 }, resumeEligibleInventions, {});

export default crons;
