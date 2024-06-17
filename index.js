const TelegramBot = require("node-telegram-bot-api");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

// Replace with your own Telegram bot token
const token = "7390359895:AAH8TrulQh9Ws3GSyamfM-HNQcrJQ5aTSg4";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        "Welcome! Send me a YouTube video link to download.",
    );
});

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const url = msg.text;

    // Check if the message text is a valid URL
    if (!ytdl.validateURL(url)) {
        bot.sendMessage(chatId, "Please send a valid YouTube link.");
        return;
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, {
            quality: "highest",
            filter: "audioandvideo",
        });

        if (!format) {
            bot.sendMessage(
                chatId,
                "Sorry, couldn't find a downloadable video.",
            );
            return;
        }

        const videoTitle = info.videoDetails.title;
        const filePath = path.join(__dirname, `${videoTitle}.mp4`);

        // Download the video
        bot.sendMessage(chatId, `Downloading "${videoTitle}"...`);
        ytdl(url, { format: format })
            .pipe(fs.createWriteStream(filePath))
            .on("finish", () => {
                // Send the downloaded file
                bot.sendVideo(chatId, filePath, { caption: videoTitle }).then(
                    () => {
                        // Cleanup: Delete the downloaded file from the server
                        fs.unlink(filePath, (err) => {
                            if (err) throw err;
                        });
                        bot.sendMessage(chatId, "Video sent successfully!");
                    },
                );
            })
            .on("error", (err) => {
                bot.sendMessage(
                    chatId,
                    `Error downloading video: ${err.message}`,
                );
            });
    } catch (err) {
        bot.sendMessage(chatId, `Error: ${err.message}`);
    }
});

console.log("Bot is running...");

const keepAlive = require("./server");
const Monitor = require("ping-monitor");

keepAlive();
const monitor = new Monitor({
    website: "",
    title: "NAME",
    interval: 2,
});

monitor.on("up", (res) => console.log(`${res.website} its on.`));
monitor.on("down", (res) =>
    console.log(`${res.website} it has died - ${res.statusMessage}`),
);
monitor.on("stop", (website) => console.log(`${website} has stopped.`));
monitor.on("error", (error) => console.log(error));
