const fs = require("fs");
const path = require("path");
const {
	createAudioPlayer,
	createAudioResource,
	AudioPlayerStatus,
	NoSubscriberBehavior,
	joinVoiceChannel,
} = require("@discordjs/voice");

const musicFolder = path.join(__dirname, "../../music");

let queue = [];
let currentPlayer = null;
let connection = null;
let textChannel = null;

const playNext = (voiceChannel) => {
	if (!queue.length) {
		connection?.destroy();
		connection = null;
		currentPlayer = null;
		if (textChannel) textChannel.send("✅ Queue ended. Bot disconnected.");
		return;
	}

	const song = queue.shift();
	const resource = createAudioResource(path.join(musicFolder, song));

	if (!currentPlayer) {
		currentPlayer = createAudioPlayer({
			behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
		});
	}

	currentPlayer.play(resource);

	currentPlayer.once(AudioPlayerStatus.Idle, () => {
		playNext(voiceChannel);
	});

	if (!connection) {
		connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		});

		connection.on("error", (error) => {
			console.error("Voice connection error:", error);
			queue = [];
			currentPlayer?.stop();
			connection.destroy();
			connection = null;
			currentPlayer = null;
			if (textChannel)
				textChannel.send("❌ Voice connection error. Playback stopped.");
		});
	}

	connection.subscribe(currentPlayer);

	currentPlayer.on("error", (error) => {
		console.error("Audio player error:", error);
		if (textChannel)
			textChannel.send("❌ Error playing song, skipping to next...");
		playNext(voiceChannel);
	});

	if (textChannel) textChannel.send(`🎵 Now playing: **${song}**`);
};

const addToQueue = (songs, voiceChannel, channel) => {
	textChannel = channel;
	queue.push(...songs);
	if (!currentPlayer) playNext(voiceChannel);
};

const skipSong = () => {
	if (currentPlayer) currentPlayer.stop();
};

const stopPlayback = () => {
	queue = [];
	if (currentPlayer) currentPlayer.stop();
	if (connection) {
		connection.destroy();
		connection = null;
		currentPlayer = null;
	}
};

module.exports = {
	musicFolder,
	playNext,
	addToQueue,
	skipSong,
	stopPlayback,
	queue,
};
