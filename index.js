const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require("discord.js")
 const fs = require("fs")

const config = require("./config.json")

const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildModeration
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


 //kick logger

 client.on("guildMemberRemove", async member => {

 const logs = await member.guild.fetchAuditLogs({ limit: 1 })

 const log = logs.entries.first()

 if (!log) return

 if (log.action === 20 && log.target.id === member.id) {

  const embed = new EmbedBuilder()
   .setTitle("Member Kicked")
   .setColor("Orange")
   .addFields(
    { name: "User", value: `${member.user.tag}` },
    { name: "By", value: `${log.executor.tag}` }
   )
   .setTimestamp()

  sendLog(member.guild, embed)
 }

})


 //ban logger


 client.on("guildBanAdd", async ban => {

 const logs = await ban.guild.fetchAuditLogs({ limit: 1 })

 const log = logs.entries.first()

 const embed = new EmbedBuilder()
  .setTitle("Member Banned")
  .setColor("Red")
  .addFields(
   { name: "User", value: `${ban.user.tag}` },
   { name: "By", value: `${log.executor.tag}` }
  )
  .setTimestamp()

 sendLog(ban.guild, embed)

})

 //create or delete logger

 client.on("channelCreate", async channel => {

 const logs = await channel.guild.fetchAuditLogs({ limit: 1 })
 const log = logs.entries.first()

 const embed = new EmbedBuilder()
  .setTitle("Channel Created")
  .setColor("Green")
  .addFields(
   { name: "Channel", value: `${channel.name}` },
   { name: "By", value: `${log.executor.tag}` }
  )
  .setTimestamp()

 sendLog(channel.guild, embed)

})

 client.on("channelDelete", async channel => {

 const logs = await channel.guild.fetchAuditLogs({ limit: 1 })
 const log = logs.entries.first()

 const embed = new EmbedBuilder()
  .setTitle("Channel Deleted")
  .setColor("DarkRed")
  .addFields(
   { name: "Channel", value: `${channel.name}` },
   { name: "By", value: `${log.executor.tag}` }
  )
  .setTimestamp()

 sendLog(channel.guild, embed)

})

 //voice logger



 client.on("voiceStateUpdate", async (oldState, newState) => {

 if (!oldState.channel && newState.channel) {

  const embed = new EmbedBuilder()
   .setTitle("Voice Join")
   .addFields(
    { name: "User", value: `${newState.member.user.tag}` },
    { name: "Channel", value: `${newState.channel.name}` }
   )
   .setColor("Blue")

  sendLog(newState.guild, embed)

 }

 if (oldState.channel && !newState.channel) {

  const embed = new EmbedBuilder()
   .setTitle("Voice Leave")
   .addFields(
    { name: "User", value: `${newState.member.user.tag}` },
    { name: "Channel", value: `${oldState.channel.name}` }
   )
   .setColor("Grey")

  sendLog(newState.guild, embed)

 }

})


 //msg delete logger

 client.on("messageDelete", message => {

 if (!message.guild || message.author.bot) return

 const embed = new EmbedBuilder()
  .setTitle("Message Deleted")
  .setColor("Red")
  .addFields(
   { name: "User", value: `${message.author.tag}` },
   { name: "Channel", value: `${message.channel}` },
   { name: "Message", value: message.content || "Empty" }
  )
  .setTimestamp()

 sendLog(message.guild, embed)

})


 //timeout logger

 client.on("guildMemberUpdate", (oldMember, newMember) => {

 if (!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil) {

  const embed = new EmbedBuilder()
   .setTitle("Member Timed Out")
   .setColor("Yellow")
   .addFields(
    { name: "User", value: `${newMember.user.tag}` }
   )

  sendLog(newMember.guild, embed)

 }

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

 if (message.author.bot) return

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

/* ---------------- MIRROR ---------------- */

const mirror = JSON.parse(fs.readFileSync("./data/mirror.json"))

if (mirror[message.channel.id]) {

 const targetChannel = message.guild.channels.cache.get(mirror[message.channel.id])

 if (targetChannel) {

  targetChannel.send({
   content: message.content,
   allowedMentions: { parse: [] }
  })

 }

}
 /* ---------------- AUTORESPONDER ---------------- */

 const autores = JSON.parse(fs.readFileSync("./data/autoresponder.json"))

 for (let trigger in autores) {
  if (message.content.toLowerCase().includes(trigger)) {
   message.channel.send(autores[trigger])
  }
 }

 //Logger helper

 const { EmbedBuilder } = require("discord.js")

function sendLog(guild, embed) {

 const data = JSON.parse(fs.readFileSync("./data/logs.json"))

 const logChannelId = data[guild.id]

 if (!logChannelId) return

 const channel = guild.channels.cache.get(logChannelId)

 if (!channel) return

 channel.send({ embeds: [embed] })
}


 /* ---------------- COMMAND HANDLER ---------------- */

 if (!message.content.startsWith(prefix)) return

 const args = message.content.slice(prefix.length).trim().split(/ +/)
 const cmd = args.shift().toLowerCase()

 const command = client.commands.get(cmd)

 if (!command) return

 command.execute(message, args)
})
console.log("TOKEN:", process.env.TOKEN)

client.login(process.env.TOKEN)
