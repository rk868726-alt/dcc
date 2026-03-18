const fs = require("fs")

let logData = {}
try {
 logData = JSON.parse(fs.readFileSync("./logChannels.json"))
} catch {
 logData = {}
}
function getLogChannel(guild) {
 const id = logData[guild.id]
 if (!id) return null
 return guild.channels.cache.get(id)
}
const {
 ActionRowBuilder,
 ButtonBuilder,
 ButtonStyle,
 ChannelType
} = require("discord.js")
const config = require("./config.json")
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require("discord.js")

const { Partials } = require("discord.js")

const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessageReactions
 ],
 partials: [
  Partials.Message,
  Partials.Channel,
  Partials.Reaction
 ]
})
client.on("guildMemberRemove", member => {

 console.log("Member removed:", member.user.tag)

})

function sendLog(guild, embed) {

 const data = JSON.parse(fs.readFileSync("./data/logs.json"))

 console.log("Loaded log data:", data)

 const logChannelId = data[guild.id]

 if (!logChannelId) {
  console.log("No log channel set for this server")
  return
 }

 const channel = guild.channels.cache.get(logChannelId)

 if (!channel) {
  console.log("Log channel not found")
  return
 }

 channel.send({ embeds: [embed] })
}

//MSG DELE LOG
client.on("messageDelete", async (message) => {
 if (!message.guild || message.author?.bot) return

 const logChannel = getLogChannel(message.guild)
 if (!logChannel) return

 logChannel.send({
  embeds: [{
   title: "🗑️ Message Deleted",
   color: 0xff0000,
   fields: [
    { name: "User", value: `${message.author} (${message.author?.id})` },
    { name: "Channel", value: `${message.channel}` },
    { name: "Content", value: message.content || "No text" }
   ],
   timestamp: new Date()
  }]
 })
})


//MSG EDIT LOG

 client.on("messageUpdate", async (oldMsg, newMsg) => {
 if (!oldMsg.guild || oldMsg.author?.bot) return

 const logChannel = getLogChannel(oldMsg.guild)
 if (!logChannel) return

 if (oldMsg.content === newMsg.content) return

 logChannel.send({
  embeds: [{
   title: "✏️ Message Edited",
   color: 0xffff00,
   fields: [
    { name: "User", value: `${oldMsg.author}` },
    { name: "Before", value: oldMsg.content || "None" },
    { name: "After", value: newMsg.content || "None" }
   ],
   timestamp: new Date()
  }]
 })
})

//VOICE LOGGS
 client.on("voiceStateUpdate", async (oldState, newState) => {

 const logChannel = getLogChannel(newState.guild)
 if (!logChannel) return

 const user = newState.member.user

 let changes = []

 if (!oldState.channel && newState.channel)
  changes.push("Joined VC")

 if (oldState.channel && !newState.channel)
  changes.push("Left VC")

 if (oldState.selfMute !== newState.selfMute)
  changes.push(newState.selfMute ? "Self Muted" : "Self Unmuted")

 if (oldState.serverMute !== newState.serverMute)
  changes.push(newState.serverMute ? "Server Muted" : "Server Unmuted")

 if (oldState.selfDeaf !== newState.selfDeaf)
  changes.push(newState.selfDeaf ? "Self Deafened" : "Self Undeafened")

 if (oldState.serverDeaf !== newState.serverDeaf)
  changes.push(newState.serverDeaf ? "Server Deafened" : "Server Undeafened")

 if (changes.length === 0) return

 logChannel.send({
  embeds: [{
   title: "🔊 Voice State Changed",
   color: 0x3498db,
   thumbnail: { url: user.displayAvatarURL() },
   fields: [
    { name: "Member", value: `${user} (${user.id})` },
    { name: "Channel", value: `${newState.channel || oldState.channel || "None"}` },
    { name: "Changes", value: changes.join("\n") }
   ],
   timestamp: new Date()
  }]
 })
})

//KICK BAN LOGS
client.on("guildMemberRemove", async (member) => {
 const logChannel = getLogChannel(member.guild)
 if (!logChannel) return

 logChannel.send({
  embeds: [{
   title: "👢 Member Left / Kicked",
   color: 0xff9900,
   description: `${member.user} (${member.id})`,
   timestamp: new Date()
  }]
 })
})

