const fs = require("fs")
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
} = require("discord.js")

const config = require("./config.json")
const axios = require('axios');
require('dotenv').config();

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
})

/* ================= FILE LOAD ================= */

let logData = loadJSON("./logChannels.json")
let antiLink = loadJSON("./data/antilink.json")
let mirror = loadJSON("./data/mirror.json")
let autores = loadJSON("./data/autoresponder.json")
let reactionRoles = loadJSON("./data/reactionroles.json")

function loadJSON(path) {
 try {
  return JSON.parse(fs.readFileSync(path))
 } catch {
  return {}
 }
}

function saveJSON(path, data) {
 fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

/* ================= READY ================= */

client.on("ready", () => {
 console.log(`✅ Logged in as ${client.user.tag}`)
})

/* ================= LOG CHANNEL ================= */

function getLogChannel(guild) {
 const id = logData[guild.id]
 if (!id) return null
 return guild.channels.cache.get(id)
}

/* ================= MESSAGE CREATE ================= */

client.on("messageCreate", async (message) => {
 if (!message.guild || message.author.bot) return

 const prefix = config.prefix

 // ===== MIRROR SYSTEM =====

if (message.content.startsWith(`${prefix}setmirror`)) {

 if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
  return message.reply("❌ Admin only command")

 const target = message.mentions.channels.first()

 if (!target)
  return message.reply("❌ Mention a channel\nExample: !setmirror #general")

 mirror[message.channel.id] = target.id

 fs.writeFileSync("./data/mirror.json", JSON.stringify(mirror, null, 2))

 message.reply(`✅ Mirror set!\nMessages from ${message.channel} → ${target}`)
}

 //REMOVE MIRROR

 if (message.content === `${prefix}removemirror`) {

 if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
  return message.reply("❌ Admin only command")

 delete mirror[message.channel.id]

 fs.writeFileSync("./data/mirror.json", JSON.stringify(mirror, null, 2))

 message.reply("✅ Mirror removed for this channel")
}

//LOCK

 if (message.content.startsWith(`${prefix}lock`)) {

 if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
  return message.reply("❌ You need Manage Channels permission")

 await message.channel.permissionOverwrites.edit(
  message.guild.roles.everyone,
  { SendMessages: false }
 )

 // 👇 PASTE EMBED HERE
 const embed = new EmbedBuilder()
  .setColor("Red")
  .setDescription("🔒 Channel has been locked")
  .setTimestamp()

 message.channel.send({ embeds: [embed] })
}

 //UNLOCK

 if (message.content.startsWith(`${prefix}unlock`)) {

 if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
  return message.reply("❌ You need Manage Channels permission")

 await message.channel.permissionOverwrites.edit(
  message.guild.roles.everyone,
  { SendMessages: true }
 )

 message.channel.send("🔓 Channel unlocked!")
}

 //purge

 if (message.content.startsWith(`${prefix}purge`)) {

 if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
  return message.reply("❌ You need Manage Messages permission")

 const args = message.content.split(" ")
 const amount = parseInt(args[1])

 if (!amount || amount < 1 || amount > 100)
  return message.reply("❌ Enter a number between 1 - 100")

 try {
  await message.channel.bulkDelete(amount, true)

  const msg = await message.channel.send(`🧹 Deleted ${amount} messages`)
  
  setTimeout(() => msg.delete().catch(() => {}), 3000)

 } catch (err) {
  console.error(err)
  message.reply("❌ Failed to delete messages")
 }
}
 
 //MIRROR LOGIC
 if (mirror[message.channel.id]) {

 const targetChannel = message.guild.channels.cache.get(
  mirror[message.channel.id]
 )

 if (!targetChannel) return

 targetChannel.send({
  content: message.content,
  allowedMentions: {
   parse: ["users", "roles", "everyone"]
  }
 })
}
 /* -------- ANTI LINK -------- */
 if (antiLink[message.channel.id] && message.content.includes("http")) {
  await message.delete()
  return message.channel.send("🚫 Links are not allowed here.")
 }


 /* -------- AUTO RESPONDER -------- */
 for (let trigger in autores) {
  if (message.content.toLowerCase().includes(trigger)) {
   message.channel.send(autores[trigger])
  }
 }

 /* -------- SET LOG -------- */
 if (message.content === `${prefix}setlog`) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
   return message.reply("❌ Admin only")

  logData[message.guild.id] = message.channel.id
  saveJSON("./logChannels.json", logData)

  return message.reply("✅ Log channel set!")
 }

 /* -------- UNBAN -------- */
 if (message.content.startsWith(`${prefix}unban`)) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
   return message.reply("❌ No permission")

  const userId = message.content.split(" ")[1]
  if (!userId) return message.reply("❌ Provide user ID")

  try {
   await message.guild.members.unban(userId)
   message.reply("✅ Unbanned successfully")
  } catch {
   message.reply("❌ Failed to unban")
  }
 }

 /* -------- TICKET PANEL -------- */
 if (message.content.startsWith(`${prefix}ticket`)) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
   return

  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder()
    .setCustomId("create_ticket")
    .setLabel("🎫 Create Ticket")
    .setStyle(ButtonStyle.Primary)
  )

  message.channel.send({
   content: "🎟️ Click below to create ticket",
   components: [row]
  })
 }

 /* -------- COMMAND HANDLER -------- */
 if (!message.content.startsWith(prefix)) return

 const args = message.content.slice(prefix.length).trim().split(/ +/)
 const cmd = args.shift().toLowerCase()

 if (!client.commands) client.commands = new Map()

 const command = client.commands.get(cmd)
 if (command) command.execute(message, args)
})

