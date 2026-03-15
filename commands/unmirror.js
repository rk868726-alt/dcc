const fs = require("fs")

module.exports = {
 name: "unmirror",

 execute(message, args) {

  if (!message.member.permissions.has("ManageChannels"))
   return message.reply("You need Manage Channels permission")

  const channel = message.mentions.channels.first()

  if (!channel)
   return message.reply("Usage: !unmirror #channel")

  let data = JSON.parse(fs.readFileSync("./data/mirror.json"))

  if (!data[channel.id])
   return message.reply("This channel is not mirrored")

  delete data[channel.id]

  fs.writeFileSync("./data/mirror.json", JSON.stringify(data, null, 2))

  message.reply(`Mirror removed for ${channel}`)
 }
}
