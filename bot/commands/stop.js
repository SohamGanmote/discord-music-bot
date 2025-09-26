const { stopPlayback } = require("../utils/musicPlayer");

module.exports = {
	name: "stop",
	run: (message) => {
		stopPlayback();
		message.channel.send("🛑 Playback stopped and bot disconnected.");
	},
};
