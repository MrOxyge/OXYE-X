
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, REST, Routes, Collection, ChannelType, Partials } = require('discord.js');
const config = require('./config/config.js');
const MonitoringService = require('./utils/monitoringService.js');
const walletMonitor = require('./utils/walletMonitor.js');
const RealLTCManager = require('./utils/realLTC.js');
const AntiNuke = require('./utils/antiNuke.js');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping
    ],
    partials: [Partials.Channel] // Required for DM support
});

// Create collections for both dot commands and slash commands
client.commands = new Collection();
client.slashCommands = new Collection();

// Load dot prefix commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('🔄 Loading dot prefix commands...');
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Handle slash commands (with .data property)
    if ('data' in command && 'execute' in command) {
        client.slashCommands.set(command.data.name, command);
        console.log(`✅ Loaded slash command: /${command.data.name}`);
    }
    // Handle dot prefix commands (with .name property)
    else if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
    } 
}

console.log(`✅ Successfully loaded ${client.commands.size} dot prefix commands.`);
console.log(`✅ Successfully loaded ${client.slashCommands.size} slash commands.`);

// Initialize monitoring service
const monitoringService = new MonitoringService(client);

// Initialize anti-nuke protection
client.antiNuke = new AntiNuke(client);

// Event handler for when the client is ready
client.once('ready', async () => {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`🤖 Bot ID: ${client.user.id}`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
    
    // Register slash commands globally
    if (client.slashCommands.size > 0) {
        const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);
        
        try {
            console.log('🔄 Registering slash commands globally...');
            
            const commands = client.slashCommands.map(command => command.data.toJSON());
            
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            
            console.log(`✅ Successfully registered ${commands.length} slash commands globally.`);
        } catch (error) {
            console.error('❌ Error registering slash commands:', error);
        }
    }
    console.log(`🔧 Bot configured intents: ${client.options.intents.bitfield}`);
    console.log(`📬 DM support: ${client.options.intents.has('DirectMessages') ? 'ENABLED' : 'DISABLED'}`);
    
    // Create multiple invite links for maximum compatibility
    const adminLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`;
    const basicLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=274878221312&scope=bot`;
    const slashLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
    
    console.log(`🔗 ADMIN INVITE (Best): ${adminLink}`);
    console.log(`🔗 BASIC INVITE: ${basicLink}`);  
    console.log(`🔗 WITH SLASH COMMANDS: ${slashLink}`);
    console.log(`👑 Use these links to invite the bot to ANY Discord server!`);
    console.log(`💬 After inviting, the bot works in that server AND can DM users from that server!`);
    console.log(`🛡️ Anti-Nuke protection is now active! Use .antinuke help for commands.`);

    // Set bot status to show it's a payment bot with anti-nuke
    client.user.setActivity('LTC Payment Bot + Anti-Nuke | .help', { type: 'WATCHING' });

    // Initialize LTC wallet for payments only
    if (process.env.LTC_PRIVATE_KEY || process.env.LTC_ADDRESS) {
        try {
            const ltcManager = new RealLTCManager();
            const walletAddress = ltcManager.getWalletAddress();
            console.log(`💰 Connected LTC wallet: ${walletAddress}`);
            console.log(`💸 Payment bot ready for transactions`);
        } catch (error) {
            console.error('❌ Error initializing wallet:', error.message);
        }
    } else {
        console.log('⚠️ No LTC wallet configured - running in mock mode');
    }
});

// Simple rate limiting for public access
const userCooldowns = new Map();
const COOLDOWN_DURATION = 10000; // 10 seconds between commands per user

