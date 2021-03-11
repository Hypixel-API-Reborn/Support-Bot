class Utils {
  constructor () {
    this.constants = {
      rankColors: {
        'Default': '',
        'VIP': 'https://dummyimage.com/32/00ff00/00ff00.png',
        'MVP': 'https://dummyimage.com/32/00ffff/00ffff.png',
        'MVP++': 'https://dummyimage.com/32/ffaa00/ffaa00.png',
        'Helper': 'https://dummyimage.com/32/5555FF/5555FF.png',
        'Admin': 'https://dummyimage.com/32/AA0000/AA0000.png',
        'Moderator': 'https://dummyimage.com/32/00AA00/00AA00.png',
        'OWNER': 'https://dummyimage.com/32/AA0000/AA0000.png'
      },
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
        sbbazaar: 'getSkyblockBazaar',
        sbnews: 'getSkyblockNews'
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
  }
  isArrayOfStrings (arr) {
    const res = []; for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== 'string') {
        res.push(false); continue;
      } res.push(true);
    } return !res.includes(false);
  }
  getFromObject (obj, path) {
    const ar = path.split('.'); let o = obj; for (let i = 0; i < ar.length; i++) {
      if (!o[ar[i]]) {
        return undefined;
      } o = o[ar[i]];
    } return o;
  }
}
module.exports = Utils;
