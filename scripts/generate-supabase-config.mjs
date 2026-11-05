import { readFile, writeFile } from 'node:fs/promises';

const envText = await readFile(new URL('../.env', import.meta.url), 'utf8').catch(() => '');
const env = Object.fromEntries(envText.split(/\r?\n/).map(line => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map(([, key, value]) => [key, value.replace(/^['"]|['"]$/g, '')]));
const config = {
  url: env.SUPABASE_URL || '',
  publishableKey: env.SUPABASE_PUBLISHABLE_KEY || ''
};
await writeFile(new URL('../supabase-config.js', import.meta.url), `window.KANGBAN_SUPABASE_CONFIG = ${JSON.stringify(config)};\n`, { mode: 0o600 });
console.log(config.url && config.publishableKey ? 'Supabase 浏览器配置已生成。' : '配置文件已生成，但 publishable key 缺失；应用将以本机演示模式运行。');
