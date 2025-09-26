const fs = require("fs");
const { musicFolder } = require("../utils/musicPlayer");

module.exports = {
	name: "list",
	run: (message) => {
		const files = fs.readdirSync(musicFolder).filter((f) => f.endsWith(".mp3"));
		if (!files.length) return message.channel.send("❌ No music files found.");

		const fileList = files
			.map((file, index) => `${index + 1}.${file}`)
			.join("\n");
		message.channel.send(`🎶Available music files: \n${fileList}`);
	},
};
