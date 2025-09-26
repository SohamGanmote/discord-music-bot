require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Events } = require("discord.js");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	],
});

const commands = new Map();
const commandFiles = fs
	.readdirSync(path.join(__dirname, "commands"))
	.filter((f) => f.endsWith(".js"));

// Load commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.set(command.name, command);
}

// Ready
client.once(Events.ClientReady, () => {
	console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Handle messages
client.on(Events.MessageCreate, (message) => {
	if (!message.guild || !message.content.startsWith("!")) return;

	const args = message.content.slice(1).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	if (commands.has(commandName)) {
		commands.get(commandName).run(message, args);
	} else {
		const commandsList = [
			"🎵 **!play [number]** - Play a song by its number",
			"⏭ **!skip** - Skip the current song",
			"🛑 **!stop** - Stop playback and disconnect the bot",
			"📜 **!list** - List all available music files",
		];

		const messageContent = `
**Invalid command!**
--------------------------
**Available commands:**
--------------------------
${commandsList.join("\n")}
`;

		message.channel.send(messageContent);
	}
});

client.login(process.env.BOT_TOKEN);
