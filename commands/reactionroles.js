const fs = require("fs")

module.exports = {

 name: "reactionrole",

 async execute(message, args) {

  const channel = message.mentions.channels.first()
  const role = message.mentions.roles.first()
  const emoji = args[2]

  if (!channel || !role || !emoji)
   return message.reply("Usage: !reactionrole #channel @role 😀")

  const msg = await channel.send(`React with ${emoji} to get ${role}`)

  await msg.react(emoji)

  const data = JSON.parse(fs.readFileSync("./data/reactionroles.json"))

  data[msg.id] = {
   role: role.id,
   emoji: emoji
  }

  fs.writeFileSync("./data/reactionroles.json", JSON.stringify(data, null, 2))

  message.reply("Reaction role created")

 }

}
