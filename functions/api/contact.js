const CONTACT_TO_EMAIL = "jingchuyuan1413@gmail.com";
const CONTACT_FROM_EMAIL = "Jingchuyuan Website <noreply@jingchuyuan.com>";
const RESEND_API_URL = "https://api.resend.com/emails";
const TURNSTILE_API_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const FIELD_LIMITS = {
  "姓名或暱稱": 80,
  "想詢問的服務": 40,
  "偏好的聯絡方式": 40,
  "聯絡資料": 160,
  "想聊的方向": 1500,
};

const rateLimitStore = globalThis.__contactRateLimitStore || new Map();
globalThis.__contactRateLimitStore = rateLimitStore;

const jsonResponse = (body, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};

const errorResponse = (code, message = "表單暫時無法送出，請稍後再試，或直接透過 LINE 聯絡。") => {
  return jsonResponse(
    {
      ok: false,
      code,
      message,
    },
    400,
  );
};

const successResponse = () => {
  return jsonResponse({
    ok: true,
    message: "發送成功",
  });
};

const logContactError = (code, detail = {}) => {
  console.error(
    "Contact form error",
    JSON.stringify({
      code,
      ...detail,
    }),
  );
};

const getField = (formData, name) => String(formData.get(name) || "").trim();

const isFieldTooLong = ([label, value]) => value.length > FIELD_LIMITS[label];

const getAllowedOrigins = (request, env) => {
  const currentOrigin = new URL(request.url).origin;
  const configuredOrigins = String(env.CONTACT_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([currentOrigin, ...configuredOrigins]);
};

const hasAllowedOrigin = (request, env) => {
  const origin = request.headers.get("Origin");

  if (!origin) {
    return true;
  }

  return getAllowedOrigins(request, env).has(origin);
};

const getClientIp = (request) => request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";

const isRateLimited = (request) => {
  const now = Date.now();
  const clientIp = getClientIp(request);
  const current = rateLimitStore.get(clientIp);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
};

const verifyTurnstile = async (request, env, formData) => {
  if (!env.TURNSTILE_SECRET_KEY) {
    return true;
  }

  const token = getField(formData, "cf-turnstile-response");

  if (!token) {
    logContactError("missing-turnstile-token", {
      hint: "TURNSTILE_SECRET_KEY is set, but the form did not submit cf-turnstile-response. Check PUBLIC_TURNSTILE_SITE_KEY build variable and redeploy.",
    });
    return false;
  }

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
    remoteip: getClientIp(request),
  });

  const response = await fetch(TURNSTILE_API_URL, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    logContactError("turnstile-http-error", {
      status: response.status,
      body: await response.text(),
    });
    return false;
  }

  const result = await response.json();

  if (!result.success) {
    logContactError("turnstile-verification-failed", {
      errors: result["error-codes"] || [],
    });
  }

  return Boolean(result.success);
};

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const renderMessageHtml = (fields) => {
  const rows = fields
    .map(
      ([label, value]) => `
        <tr>
          <th align="left" style="padding:8px 12px;border-bottom:1px solid #eee;white-space:nowrap;">${escapeHtml(label)}</th>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(value || "未填寫")}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#2f2a24;">
      <h2 style="margin:0 0 16px;">靜初苑網站聯絡表單</h2>
      <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;max-width:680px;border:1px solid #eee;">
        ${rows}
      </table>
    </div>`;
};

export async function onRequestPost({ request, env }) {
  if (!hasAllowedOrigin(request, env)) {
    logContactError("blocked-origin", {
      origin: request.headers.get("Origin"),
      expected: Array.from(getAllowedOrigins(request, env)),
    });
    return errorResponse("blocked-origin");
  }

  if (isRateLimited(request)) {
    logContactError("rate-limited", {
      clientIp: getClientIp(request),
    });
    return errorResponse("rate-limited");
  }

  if (!env.RESEND_API_KEY) {
    logContactError("missing-resend-api-key");
    return errorResponse("missing-resend-api-key");
  }

  try {
    const formData = await request.formData();

    if (getField(formData, "_honey")) {
      return successResponse();
    }

    if (!(await verifyTurnstile(request, env, formData))) {
      return errorResponse("turnstile-failed");
    }

    const fields = [
      ["姓名或暱稱", getField(formData, "姓名或暱稱")],
      ["想詢問的服務", getField(formData, "想詢問的服務")],
      ["偏好的聯絡方式", getField(formData, "偏好的聯絡方式")],
      ["聯絡資料", getField(formData, "聯絡資料")],
      ["想聊的方向", getField(formData, "想聊的方向")],
    ];

    const missingRequired = fields.slice(0, 4).some(([, value]) => !value);

    if (missingRequired) {
      logContactError("missing-required-field");
      return errorResponse("missing-required-field");
    }

    if (fields.some(isFieldTooLong)) {
      logContactError("field-too-long");
      return errorResponse("field-too-long");
    }

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL || CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL || CONTACT_TO_EMAIL,
        subject: "靜初苑網站聯絡表單",
        html: renderMessageHtml(fields),
        text: fields.map(([label, value]) => `${label}：${value || "未填寫"}`).join("\n"),
      }),
    });

    if (!response.ok) {
      logContactError("resend-api-error", {
        status: response.status,
        body: await response.text(),
        from: env.CONTACT_FROM_EMAIL || CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL || CONTACT_TO_EMAIL,
      });
      return errorResponse("resend-api-error");
    }

    return successResponse();
  } catch (error) {
    logContactError("unexpected-error", {
      message: error instanceof Error ? error.message : String(error),
    });
    return errorResponse("unexpected-error");
  }
}

export function onRequest() {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: {
      Allow: "POST",
    },
  });
}