// Event handler for message-based commands with dot prefix
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith('.')) return;
    
    // Log command usage with detailed debugging
    const isDM = message.channel.type === ChannelType.DM;
    console.log(`📨 Command: ${message.content} | Channel: ${isDM ? 'DM' : message.guild?.name || 'Unknown'} | User: ${message.author.username} | Channel Type: ${message.channel.type}`);
    
    // Immediate acknowledgment that bot received the command
    console.log(`🔄 Processing command for ${message.author.username}...`);

    // Public access enabled - everyone can use the bot
    const OWNER_ID = process.env.OWNER_USER_ID;
    const isOwner = OWNER_ID && message.author.id === OWNER_ID;
    
    // Rate limiting for non-owners only (owner bypasses cooldowns)
    if (!isOwner) {
        const userId = message.author.id;
        const now = Date.now();
        const cooldownExpiry = userCooldowns.get(userId);

        if (cooldownExpiry && now < cooldownExpiry) {
            const remainingTime = Math.ceil((cooldownExpiry - now) / 1000);
            const cooldownEmbed = {
                color: 0xffaa00,
                title: '⏰ Cooldown Active',
                description: `Please wait ${remainingTime} seconds before using another command.`,
                timestamp: new Date().toISOString()
            };
            return await message.reply({ embeds: [cooldownEmbed] });
        }

        userCooldowns.set(userId, now + COOLDOWN_DURATION);
    }

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) {
        return;
    }

    try {
        // Create a mock interaction object for compatibility
        const mockInteraction = {
            user: message.author,
            channel: message.channel,
            guild: message.guild,
            member: message.member,
            reply: async (options) => {
                try {
                    if (typeof options === 'string') {
                        return await message.reply(options);
                    }
                    return await message.reply(options);
                } catch (error) {
                    console.error(`❌ Error replying to message in ${isDM ? 'DM' : 'server'}:`, error);
                    // Try direct channel send as fallback
                    try {
                        console.log(`🔄 Trying fallback send method...`);
                        if (typeof options === 'string') {
                            return await message.channel.send(options);
                        }
                        return await message.channel.send(options);
                    } catch (fallbackError) {
                        console.error(`❌ Fallback send also failed:`, fallbackError);
                        // Try basic text send as last resort
                        try {
                            return await message.channel.send('✅ Command processed successfully!');
                        } catch (finalError) {
                            console.error(`❌ Even basic send failed:`, finalError);
                        }
                    }
                }
            },
            followUp: async (options) => {
                try {
                    if (typeof options === 'string') {
                        return await message.channel.send(options);
                    }
                    return await message.channel.send(options);
                } catch (error) {
                    console.error(`❌ Error sending follow-up:`, error);
                }
            },
            options: {
                getString: (name) => {
                    const index = command.paramOrder?.indexOf(name) || 0;
                    return args[index] || null;
                },
                getNumber: (name) => {
                    const index = command.paramOrder?.indexOf(name) || 0;
                    const value = args[index];
                    return value ? parseFloat(value) : null;
                },
                getInteger: (name) => {
                    const index = command.paramOrder?.indexOf(name) || 0;
                    const value = args[index];
                    return value ? parseInt(value) : null;
                },
                getUser: (name) => {
                    const index = command.paramOrder?.indexOf(name) || 0;
                    const mention = args[index];
                    if (mention && mention.startsWith('<@') && mention.endsWith('>')) {
                        const id = mention.slice(2, -1).replace('!', '');
                        return client.users.cache.get(id);
                    }
                    return null;
                }
            }
        };

        console.log(`✅ Executing command: ${commandName} for user: ${message.author.username}`);
        await command.execute(mockInteraction, args);
        console.log(`✅ Command ${commandName} completed successfully`);
    } catch (error) {
        console.error('Error executing command:', error);
        try {
            await message.reply('❌ There was an error while executing this command!');
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
            try {
                await message.channel.send('❌ Command failed!');
            } catch (sendError) {
                console.error('Failed to send any response:', sendError);
            }
        }
    }
});

// Handle slash command interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) {
        console.log(`❓ Unknown slash command: /${interaction.commandName}`);
        return;
    }

    try {
        console.log(`🔄 Executing slash command: /${interaction.commandName} by ${interaction.user.username}`);
        await command.execute(interaction);
        console.log(`✅ Slash command /${interaction.commandName} executed successfully`);
    } catch (error) {
        console.error(`❌ Error executing slash command /${interaction.commandName}:`, error);
        
        const errorMessage = '❌ There was an error executing this command.';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// Anti-Nuke Event Handlers
client.on('guildMemberAdd', async (member) => {
    if (client.antiNuke) {
        await client.antiNuke.handleMemberJoin(member);
    }
});

client.on('guildBanAdd', async (ban) => {
    if (client.antiNuke) {
        await client.antiNuke.handleBanAdd(ban);
    }
});

client.on('guildBanRemove', async (ban) => {
    if (client.antiNuke) {
        await client.antiNuke.handleBanRemove(ban);
    }
});

client.on('channelCreate', async (channel) => {
    if (client.antiNuke) {
        await client.antiNuke.handleChannelCreate(channel);
    }
});

client.on('channelDelete', async (channel) => {
    if (client.antiNuke) {
        await client.antiNuke.handleChannelDelete(channel);
    }
});

client.on('roleCreate', async (role) => {
    if (client.antiNuke) {
        await client.antiNuke.handleRoleCreate(role);
    }
});

client.on('roleDelete', async (role) => {
    if (client.antiNuke) {
        await client.antiNuke.handleRoleDelete(role);
    }
});

client.on('guildMemberRemove', async (member) => {
    if (client.antiNuke) {
        await client.antiNuke.handleMemberKick(member);
    }
});

client.on('webhookUpdate', async (channel) => {
    if (client.antiNuke) {
        await client.antiNuke.handleWebhookUpdate(channel);
    }
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Load commands for dot prefix system
async function loadCommands() {
    try {
        console.log('🔄 Loading dot prefix commands...');
        let commandCount = 0;

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            if ('name' in command && 'execute' in command) {
                client.commands.set(command.name, command);
                commandCount++;
            }
        }

        console.log(`✅ Successfully loaded ${commandCount} dot prefix commands.`);
    } catch (error) {
        console.error('Error loading commands:', error);
    }
}

// Start the bot
async function startBot() {
    try {
        await loadCommands();
        await client.login(config.DISCORD_TOKEN);
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

startBot();
