const { EmbedBuilder } = require("discord.js")

module.exports = {
 name: "userinfo",

 execute(message) {

  const member = message.mentions.members.first() || message.member

  const embed = new EmbedBuilder()
   .setColor("Green")
   .setTitle("👤 User Information")
   .setThumbnail(member.user.displayAvatarURL())
   .addFields(
    { name: "Username", value: member.user.tag, inline: true },
    { name: "User ID", value: member.id, inline: true },
    { name: "Joined Server", value: member.joinedAt.toDateString(), inline: true },
    { name: "Account Created", value: member.user.createdAt.toDateString(), inline: true }
   )

  message.channel.send({ embeds: [embed] })

 }
}