client.on("guildBanAdd", async (ban) => {
 const logChannel = getLogChannel(ban.guild)
 if (!logChannel) return

 logChannel.send({
  embeds: [{
   title: "❌ User Banned",
   color: 0xff0000,
   description: `${ban.user} (${ban.user.id})`,
   timestamp: new Date()
  }]
 })
})
 
//UNBAN LOGS

client.on("guildBanRemove", async (ban) => {
 const logChannel = getLogChannel(ban.guild)
 if (!logChannel) return

 logChannel.send({
  embeds: [{
   title: "🔓 User Unbanned",
   color: 0x00ff00,
   description: `${ban.user} (${ban.user.id})`,
   timestamp: new Date()
  }]
 })
})

//Channel logs
client.on("channelCreate", channel => {
 const logChannel = getLogChannel(channel.guild)
 if (!logChannel) return

 logChannel.send(`📁 Channel Created: ${channel.name}`)
})

client.on("channelDelete", channel => {
 const logChannel = getLogChannel(channel.guild)
 if (!logChannel) return

 logChannel.send(`🗑️ Channel Deleted: ${channel.name}`)
})

//ROLE LOGS

client.on("roleCreate", role => {
 const logChannel = getLogChannel(role.guild)
 if (!logChannel) return

 logChannel.send(`🆕 Role Created: ${role.name}`)
})

client.on("roleDelete", role => {
 const logChannel = getLogChannel(role.guild)
 if (!logChannel) return

 logChannel.send(`❌ Role Deleted: ${role.name}`)
})

client.commands = new Map()

const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"))

for (const file of commandFiles) {
 const command = require(`./commands/${file}`)
 client.commands.set(command.name, command)
}

client.on("clientready", () => {
 console.log(`Logged in as ${client.user.tag}`)
})

client.on("messageCreate", async message => {

if (!message || !message.author || message.author.bot) return
 const prefix = config.prefix

 /* ---------------- ANTI LINK ---------------- */

 const antiLink = JSON.parse(fs.readFileSync("./data/antilink.json"))

 if (antiLink[message.channel.id]) {
  if (message.content.includes("http")) {
   message.delete()
   message.channel.send("Links are not allowed here.")
   return
  }
 }

//SETLOG SMD
 if (message.author.bot) return

 if (message.content === "!setlog") {

  if (!message.member.permissions.has("Administrator"))
   return message.reply("❌ Admin only")

  logData[message.guild.id] = message.channel.id

  fs.writeFileSync("./logChannels.json", JSON.stringify(logData, null, 2))

  message.reply("✅ Log channel set successfully!")

 }

})

 
/* ---------------- MIRROR ---------------- */

const mirror = JSON.parse(fs.readFileSync("./data/mirror.json"))

if (mirror[message.channel.id]) {

 const targetChannel = message.guild.channels.cache.get(mirror[message.channel.id])

 if (targetChannel) {

targetChannel.send({
 content: message.content,
 allowedMentions: {
  parse: ["users", "roles", "everyone"]
 }
})
 }

}

//UNBAN
 
client.on("messageCreate", async (message) => {

 if (message.author.bot) return

 if (message.content.startsWith("!unban")) {

  if (!message.member.permissions.has("BanMembers"))
   return message.reply("❌ You need ban permission")

  const args = message.content.split(" ")
  const userId = args[1]

  if (!userId) return message.reply("❌ Provide user ID")

  try {
   await message.guild.members.unban(userId)

   message.reply("✅ User unbanned successfully")

  } catch (err) {
   message.reply("❌ Failed to unban user")
   console.error(err)
  }
 }

})
 /* ---------------- AUTORESPONDER ---------------- */

 const autores = JSON.parse(fs.readFileSync("./data/autoresponder.json"))

 for (let trigger in autores) {
  if (message.content.toLowerCase().includes(trigger)) {
   message.channel.send(autores[trigger])
  }
 }

 //Logger helper



 //TICKET PANEL

 if (message.content.startsWith(`${config.prefix}ticket`)) {

 if (!message.member.permissions.has("Administrator"))
  return message.reply("❌ Admin only command")

 const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
   .setCustomId("create_ticket")
   .setLabel("🎫 Create Ticket")
   .setStyle(ButtonStyle.Primary)
 )

 message.channel.send({
  content: "🎟️ **Support System**\nClick the button below to create a ticket.",
  components: [row]
 })

}


 /* ---------------- COMMAND HANDLER ---------------- */

 if (!message.content.startsWith(prefix)) return

 const args = message.content.slice(prefix.length).trim().split(/ +/)
 const cmd = args.shift().toLowerCase()

 const command = client.commands.get(cmd)

 if (!command) return

 command.execute(message, args)
})
//rection roles

