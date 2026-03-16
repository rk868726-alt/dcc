const { PermissionsBitField } = require("discord.js")

module.exports = {
 name: "purge",

 async execute(message, args) {

  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
   return message.reply("❌ You don't have permission to use this command.")

  const amount = parseInt(args[0])

  if (!amount)
   return message.reply("⚠️ Please specify the number of messages to delete.")

  if (amount > 100)
   return message.reply("⚠️ You can delete maximum **100 messages** at once.")

  const deleted = await message.channel.bulkDelete(amount, true)

  message.channel.send(`🧹 Deleted **${deleted.size} messages**.`).then(msg => {
   setTimeout(() => msg.delete(), 3000)
  })

 }
}
