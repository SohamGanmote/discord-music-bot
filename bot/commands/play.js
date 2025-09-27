const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const fs = require("fs");
const path = require("path");
const { musicFolder } = require("../utils/musicPlayer");

module.exports = {
	name: "play",
	run: async (message, args) => {
		const files = fs.readdirSync(musicFolder).filter((f) => f.endsWith(".mp3"));
		if (!files.length) return message.channel.send("❌ No music files available.");

		// Determine songs to play
		let songsToPlay = [];
		if (!args.length) {
			// No args → play all songs
			songsToPlay = files;
		} else {
			const input = args.join(" ").trim().toLowerCase();
			const songNumber = parseInt(input, 10);

			if (!isNaN(songNumber) && songNumber >= 1 && songNumber <= files.length) {
				songsToPlay.push(files[songNumber - 1]);
			} else {
				let song = files.find(f => f.toLowerCase() === input);
				if (!song) song = files.find(f => f.toLowerCase().includes(input));
				if (!song) return message.channel.send(`❌ Song not found: ${args.join(" ")}`);
				songsToPlay.push(song);
			}
		}

		// Join voice channel
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) return message.channel.send("❌ You must join a voice channel first!");
		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: message.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

		const player = createAudioPlayer();
		connection.subscribe(player);

		// Function to play songs recursively
		let currentIndex = 0;
		const playSong = () => {
			if (currentIndex >= songsToPlay.length) {
				message.channel.send("✅ Finished playing all songs.");
				// Reset rich presence
				message.client.user.setPresence({ activities: [], status: "online" });
				return;
			}

			const song = songsToPlay[currentIndex];
			const filePath = path.join(musicFolder, song);
			const resource = createAudioResource(filePath);

			player.play(resource);
			message.channel.send(`🎶 Now playing: **${song}**`);

			// Update bot rich presence
			message.client.user.setPresence({
				activities: [{ name: song, type: 2 }],
				status: "online",
			});

			currentIndex++;
		};

		// Start first song
		playSong();

		// When song ends, play next
		player.on(AudioPlayerStatus.Idle, () => {
			playSong();
		});
	},
};
