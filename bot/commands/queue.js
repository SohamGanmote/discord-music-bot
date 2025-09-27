const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { queue } = require("../utils/musicPlayer");

module.exports = {
	name: "queue",
	run: async (message) => {
		if (!queue.length) {
			return message.channel.send("🎶 The queue is currently **empty**.");
		}

		const itemsPerPage = 5;
		const totalPages = Math.ceil(queue.length / itemsPerPage);
		let currentPage = 0;

		const generateEmbed = (page) => {
			const start = page * itemsPerPage;
			const end = start + itemsPerPage;
			const queueList = queue
				.slice(start, end)
				.map(
					(song, index) =>
						`**${start + index + 1}.** ${song.replace(/\.mp3$/i, "")}`
				)
				.join("\n");

			return {
				embeds: [
					{
						color: 0x1db954,
						title: "🎵 Current Music Queue",
						description: queueList,
						footer: {
							text: `Page ${page + 1} of ${totalPages}`,
						},
					},
				],
			};
		};

		const getButtons = () =>
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId("prev")
					.setLabel("⬅ Prev")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(currentPage === 0),
				new ButtonBuilder()
					.setCustomId("next")
					.setLabel("Next ➡")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(currentPage === totalPages - 1)
			);

		const msg = await message.channel.send({
			...generateEmbed(currentPage),
			components: [getButtons()],
		});

		const collector = msg.createMessageComponentCollector({
			time: 60000, // 1 min
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
