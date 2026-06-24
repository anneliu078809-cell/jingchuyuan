const CONTACT_TO_EMAIL = "jingchuyuan1413@gmail.com";
const RESEND_API_URL = "https://api.resend.com/emails";

const redirectTo = (request, search) => {
  const url = new URL(request.url);
  return Response.redirect(`${url.origin}/contact/${search}`, 303);
};

const getField = (formData, name) => String(formData.get(name) || "").trim();

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
  if (!env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    return redirectTo(request, "?error=1");
  }

  try {
    const formData = await request.formData();

    if (getField(formData, "_honey")) {
      return redirectTo(request, "?sent=1");
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
      console.error("Missing required contact form field");
      return redirectTo(request, "?error=1");
    }

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL || "Jingchuyuan Website <onboarding@resend.dev>",
        to: env.CONTACT_TO_EMAIL || CONTACT_TO_EMAIL,
        subject: "靜初苑網站聯絡表單",
        html: renderMessageHtml(fields),
        text: fields.map(([label, value]) => `${label}：${value || "未填寫"}`).join("\n"),
      }),
    });

    if (!response.ok) {
      console.error("Resend API error", response.status, await response.text());
      return redirectTo(request, "?error=1");
    }

    return redirectTo(request, "?sent=1");
  } catch {
    return redirectTo(request, "?error=1");
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
