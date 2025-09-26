const fs = require("fs");
const path = require("path");
const { musicFolder, addToQueue } = require("../utils/musicPlayer");

module.exports = {
	name: "play",
	run: (message, args) => {
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel)
			return message.reply("❌ You must be in a voice channel!");

		const files = fs.readdirSync(musicFolder).filter((f) => f.endsWith(".mp3"));
		if (!files.length)
			return message.channel.send("❌ No music files available.");

		let songsToAdd = [];

		if (args.length) {
			const input = args.join(" ").trim().toLowerCase();
			const num = parseInt(input, 10);

			if (!isNaN(num) && num >= 1 && num <= files.length) {
				songsToAdd.push(files[num - 1]);
				message.channel.send(`➕Added to queue: **${files[num - 1]}**`);
			} else {
				// Find exact match ignoring case
				const matchedFile = files.find((f) => f.toLowerCase() === input);

				if (!matchedFile)
					return message.channel.send(`❌ Song not found: ${args.join(" ")}`);

				songsToAdd.push(matchedFile);
				message.channel.send(`➕Added to queue: **${matchedFile}**`);
			}
		} else {
			songsToAdd.push(...files);
			message.channel.send(
				`➕Added all songs in folder to queue(${files.length} songs)`
			);
		}

		addToQueue(songsToAdd, voiceChannel, message.channel);
	},
};
