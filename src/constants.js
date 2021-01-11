/* eslint-disable indent */
module.exports = {
    methodAlias: {
        api: 'getAPIStatus',
        booster: 'getBoosters',
        leaderboards: 'getLeaderboards',
        lb: 'getLeaderboards',
        online: 'getOnline',
        ping: 'getPing',
        recentgames: 'getRecentGames',
        status: 'getStatus',
        watchdog: 'getWatchdogStats',
        player: 'getPlayer',
        guild: 'getGuild',
        friend: 'getFriends',
        playerauctions: 'getSkyblockAuctionsByPlayer',
        sbmember: 'getSkyblockMember',
        sbprofile: 'getSkyblockProfiles',
        sbbazaar: 'getSkyblockBazaar'
    },
    minigames: [
        {
            name: 'skywars',
            aliases: ['sw', 'skywars']
        },
        {
            name: 'bedwars',
            aliases: ['bw', 'bedwars']
        },
        {
            name: 'duels',
            aliases: ['duels', 'duel']
        },
        {
            name: 'murdermystery',
            aliases: ['murder', 'mm', 'murdermystery']
        }
    ]
};
