const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

module.exports = {
 name: "ticketpanel",

 async execute(message) {

  const embed = new EmbedBuilder()
   .setColor("Blue")
   .setTitle("🎫 Support Tickets")
   .setDescription("Click the button below to create a support ticket.")

  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder()
    .setCustomId("create_ticket")
    .setLabel("Create Ticket")
    .setStyle(ButtonStyle.Primary)
  )

  message.channel.send({ embeds: [embed], components: [row] })

 }
}
