const { PermissionsBitField } = require("discord.js")

module.exports = {
 name: "lock",

 async execute(message) {

  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
   return message.reply("❌ You don't have permission to use this command.")

  const channel = message.channel

  await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
   SendMessages: false
  })

  message.channel.send("🔒 Channel locked.")

 }
}
