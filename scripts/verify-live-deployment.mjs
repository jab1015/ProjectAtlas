const rawBackendBase = process.argv[2] || process.env.CONVEX_SITE_URL || "";
const rawFrontendBase = process.argv[3] || process.env.INVENTSMITH_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";

function fail(message) {
  console.error(`FAIL  ${message}`);
  process.exitCode = 1;
}

function parseHttpsUrl(raw, label, allowedHostnamePattern) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    fail(`${label} URL is invalid.`);
    return null;
  }
  if (url.protocol !== "https:") {
    fail(`${label} verification requires HTTPS.`);
    return null;
  }
  if (allowedHostnamePattern && !allowedHostnamePattern.test(url.hostname)) {
    fail(`${label} hostname is not an accepted live endpoint.`);
    return null;
  }
  url.search = "";
  url.hash = "";
  return url;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function verifyBackend(rawBase) {
  if (!rawBase) {
    fail("Provide the Convex site URL as the first argument or CONVEX_SITE_URL.");
    return false;
  }

  const base = parseHttpsUrl(rawBase, "Convex site", /\.convex\.site$/i);
  if (!base) return false;
  base.pathname = "/api/health";

  try {
    const response = await fetchWithTimeout(base, {
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "error",
    });
    const text = await response.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      fail(`Health endpoint returned non-JSON content (HTTP ${response.status}).`);
      return false;
    }

    const checks = [
      [response.status === 200, `HTTP status ${response.status} (expected 200)`],
      [payload?.ok === true, `ok=${String(payload?.ok)} (expected true)`],
      [payload?.ready === true, `ready=${String(payload?.ready)} (expected true)`],
      [payload?.service === "atlas", `internal service=${String(payload?.service)} (expected atlas)`],
      [payload?.databaseReachable === true, `databaseReachable=${String(payload?.databaseReachable)} (expected true)`],
      [payload?.configuration?.ai === true, `OpenAI server configuration=${String(payload?.configuration?.ai)} (expected true)`],
      [payload?.configuration?.auth === true, `auth server configuration=${String(payload?.configuration?.auth)} (expected true)`],
    ];

    console.log(`InventSmith backend verification: ${base.origin}\n`);
    let passed = true;
    for (const [ok, message] of checks) {
      console.log(`${ok ? "PASS" : "FAIL"}  ${message}`);
      if (!ok) {
        passed = false;
        process.exitCode = 1;
      }
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
    return passed;
  } catch (error) {
    fail(error instanceof Error && error.name === "AbortError"
      ? "Backend health request timed out after 10 seconds."
      : `Backend health request failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function verifyFrontend(rawBase) {
  if (!rawBase) {
    console.warn("\nWARN  Frontend not verified. Supply the deployed app URL as the second argument or INVENTSMITH_APP_URL.");
    return { checked: false, passed: false };
  }

  const base = parseHttpsUrl(rawBase, "InventSmith app");
  if (!base) return { checked: true, passed: false };

  const checks = [
    {
      path: "/",
      label: "public InventSmith landing page",
      expected: ["InventSmith", "The Inventor OS", "InventSmith does the work."],
    },
    {
      path: "/sign-in",
      label: "InventSmith sign-in page",
      expected: ["Welcome back", "Sign in to continue your invention journey."],
    },
  ];

  console.log(`\nInventSmith frontend verification: ${base.origin}\n`);
  let passed = true;
  for (const check of checks) {
    const url = new URL(check.path, base);
    try {
      const response = await fetchWithTimeout(url, {
        method: "GET",
        headers: { Accept: "text/html" },
        redirect: "follow",
      });
      const html = await response.text();
      const contentType = response.headers.get("content-type") ?? "";
      const routeOk = response.status === 200 && contentType.includes("text/html");
      console.log(`${routeOk ? "PASS" : "FAIL"}  ${check.label} HTTP ${response.status}`);
      if (!routeOk) {
        passed = false;
        process.exitCode = 1;
        continue;
      }
      for (const text of check.expected) {
        const found = html.includes(text);
        console.log(`${found ? "PASS" : "FAIL"}  ${check.path} contains ${JSON.stringify(text)}`);
        if (!found) {
          passed = false;
          process.exitCode = 1;
        }
      }
    } catch (error) {
      fail(error instanceof Error && error.name === "AbortError"
        ? `${check.label} timed out after 10 seconds.`
        : `${check.label} request failed: ${error instanceof Error ? error.message : String(error)}`);
      passed = false;
    }
  }
  return { checked: true, passed };
}

const backendPassed = await verifyBackend(rawBackendBase);
const frontend = await verifyFrontend(rawFrontendBase);

console.log("\nAuthenticated acceptance still required in a real browser:");
console.log("MANUAL  sign in with a real InventSmith account");
console.log("MANUAL  confirm the authenticated session survives reload/navigation");
console.log("MANUAL  confirm Convex reports authenticated state and Dashboard/Journey Center load without redirecting back to sign-in");
console.log("MANUAL  exercise representative evidence upload/write-back and downstream refresh on the replicated environment");

if (!process.exitCode && backendPassed && frontend.checked && frontend.passed) {
  console.log("\nResult: LIVE PUBLIC SURFACES READY — AUTHENTICATED BROWSER ACCEPTANCE STILL REQUIRED");
} else if (!process.exitCode && backendPassed && !frontend.checked) {
  console.log("\nResult: LIVE BACKEND READY — FRONTEND AND AUTHENTICATED BROWSER ACCEPTANCE STILL REQUIRED");
} else {
  console.error("\nResult: LIVE DEPLOYMENT NOT READY");
}