client.on("messageReactionAdd", async (reaction, user) => {

 if (user.bot) return

 const data = JSON.parse(fs.readFileSync("./data/reactionroles.json"))

 const config = data[reaction.message.id]

 if (!config) return

 if (reaction.emoji.name === config.emoji) {

  const member = reaction.message.guild.members.cache.get(user.id)

  member.roles.add(config.role)

 }

})

client.on("messageReactionRemove", async (reaction, user) => {

 if (user.bot) return

 const data = JSON.parse(fs.readFileSync("./data/reactionroles.json"))

 const config = data[reaction.message.id]

 if (!config) return

 if (reaction.emoji.name === config.emoji) {

  const member = reaction.message.guild.members.cache.get(user.id)

  member.roles.remove(config.role)

 }

})

//TICKET

client.on("interactionCreate", async (interaction) => {

 if (!interaction.isButton()) return

 // 🛑 prevent crash
 if (interaction.replied || interaction.deferred) return

 // 🎫 CREATE TICKET
 if (interaction.customId === "create_ticket") {

  const guild = interaction.guild
  const member = interaction.user

  const adminRole = "1446888967311065278" // 🔥 PUT ADMIN ROLE ID HERE

  const channel = await guild.channels.create({
   name: `ticket-${member.username}`,
   type: ChannelType.GuildText,
   permissionOverwrites: [
    {
     id: guild.id,
     deny: [PermissionsBitField.Flags.ViewChannel],
    },
    {
     id: member.id,
     allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    },
    {
     id: adminRole,
     allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    },
   ],
  })

  const closeRow = new ActionRowBuilder().addComponents(
   new ButtonBuilder()
    .setCustomId("close_ticket")
    .setLabel("🔒 Close Ticket")
    .setStyle(ButtonStyle.Danger)
  )

  await channel.send({
   content: `<@${member.id}> <@&${adminRole}>`,
   components: [closeRow]
  })

  await interaction.reply({
   content: `✅ Ticket created: ${channel}`,
   flags: 64
  })

 }

 // 🔒 CLOSE TICKET
 if (interaction.customId === "close_ticket") {

  await interaction.deferReply({ flags: 64 })

  await interaction.editReply("🔒 Closing ticket in 3 seconds...")

  setTimeout(() => {
   interaction.channel.delete().catch(() => {})
  }, 3000)

 }

})

//reaction role handler

client.on("messageReactionAdd", async (reaction, user) => {

 if (user.bot) return

 const fs = require("fs")
 const data = JSON.parse(fs.readFileSync("./data/reactionroles.json"))

 const messageData = data[reaction.message.id]

 if (!messageData) return

 const roleId = messageData[reaction.emoji.name]

 if (!roleId) return

 const member = reaction.message.guild.members.cache.get(user.id)

 member.roles.add(roleId)

})

client.on("messageReactionRemove", async (reaction, user) => {

 if (user.bot) return

 const fs = require("fs")
 const data = JSON.parse(fs.readFileSync("./data/reactionroles.json"))

 const messageData = data[reaction.message.id]

 if (!messageData) return

 const roleId = messageData[reaction.emoji.name]

 if (!roleId) return

 const member = reaction.message.guild.members.cache.get(user.id)

 member.roles.remove(roleId)

})

//message delete logs
client.on("messageDelete", async message => {

 if (!message || !message.author || message.author.bot) return

 const logChannel = message.guild.channels.cache.get(config.logChannel)
 if (!logChannel) return

 const { EmbedBuilder } = require("discord.js")

 const embed = new EmbedBuilder()
  .setColor("Red")
  .setTitle("🗑️ Message Deleted")
  .addFields(
   { name: "User", value: `${message.author.tag}`, inline: true },
   { name: "Channel", value: `${message.channel}`, inline: true }
  )
  .setDescription(`**Message:**\n${message.content ? message.content : "No cached message content"}`)
  .setTimestamp()

 logChannel.send({ embeds: [embed] })


})
console.log("TOKEN:", process.env.TOKEN)

client.login(process.env.TOKEN)