/* ================= MESSAGE LOGS ================= */

client.on("messageDelete", (message) => {
 if (!message.guild || message.author?.bot) return

 const logChannel = getLogChannel(message.guild)
 if (!logChannel) return

 const embed = new EmbedBuilder()
  .setColor("Red")
  .setTitle("🗑️ Message Deleted")
  .addFields(
   { name: "User", value: `${message.author.tag}`, inline: true },
   { name: "Channel", value: `${message.channel}`, inline: true }
  )
  .setDescription(message.content || "No content")
  .setTimestamp()

 logChannel.send({ embeds: [embed] })
})

client.on("messageUpdate", (oldMsg, newMsg) => {
 if (!oldMsg.guild || oldMsg.author?.bot) return
 if (oldMsg.content === newMsg.content) return

 const logChannel = getLogChannel(oldMsg.guild)
 if (!logChannel) return

 logChannel.send({
  embeds: [
   new EmbedBuilder()
    .setColor("Yellow")
    .setTitle("✏️ Message Edited")
    .addFields(
     { name: "User", value: `${oldMsg.author}` },
     { name: "Before", value: oldMsg.content || "None" },
     { name: "After", value: newMsg.content || "None" }
    )
    .setTimestamp()
  ]
 })
})

//AI 
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!ai')) {
    const prompt = message.content.replace('!ai', '').trim();

    if (!prompt) {
      return message.reply('Give me something to respond to!');
    }

    try {
      const res = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: "grok-2-latest", // or grok-beta (depends on your plan)
          messages: [
            { role: "system", content: "You are a helpful Discord bot." },
            { role: "user", content: prompt }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const reply = res.data.choices[0].message.content;
      message.reply(reply);

    } catch (err) {
      console.error(err.response?.data || err.message);
      message.reply('❌ Error talking to Grok AI.');
    }
  }
});


/* ================= VOICE LOG ================= */

client.on("voiceStateUpdate", (oldState, newState) => {
 const logChannel = getLogChannel(newState.guild)
 if (!logChannel) return

 const user = newState.member.user
 let changes = []

 if (!oldState.channel && newState.channel) changes.push("Joined VC")
 if (oldState.channel && !newState.channel) changes.push("Left VC")

 if (!changes.length) return

 logChannel.send({
  embeds: [
   new EmbedBuilder()
    .setColor("Blue")
    .setTitle("🔊 Voice Update")
    .setDescription(`${user} → ${changes.join(", ")}`)
    .setTimestamp()
  ]
 })
})

/* ================= BAN LOGS ================= */

client.on("guildBanAdd", (ban) => {
 const logChannel = getLogChannel(ban.guild)
 if (!logChannel) return

 logChannel.send(`❌ ${ban.user.tag} was banned`)
})

client.on("guildBanRemove", (ban) => {
 const logChannel = getLogChannel(ban.guild)
 if (!logChannel) return

 logChannel.send(`🔓 ${ban.user.tag} was unbanned`)
})

/* ================= REACTION ROLES ================= */

client.on("messageReactionAdd", (reaction, user) => {
 if (user.bot) return

 const data = reactionRoles[reaction.message.id]
 if (!data) return

 const roleId = data[reaction.emoji.name]
 if (!roleId) return

 const member = reaction.message.guild.members.cache.get(user.id)
 member.roles.add(roleId)
})

client.on("messageReactionRemove", (reaction, user) => {
 if (user.bot) return

 const data = reactionRoles[reaction.message.id]
 if (!data) return

 const roleId = data[reaction.emoji.name]
 if (!roleId) return

 const member = reaction.message.guild.members.cache.get(user.id)
 member.roles.remove(roleId)
})

/* ================= TICKET SYSTEM ================= */

client.on("interactionCreate", async (interaction) => {
 if (!interaction.isButton()) return

 const ADMIN_ROLE_ID = "1446888967311065278" // 🔥 PUT YOUR ROLE ID

 /* ================= CREATE TICKET ================= */

 if (interaction.customId === "create_ticket") {

  const channel = await interaction.guild.channels.create({
   name: `ticket-${interaction.user.username}`,
   type: ChannelType.GuildText,
   permissionOverwrites: [
    {
     id: interaction.guild.id,
     deny: [PermissionsBitField.Flags.ViewChannel],
    },
    {
     id: interaction.user.id,
     allow: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages
     ],
    },
    {
     id: ADMIN_ROLE_ID,
     allow: [
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages
     ],
    }
   ],
  })

  /* 🔒 CLOSE BUTTON */
  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder()
    .setCustomId("close_ticket")
    .setLabel("🔒 Close Ticket")
    .setStyle(ButtonStyle.Danger)
  )

  /* 📢 SEND MESSAGE IN TICKET CHANNEL */
  await channel.send({
   content: `🎫 Ticket created by <@${interaction.user.id}>\n<@&${ADMIN_ROLE_ID}>`,
   components: [row]
  })

  await interaction.reply({
   content: `✅ Ticket created: ${channel}`,
   ephemeral: true
  })
 }

 /* ================= CLOSE TICKET ================= */

 if (interaction.customId === "close_ticket") {

  // ❌ Only admin role can close
  if (!interaction.member.roles.cache.has(ADMIN_ROLE_ID)) {
   return interaction.reply({
    content: "❌ Only admins can close tickets!",
    ephemeral: true
   })
  }

  await interaction.reply({
   content: "🔒 Closing ticket in 3 seconds...",
   ephemeral: true
  })

  setTimeout(() => {
   interaction.channel.delete().catch(() => {})
  }, 3000)
 }
})

/* ================= LOGIN ================= */

client.login(process.env.TOKEN)
