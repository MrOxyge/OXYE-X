# Discord Bot Invite Instructions

## Your Bot ID: 1398910770087071744

## Method 1: Direct Invite Link
Use this link to invite your bot with full permissions:
```
https://discord.com/api/oauth2/authorize?client_id=1398910770087071744&permissions=274878221312&scope=bot
```

## Method 2: Manual Setup (If links don't work)

1. Go to Discord Developer Portal: https://discord.com/developers/applications
2. Select your application (OXYEPAYOUTER)
3. Go to OAuth2 → URL Generator
4. Select Scopes: ✓ bot
5. Select Bot Permissions: ✓ Administrator (this gives all permissions)
6. Copy the generated URL and use it to invite your bot

## Method 3: Server Settings Invite

1. Go to any Discord server where you have "Manage Server" permission
2. Server Settings → Integrations → Bots and Apps
3. Click "Add Bot" and search for your bot by name: OXYEPAYOUTER
4. Grant Administrator permissions

## Permissions Explained

The bot needs these permissions to work universally:
- Administrator: Full access to all server features
- Send Messages: Reply to commands in channels
- Send Messages in Threads: Work in threaded conversations  
- Use External Emojis: Enhanced message formatting
- Read Message History: Process commands properly

## Troubleshooting

If invite links show "not supported":
1. Your Discord application may need OAuth2 configured
2. Try Method 2 (Manual Setup) instead
3. Ensure you're using the correct Bot ID: 1398910770087071744

## Testing

After inviting, test with:
- `.help` - Show bot commands
- `.test` - Verify bot is working
- `.b` - Check LTC balance

The bot works in:
- Any server where it's invited
- Direct messages (if you share a server with the bot)
- All channels where it has permissions