module.exports = {
 name: "ban",

 async execute(message, args) {

  if (!message.member.permissions.has("BanMembers"))
   return message.reply("No permission")

  const user = message.mentions.members.first()

  if (!user) return message.reply("Mention user")

  await user.ban()

  message.channel.send(`${user.user.tag} banned`)
 }
}