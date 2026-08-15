const rawBase = process.argv[2] || process.env.CONVEX_SITE_URL || "";

function fail(message) {
  console.error(`FAIL  ${message}`);
  process.exitCode = 1;
}

if (!rawBase) {
  fail("Provide the Convex site URL as the first argument or CONVEX_SITE_URL.");
  process.exit();
}

let base;
try {
  base = new URL(rawBase);
} catch {
  fail("Convex site URL is invalid.");
  process.exit();
}

if (base.protocol !== "https:" || !/\.convex\.site$/i.test(base.hostname)) {
  fail("Live verification only accepts an HTTPS convex.site endpoint.");
  process.exit();
}

base.pathname = "/api/health";
base.search = "";
base.hash = "";

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);

try {
  const response = await fetch(base, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: controller.signal,
    redirect: "error",
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    fail(`Health endpoint returned non-JSON content (HTTP ${response.status}).`);
    process.exit();
  }

  const checks = [
    [response.status === 200, `HTTP status ${response.status} (expected 200)`],
    [payload?.ok === true, `ok=${String(payload?.ok)} (expected true)`],
    [payload?.ready === true, `ready=${String(payload?.ready)} (expected true)`],
    [payload?.service === "atlas", `service=${String(payload?.service)} (expected atlas)`],
    [payload?.databaseReachable === true, `databaseReachable=${String(payload?.databaseReachable)} (expected true)`],
    [payload?.configuration?.ai === true, `OpenAI server configuration=${String(payload?.configuration?.ai)} (expected true)`],
    [payload?.configuration?.auth === true, `auth server configuration=${String(payload?.configuration?.auth)} (expected true)`],
  ];

  console.log(`Atlas live deployment verification: ${base.origin}\n`);
  for (const [passed, message] of checks) {
    console.log(`${passed ? "PASS" : "FAIL"}  ${message}`);
    if (!passed) process.exitCode = 1;
  }

  if (payload?.configuration?.fulfillmentWebhook !== true) {
    console.warn("WARN  PLATFORM_FULFILLMENT_SECRET is not reported configured.");
  } else {
    console.log("PASS  fulfillment webhook configuration present");
  }
  if (payload?.configuration?.subscriptionWebhook !== true) {
    console.warn("WARN  ATLAS_SUBSCRIPTION_WEBHOOK_SECRET is not reported configured.");
  } else {
    console.log("PASS  subscription webhook configuration present");
  }

  if (!process.exitCode) console.log("\nResult: LIVE BACKEND READY");
  else console.error("\nResult: LIVE BACKEND NOT READY");
} catch (error) {
  fail(error instanceof Error && error.name === "AbortError" ? "Health request timed out after 10 seconds." : `Health request failed: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  clearTimeout(timeout);
}
