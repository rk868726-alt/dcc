const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require("discord.js");

const axios = require("axios");
require("dotenv").config();

const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

/* ================= JSON LOAD ================= */

function loadJSON(path) {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch {
    return {};
  }
}

function saveJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

let logData = loadJSON("./logChannels.json");
let antiLink = loadJSON("./data/antilink.json");
let mirror = loadJSON("./data/mirror.json");
let autores = loadJSON("./data/autoresponder.json");
let reactionRoles = loadJSON("./data/reactionroles.json");

/* ================= READY ================= */

client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

/* ================= HELPER ================= */

function getLogChannel(guild) {
  const id = logData[guild.id];
  return id ? guild.channels.cache.get(id) : null;
}

/* ================= MAIN MESSAGE ================= */

const cooldown = new Set();

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const prefix = config.prefix;

  /* ===== AI SYSTEM ===== */
  if (message.content.startsWith(`${prefix}ai`)) {

    if (cooldown.has(message.author.id))
      return message.reply("⏳ Wait 5 seconds before using AI again.");

    cooldown.add(message.author.id);
    setTimeout(() => cooldown.delete(message.author.id), 5000);

    const prompt = message.content.slice(prefix.length + 2).trim();

    if (!prompt) return message.reply("Give me something to respond to!");

    try {
      const res = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        {
          model: "grok-beta",
          messages: [
            { role: "system", content: "You are a helpful Discord bot." },
            { role: "user", content: prompt }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROK_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const reply = res.data.choices[0].message.content;
      message.reply(reply);

    } catch (err) {
      console.error(err.response?.data || err.message);
      message.reply("❌ AI Error");
    }
  }

  /* ===== MENTION AI ===== */
  if (message.mentions.has(client.user)) {
    const prompt = message.content.replace(/<@!?\\d+>/, "").trim();
    if (!prompt) return;

    try {
      const res = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        {
          model: "grok-beta",
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROK_API_KEY}`
          }
        }
      );

      message.reply(res.data.choices[0].message.content);

    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  }

  /* ===== MIRROR ===== */
  if (message.content.startsWith(`${prefix}setmirror`)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply("❌ Admin only");

    const target = message.mentions.channels.first();
    if (!target) return message.reply("Mention a channel");

    mirror[message.channel.id] = target.id;
    saveJSON("./data/mirror.json", mirror);

    message.reply("✅ Mirror set");
  }

  if (message.content === `${prefix}removemirror`) {
    delete mirror[message.channel.id];
    saveJSON("./data/mirror.json", mirror);
    message.reply("✅ Mirror removed");
  }

  if (mirror[message.channel.id]) {
    const target = message.guild.channels.cache.get(mirror[message.channel.id]);
    if (target) target.send(message.content);
  }

  /* ===== ANTI LINK ===== */
  if (antiLink[message.channel.id] && message.content.includes("http")) {
    await message.delete();
    return message.channel.send("🚫 Links not allowed");
  }

  /* ===== AUTO RESPONDER ===== */
  for (let trigger in autores) {
    if (message.content.toLowerCase().includes(trigger)) {
      message.channel.send(autores[trigger]);
    }
  }

  /* ===== LOCK / UNLOCK ===== */
  if (message.content === `${prefix}lock`) {
    await message.channel.permissionOverwrites.edit(
      message.guild.roles.everyone,
      { SendMessages: false }
    );
    message.channel.send("🔒 Locked");
  }

  if (message.content === `${prefix}unlock`) {
    await message.channel.permissionOverwrites.edit(
      message.guild.roles.everyone,
      { SendMessages: true }
    );
    message.channel.send("🔓 Unlocked");
  }

  /* ===== PURGE ===== */
  if (message.content.startsWith(`${prefix}purge`)) {
    const amount = parseInt(message.content.split(" ")[1]);
    if (!amount) return;

    await message.channel.bulkDelete(amount, true);
    message.channel.send(`Deleted ${amount}`).then(m =>
      setTimeout(() => m.delete(), 3000)
    );
  }

});

/* ================= LOGS ================= */

client.on("messageDelete", (message) => {
  const logChannel = getLogChannel(message.guild);
  if (!logChannel) return;

  logChannel.send(`🗑️ Deleted: ${message.content}`);
});

client.on("guildBanAdd", (ban) => {
  const logChannel = getLogChannel(ban.guild);
  if (logChannel) logChannel.send(`❌ ${ban.user.tag} banned`);
});

/* ================= LOGIN ================= */

client.login(process.env.TOKEN);
