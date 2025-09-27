const fs = require("fs");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { musicFolder } = require("../utils/musicPlayer");

module.exports = {
	name: "list",
	run: async (message) => {
		const files = fs.readdirSync(musicFolder).filter((f) => f.endsWith(".mp3"));
		if (!files.length) return message.channel.send("❌ No music files found.");

		const itemsPerPage = 5; 
		const totalPages = Math.ceil(files.length / itemsPerPage);
		let currentPage = 0;

		const generateEmbed = (page) => {
			const start = page * itemsPerPage;
			const end = start + itemsPerPage;
			const fileList = files
				.slice(start, end)
				.map((file, index) => `${start + index + 1}. ${file}`)
				.join("\n");

			return {
				content: `🎶 **Available music files (Page ${
					page + 1
				}/${totalPages}):**\n${fileList}`,
			};
		};

		const getButtons = () =>
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId("prev")
					.setLabel("Prev")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(currentPage === 0),
				new ButtonBuilder()
					.setCustomId("next")
					.setLabel("Next")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(currentPage === totalPages - 1)
			);

		const msg = await message.channel.send({
			...generateEmbed(currentPage),
			components: [getButtons()],
		});

		const collector = msg.createMessageComponentCollector({
			time: 60000, 
		});

		collector.on("collect", async (interaction) => {
			if (!interaction.isButton()) return;
			if (interaction.customId === "prev" && currentPage > 0) currentPage--;
			if (interaction.customId === "next" && currentPage < totalPages - 1)
				currentPage++;

			await interaction.update({
				...generateEmbed(currentPage),
				components: [getButtons()],
			});
		});

		collector.on("end", async () => {
			await msg.edit({ components: [] });
		});
	},
};
