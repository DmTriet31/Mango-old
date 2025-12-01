const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "random",
  description: "Random food / movie / game / music",
  execute(message, args) {
    const sub = args[0];

    // Danh sách random
    const foodList = [
      "Phở bò", "Bún chả", "Mì cay", "Pizza phô mai",
      "Sushi cá hồi", "Cơm tấm", "Lẩu Thái", "Ramen Nhật",
      "Kimbap", "Bánh mì Việt Nam"
    ];

    const movieList = [
      "Inception", "Your Name", "Interstellar", "John Wick",
      "Spider-Man: No Way Home", "Parasite", "The Conjuring",
      "Avengers: Endgame", "Demon Slayer: Mugen Train"
    ];

    const gameList = [
      "Valorant", "League of Legends", "Minecraft", "CS2",
      "GTA V", "Apex Legends", "PUBG", "Fortnite",
      "Overwatch 2", "Stardew Valley", "Dead by Daylight"
    ];

    const musicList = [
      "Happier — Marshmello",
      "Nevada — Vicetone",
      "Night Changes — One Direction",
      "Double Take — Dhruv",
      "On The Ground — ROSÉ",
      "Stay — The Kid LAROI & Justin Bieber",
      "Unstoppable — Sia",
      "Lovely — Billie Eilish",
      "Shape of You — Ed Sheeran",
      "Monody — TheFatRat"
    ];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Màu embed random
    const colors = [
      0xff4b4b, // đỏ
      0x4bff8a, // xanh lá
      0x4bd0ff, // xanh biển
      0xbd4bff, // tím
      0xffa44b  // cam
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    if (!sub)
      return message.reply("❌ Dùng: `.random food | movie | game | music`");

    let title = "";
    let result = "";

    if (sub === "food") {
      title = "🍜 Gợi ý món ăn";
      result = pick(foodList);
    } else if (sub === "movie") {
      title = "🎬 Gợi ý phim";
      result = pick(movieList);
    } else if (sub === "game") {
      title = "🎮 Gợi ý game";
      result = pick(gameList);
    } else if (sub === "music") {
      title = "🎵 Gợi ý bài nhạc";
      result = pick(musicList);
    } else {
      return message.reply("❌ Sai cú pháp! Dùng `.random food | movie | game | music`");
    }

    // Embed đẹp
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(`**✨ Kết quả:** \n${result}`)
      .setColor(randomColor)
      .setFooter({ text: "Mango Bot — Random Generator" })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};
