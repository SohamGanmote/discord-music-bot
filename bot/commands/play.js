const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const path = require("path");

const queue = new Map();
const musicFolder = path.join(__dirname, "..", "music");

function addToQueue(songs, voiceChannel, textChannel) {
	const serverQueue = queue.get(voiceChannel.guild.id) || {
		songs: [],
		player: createAudioPlayer(),
		connection: null,
		textChannel,
	};
	serverQueue.songs.push(...songs);

	// Save queue
	queue.set(voiceChannel.guild.id, serverQueue);

	// If nothing is playing, start immediately
	if (!serverQueue.connection) {
		serverQueue.connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

		serverQueue.connection.subscribe(serverQueue.player);
		playNext(voiceChannel.guild.id);
	}
}

function playNext(guildId) {
	const serverQueue = queue.get(guildId);
	if (!serverQueue) return;

	const song = serverQueue.songs.shift();
	if (!song) {
		// Nothing left → reset presence
		serverQueue.textChannel.client.user.setPresence({
			activities: [],
			status: "online",
		});
		serverQueue.player.stop();
		queue.delete(guildId);
		return;
	}

	const resource = createAudioResource(path.join(musicFolder, song));
	serverQueue.player.play(resource);

	// Announce now playing
	serverQueue.textChannel.send(`🎶 Now playing: **${song}**`);

	// ✅ Update bot presence (Rich Presence)
	serverQueue.textChannel.client.user.setPresence({
		activities: [
			{
				name: song,
				type: 2, // LISTENING
			},
		],
		status: "online",
	});

	// When song ends, play next
	serverQueue.player.once(AudioPlayerStatus.Idle, () => {
		playNext(guildId);
	});
}

module.exports = { musicFolder, addToQueue };
