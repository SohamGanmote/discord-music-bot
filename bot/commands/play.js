// Inside your play command, after you start a song
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const path = require("path");

module.exports = {
	name: "play",
	run: async (message, args) => {
		if (!args.length) {
			return message.channel.send("❌ Please provide the song number from !list");
		}

		// Example: get song file from your music folder
		const songNumber = parseInt(args[0]);
		const fs = require("fs");
		const { musicFolder } = require("../utils/musicPlayer");
		const files = fs.readdirSync(musicFolder).filter((f) => f.endsWith(".mp3"));

		if (isNaN(songNumber) || songNumber < 1 || songNumber > files.length) {
			return message.channel.send("❌ Invalid song number.");
		}

		const song = files[songNumber - 1];
		const filePath = path.join(musicFolder, song);

		// join voice channel
		if (!message.member.voice.channel)
			return message.channel.send("❌ You must join a voice channel first!");
		const connection = joinVoiceChannel({
			channelId: message.member.voice.channel.id,
			guildId: message.guild.id,
			adapterCreator: message.guild.voiceAdapterCreator,
		});

		// play audio
		const player = createAudioPlayer();
		const resource = createAudioResource(filePath);
		connection.subscribe(player);
		player.play(resource);

		message.channel.send(`🎶 Now playing: **${song}**`);

		// 🎵 Set rich presence
		message.client.user.setPresence({
			activities: [
				{
					name: song,
					type: 2, // 2 = LISTENING
				},
			],
			status: "online",
		});
	},
};
