const fs = require("fs")

module.exports = {
 name: "setlogs",

 execute(message) {

  if (!message.member.permissions.has("Administrator"))
   return message.reply("Administrator permission required")

  const channel = message.mentions.channels.first()

  if (!channel)
   return message.reply("Usage: !setlogs #log-channel")

  let data = JSON.parse(fs.readFileSync("./data/logs.json"))

  data[message.guild.id] = channel.id

  fs.writeFileSync("./data/logs.json", JSON.stringify(data, null, 2))

  message.reply(`Log channel set to ${channel}`)
 }
}
