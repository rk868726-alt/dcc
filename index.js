const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js")
const fs = require("fs")

const config = require("./config.json")

const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers
 ]
})

client.commands = new Map()

const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"))

for (const file of commandFiles) {
 const command = require(`./commands/${file}`)
 client.commands.set(command.name, command)
}

client.on("ready", () => {
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
  const target = message.guild.channels.cache.get(mirror[message.channel.id])
  if (target) target.send(message.content)
 }

 /* ---------------- AUTORESPONDER ---------------- */

 const autores = JSON.parse(fs.readFileSync("./data/autoresponder.json"))

 for (let trigger in autores) {
  if (message.content.toLowerCase().includes(trigger)) {
   message.channel.send(autores[trigger])
  }
 }

 /* ---------------- COMMAND HANDLER ---------------- */

 if (!message.content.startsWith(prefix)) return

 const args = message.content.slice(prefix.length).trim().split(/ +/)
 const cmd = args.shift().toLowerCase()

 const command = client.commands.get(cmd)

 if (!command) return

 command.execute(message, args)
})

client.login(process.env.TOKEN)
