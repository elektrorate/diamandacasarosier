import fs from "node:fs";
import https from "node:https";

const env = fs.readFileSync(".env", "utf8");
const tokenMatch = env.match(/SUPABASE_ACCESS_TOKEN=(.+)/);
if (!tokenMatch) throw new Error("SUPABASE_ACCESS_TOKEN no está definido en .env");

const token = tokenMatch[1].trim();
const projectRef = "ilkrcakrduibgsfqfzti";
const query = `SELECT hero->>'heroVariant' as variant, hero->>'heroTitlePositionY' as pos_y, hero->>'heroTitleScale' as scale, hero->>'heroTitle' as title, hero->>'heroMenuTone' as tone FROM public.shop_page_settings WHERE id = 'shop-page';`;
const data = JSON.stringify({ query });
const options = {
  hostname: "api.supabase.com",
  path: `/v1/projects/${projectRef}/database/query`,
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
};

const request = https.request(options, (response) => {
  let body = "";
  response.on("data", (chunk) => { body += chunk; });
  response.on("end", () => console.log(body));
});
request.on("error", (error) => console.error(error.message));
request.write(data);
request.end();
