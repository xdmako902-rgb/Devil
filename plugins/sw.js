const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

cmd({
    pattern: "sw",
    alias: [],
    desc: "Scrape live data from https://sinhalawal.com/",
    category: "tools",
    react: "🕸️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const url = "https://sinhalawal.com/";

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const { data: html } = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
            },
            maxContentLength: 10 * 1024 * 1024
        });

        const $ = cheerio.load(html);

        const title =
            $('meta[property="og:title"]').attr('content') ||
            $('title').first().text().trim() ||
            "No title found";

        const description =
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            "No description found";

        const ogImage = $('meta[property="og:image"]').attr('content') || null;

        const headings = [];
        $('h1, h2').slice(0, 8).each((i, el) => {
            const t = $(el).text().trim();
            if (t) headings.push(t);
        });

        await conn.sendMessage(from, { react: { text: "📄", key: mek.key } });

        const caption = `╭─── « 🕸️ *𝗪𝗘𝗕 𝗦𝗖𝗥𝗔𝗣𝗘𝗥* » ───
│
│ 🔗 *URL:* ${url}
│ 📝 *𝗧𝗶𝘁𝗹𝗲:* ${title}
│ 📃 *𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:* ${description}
│
│ 📌 *𝗛𝗲𝗮𝗱𝗶𝗻𝗴𝘀:*
${headings.length ? headings.map(h => `│ • ${h}`).join('\n') : '│ • None found'}
╰───────────────⟡

> © 𝗖𝗬𝗕𝗘𝗥 𝗗𝗘𝗩𝗜𝗟 𝗦𝗖𝗥𝗔𝗣𝗘`;

        if (ogImage) {
            await conn.sendMessage(from, { image: { url: ogImage }, caption }, { quoted: mek });
        } else {
            await reply(caption);
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.log("SCRAPE_ERROR:", e);
        reply("❌ *𝗘𝗿𝗿𝗼𝗿:* Failed to scrape the website.");
    }
});