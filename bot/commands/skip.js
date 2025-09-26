const { skipSong } = require("../utils/musicPlayer");

module.exports = {
	name: "skip",
	run: (message) => {
		skipSong();
		message.channel.send("⏭ Skipping current song...");
	},
};
