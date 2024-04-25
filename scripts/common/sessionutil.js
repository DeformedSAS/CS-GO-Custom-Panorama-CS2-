"use strict";
/// <reference path="../csgo.d.ts" />
var SessionUtil;
(function (SessionUtil) {
    function DoesGameModeHavePrimeQueue(gameModeSettingName) {
        return gameModeSettingName === 'competitive' || gameModeSettingName === 'scrimcomp2v2';
    }
    SessionUtil.DoesGameModeHavePrimeQueue = DoesGameModeHavePrimeQueue;
    function GetMaxLobbySlotsForGameMode(gameMode) {
        let numLobbySlots = 5;
        if (gameMode == "scrimcomp2v2" ||
            gameMode == "cooperative" ||
            gameMode == "coopmission")
            numLobbySlots = 2;
        return numLobbySlots;
    }
    SessionUtil.GetMaxLobbySlotsForGameMode = GetMaxLobbySlotsForGameMode;
    function AreLobbyPlayersPrime() {
        const playersCount = PartyListAPI.GetCount();
        for (let i = 0; i < playersCount; i++) {
            const xuid = PartyListAPI.GetXuidByIndex(i);
            const isFriendPrime = PartyListAPI.GetFriendPrimeEligible(xuid);
            if (isFriendPrime === false) {
                return false;
            }
        }
        return true;
    }
    SessionUtil.AreLobbyPlayersPrime = AreLobbyPlayersPrime;
    function GetNumWinsNeededForRank(skillgroupType) {
        return 10;
    }
    SessionUtil.GetNumWinsNeededForRank = GetNumWinsNeededForRank;
})(SessionUtil || (SessionUtil = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbnV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9jb250ZW50L2NzZ28vcGFub3JhbWEvc2NyaXB0cy9jb21tb24vc2Vzc2lvbnV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFDQUFxQztBQUlyQyxJQUFVLFdBQVcsQ0ErQ3BCO0FBL0NELFdBQVUsV0FBVztJQUVwQixTQUFnQiwwQkFBMEIsQ0FBRSxtQkFBMkI7UUFRdEUsT0FBTyxtQkFBbUIsS0FBSyxhQUFhLElBQUksbUJBQW1CLEtBQUssY0FBYyxDQUFDO0lBQ3hGLENBQUM7SUFUZSxzQ0FBMEIsNkJBU3pDLENBQUE7SUFFRCxTQUFnQiwyQkFBMkIsQ0FBRSxRQUFnQjtRQUk1RCxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBSyxRQUFRLElBQUksY0FBYztZQUM5QixRQUFRLElBQUksYUFBYTtZQUN6QixRQUFRLElBQUksYUFBYTtZQUN6QixhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLE9BQU8sYUFBYSxDQUFDO0lBQ3RCLENBQUM7SUFWZSx1Q0FBMkIsOEJBVTFDLENBQUE7SUFFRCxTQUFnQixvQkFBb0I7UUFFbkMsTUFBTSxZQUFZLEdBQUcsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRTdDLEtBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQ3RDO1lBQ0MsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLGNBQWMsQ0FBRSxDQUFDLENBQUUsQ0FBQztZQUM5QyxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsc0JBQXNCLENBQUUsSUFBSSxDQUFFLENBQUM7WUFFbEUsSUFBSyxhQUFhLEtBQUssS0FBSyxFQUM1QjtnQkFDQyxPQUFPLEtBQUssQ0FBQzthQUNiO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFoQmUsZ0NBQW9CLHVCQWdCbkMsQ0FBQTtJQUVELFNBQWdCLHVCQUF1QixDQUFFLGNBQXNCO1FBRTlELE9BQU8sRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUhlLG1DQUF1QiwwQkFHdEMsQ0FBQTtBQUNGLENBQUMsRUEvQ1MsV0FBVyxLQUFYLFdBQVcsUUErQ3BCIn0=