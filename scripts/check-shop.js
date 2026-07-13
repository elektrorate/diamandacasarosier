const https = require('https');
const fs = require('fs');
const env = fs.readFileSync('.env','utf8');
const token = env.match(/SUPABASE_ACCESS_TOKEN=(.+)/)[1].trim();
const ref = 'ilkrcakrduibgsfqfzti';
const q = `SELECT hero->>'heroVariant' as variant, hero->>'heroTitlePositionY' as pos_y, hero->>'heroTitleScale' as scale, hero->>'heroTitle' as title, hero->>'heroMenuTone' as tone FROM public.shop_page_settings WHERE id = 'shop-page';`;
const data = JSON.stringify({query:q});
const options = {
  hostname:'api.supabase.com',
  path:'/v1/projects/'+ref+'/database/query',
  method:'POST',
  headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}
};
const req = https.request(options, res=>{let b='';res.on('data',c=>b+=c);res.on('end',()=>console.log(b))});
req.on('error',e=>console.error(e.message));
req.write(data);
req.end();