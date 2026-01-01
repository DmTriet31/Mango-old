const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');
const cmdIcons = require('../../UI/icons/commandicons');
const { helpBanner } = require('../../UI/banners/SetupBanners');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Hiển thị danh sách lệnh và thông tin bot'),

    async execute(interaction) {
      
        await interaction.deferReply();
        
        if (interaction.isCommand && interaction.isCommand()) {
     
            const BOT_ICON = "https://cdn.discordapp.com/attachments/1367522678420013146/1367522900445495446/standard_1.gif?ex=6814e472&is=681392f2&hm=5e8a8d444f74a6fea7bdda586a483f2e2a2278e3f55ed4a1c30c92366b0a7570&";
            const EMBED_COLOR = "#5865F2"; 
            const FOOTER_TEXT = "Mango • DmTriet | Hệ điều hành Discord";
            const COMMANDS_DIR = path.join(__dirname, '../../commands');
            const EXCESS_COMMANDS_DIR = path.join(__dirname, '../../excesscommands');

         
            const CATEGORY_ICONS = {
                utility: "🛠️",
                moderation: "🛡️",
                fun: "🎮",
                music: "🎵",
                economy: "💰",
                admin: "⚙️",
                info: "ℹ️",
                games: "🎲",
                settings: "🔧",
                misc: "📦"
            };
        
            const getEnabledCategories = (configSet) =>
                Object.entries(configSet)
                    .filter(([_, enabled]) => enabled)
                    .map(([name]) => name);

        
            const readCommands = (basePath, categories) => {
                const commandData = {};
                for (const [category, enabled] of Object.entries(categories)) {
                    if (!enabled) continue;
                    const categoryPath = path.join(basePath, category);

                    try {
                        if (!fs.existsSync(categoryPath)) {
                            continue;
                        }

                        const commands = fs.readdirSync(categoryPath)
                            .filter(file => file.endsWith('.js'))
                            .map(file => {
                                try {
                                    const cmd = require(path.join(categoryPath, file));
                                  
                                    let subcommands = [];
                                    if (cmd.data?.toJSON) {
                                        const dataJSON = cmd.data.toJSON();
                                        if (dataJSON.options && Array.isArray(dataJSON.options)) {
                                            for (const option of dataJSON.options) {
                                                if (option.type === 1) {
                                                    subcommands.push(option.name);
                                                } else if (option.type === 2 && option.options) {
                                                    const groupSubs = option.options
                                                        .filter(opt => opt.type === 1)
                                                        .map(opt => opt.name);
                                                    subcommands.push(`${option.name}: ${groupSubs.join(', ')}`);
                                                }
                                            }
                                        }
                                    }
                                    return {
                                        name: cmd.data?.name || cmd.name || 'lệnh-không-tên',
                                        description: cmd.data?.description || cmd.description || 'Không có mô tả',
                                        subcommands: subcommands
                                    };
                                } catch (error) {
                                    console.error(`Lỗi tải lệnh ${file} trong ${category}:`, error);
                                    return null;
                                }
                            })
                            .filter(cmd => cmd !== null);

                        if (commands.length > 0) {
                            commandData[category] = commands;
                        }
                    } catch (error) {
                        console.error(`Lỗi tải module ${category}:`, error);
                    }
                }
                return commandData;
            };

          
            const createPages = (commandSet, type) => {
                const pages = [];
                const prefixCount = Object.values(prefixCommands).reduce((acc, cmds) => acc + cmds.length, 0);
                const totalCommandsLoaded = Object.values(commandSet).reduce((acc, cmds) => acc + cmds.length, 0);
                let masterCount = 0;
                let subCount = 0;
                for (const category in commandSet) {
                    const cmds = commandSet[category];
                    masterCount += cmds.length;
                    for (const cmd of cmds) {
                        subCount += (cmd.subcommands ? cmd.subcommands.length : 0);
                    }
                }
                const totalCount = masterCount + subCount + prefixCount;

                
                pages.push({
                    title: '✨ Mango',
                    description: [
                        '### Hệ điều hành Discord',
                        '',
                        '> Bot Discord toàn diện cho mọi nhu cầu máy chủ',
                        '',
                        '**THỐNG KÊ BOT**',
                        `\`🧠\` **Phiên bản:** 1.2.2`,
                        `\`🛠️\` **Tổng số lệnh:** ${totalCount}`,
                        `\`⚙️\` **Lệnh đã tải:** ${totalCommandsLoaded}`,
                        `\`📌\` **Lệnh chính:** ${masterCount}`,
                        `\`📎\` **Lệnh phụ:** ${subCount}`,
                        `\`💻\` **Lệnh Prefix:** ${Object.values(config.excessCommands).some(v => v) ? '`Bật`' : '`Tắt`'}`,
                        '',
                    ].join('\n'),
                    author: { name: 'Mango • TRUNG TÂM LỆNH' },
                    icon: '📚'
                });

              
                for (const [category, commands] of Object.entries(commandSet)) {
                    if (commands.length === 0) continue;

                    const totalSubcommands = commands.reduce((acc, cmd) => {
                        return acc + (cmd.subcommands ? cmd.subcommands.length : 0);
                    }, 0);
                    const totalNoOfCommands = commands.length + totalSubcommands;
                    
                    const categoryIcon = CATEGORY_ICONS[category.toLowerCase()] || "📁";
                    
                    const commandLines = commands.map(cmd => {
                        let line = `\`${cmd.name}\` • ${cmd.description}`;
                        if (cmd.subcommands && cmd.subcommands.length > 0) {
                            line += `\n> **Lệnh phụ (${cmd.subcommands.length}):**\n`;
                            cmd.subcommands.forEach(subcmd => {
                                line += `> • \`${subcmd}\`\n`;
                            });
                        }
                        return line;
                    });

                    pages.push({
                        title: `${categoryIcon} Lệnh ${category.charAt(0).toUpperCase() + category.slice(1)}`,
                        description: [
                            `### MODULE ${category.toUpperCase()}`,
                            '',
                            '**THỐNG KÊ MODULE**',
                            `\`📊\` **Tổng lệnh:** ${totalNoOfCommands}`,
                            `\`🔍\` **Lệnh chính:** ${commands.length}`,
                            `\`🔗\` **Lệnh phụ:** ${totalSubcommands}`,
                            `\`⌨️\` **Cách dùng:** ${type === 'slash' ? '`Slash Command`' : `\`Prefix: ${config.prefix}\``}`,
                            ''
                        ].join('\n'),
                        commands: commandLines,
                        author: { name: `${category.toUpperCase()} • MODULE LỆNH` },
                        icon: categoryIcon 
                    });
                }

                return pages;
            };

            const slashCommands = readCommands(COMMANDS_DIR, config.categories);
            const prefixCommands = readCommands(EXCESS_COMMANDS_DIR, config.excessCommands);

            const slashPages = createPages(slashCommands, 'slash');
            const prefixPages = createPages(prefixCommands, 'prefix');

          
            let currentPage = 0;
            let currentSet = slashPages;
            let isPrefix = false;

            const createEmbed = () => {
                const page = currentSet[currentPage];
                const embed = new EmbedBuilder()
                    .setColor(EMBED_COLOR)
                    .setTitle(page.title)
                    .setDescription(page.description)
                    .setAuthor({
                        name: page.author.name,
                        iconURL: BOT_ICON,
                        url: "https://discord.gg/hZM6zS9Km7"
                    })
                    .setImage(helpBanner)
                    .setFooter({ text: `${FOOTER_TEXT} • Trang ${currentPage + 1}/${currentSet.length}` })
                    .setTimestamp();

                if (page.commands && page.commands.length > 0) {
                    const joinedCommands = page.commands.join('\n\n');
                    if (joinedCommands.length > 1024) {
                        const fields = [];
                        let fieldValue = '';
                        let fieldCount = 1;

                        for (const line of page.commands) {
                            if (fieldValue.length + line.length + 2 > 1024) {
                                fields.push({ 
                                    name: `Danh sách lệnh (Phần ${fieldCount})`, 
                                    value: fieldValue.trim() 
                                });
                                fieldCount++;
                                fieldValue = line + '\n\n';
                            } else {
                                fieldValue += line + '\n\n';
                            }
                        }
                        if (fieldValue) {
                            fields.push({ 
                                name: `Danh sách lệnh ${fieldCount > 1 ? `(Phần ${fieldCount})` : ''}`, 
                                value: fieldValue.trim() 
                            });
                        }
                        embed.setFields(fields);
                    } else {
                        embed.setFields([{ name: '💎 Các lệnh khả dụng', value: joinedCommands }]);
                    }
                }
                return embed;
            };

           
            const createComponents = () => {
                const row1 = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('pageSelect')
                        .setPlaceholder('📋 Chọn danh mục...')
                        .addOptions(currentSet.map((page, i) => {
                            return {
                                label: page.title.replace(/^[^\w\s]\s*/, ''), 
                                value: i.toString(),
                                description: `Xem mục ${page.title.replace(/^[^\w\s]\s*/, '')}`,
                                emoji: page.icon 
                            };
                        }))
                );

                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Trang trước')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Trang sau')
                        .setEmoji('➡️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(currentPage === currentSet.length - 1),
                    new ButtonBuilder()
                        .setCustomId('switchMode')
                        .setLabel(isPrefix ? 'Lệnh Slash' : 'Lệnh Prefix')
                        .setEmoji('🔄')
                        .setStyle(ButtonStyle.Primary)
                );

                return [row1, row2];
            };

        
            const reply = await interaction.editReply({
                embeds: [createEmbed()],
                components: createComponents(),
                fetchReply: true
            });

        
            const collector = reply.createMessageComponentCollector({ time: 180000 }); 

            collector.on('collect', async (i) => {
                try {
                    if (i.user.id !== interaction.user.id) {
                        await i.reply({ 
                            content: `⚠️ Chỉ ${interaction.user.tag} mới được sử dụng bảng điều khiển này.`, 
                            ephemeral: true 
                        });
                        return;
                    }

                    await i.deferUpdate();

                    if (i.isStringSelectMenu()) {
                        currentPage = parseInt(i.values[0]);
                    } else if (i.isButton()) {
                        switch (i.customId) {
                            case 'previous':
                                currentPage = Math.max(0, currentPage - 1);
                                break;
                            case 'next':
                                currentPage = Math.min(currentSet.length - 1, currentPage + 1);
                                break;
                            case 'switchMode':
                                isPrefix = !isPrefix;
                                currentSet = isPrefix ? prefixPages : slashPages;
                                currentPage = 0;
                                break;
                        }
                    }

                    await i.editReply({
                        embeds: [createEmbed()],
                        components: createComponents()
                    });
                } catch (error) {
                    try {
                        const errorMethod = i.replied || i.deferred ? i.editReply : i.reply;
                        await errorMethod.call(i, {
                            content: '⚠️ Đã xảy ra lỗi khi xử lý thao tác. Vui lòng thử lại.',
                            ephemeral: true
                        });
                    } catch (secondaryError) {}
                }
            });

            collector.on('end', () => {
                interaction.editReply({ 
                    content: "⏱️ Phiên trợ giúp đã hết hạn. Dùng lại `/help` để mở lại."
                }).catch(() => {});
            });
        } else {
            const embed = new EmbedBuilder()
                .setColor('#ff3860')
                .setAuthor({
                    name: "Lỗi lệnh",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/hZM6zS9Km7"
                })
                .setDescription('> ⚠️ Lệnh này chỉ dùng được với slash command!\n> Vui lòng sử dụng `/help`.')
                .setFooter({ text: 'Mango • Lỗi' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
};
