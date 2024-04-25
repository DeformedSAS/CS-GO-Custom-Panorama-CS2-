"use strict";
/// <reference path="csgo.d.ts" />
/// <reference path="rating_emblem.ts" />
/// <reference path="common/commonutil.ts" />
var friendLobby;
(function (friendLobby) {
    let _m_xuid = '';
    let _m_isInPopup = false;
    function Init(elTile) {
        const _m_isPerfectWorld = MyPersonaAPI.GetLauncherType() === "perfectworld" ? true : false;
        _m_xuid = elTile.GetAttributeString('xuid', '(not found)');
        if (_m_xuid === '(not found)') {
            return;
        }
        _m_isInPopup = elTile.GetAttributeString('showinpopup', 'false') === 'true' ? true : false;
        let lobbyType = PartyBrowserAPI.GetPartyType(_m_xuid);
        let gameMode = PartyBrowserAPI.GetPartySessionSetting(_m_xuid, 'game/mode');
        elTile.SetHasClass('playerforhire', (lobbyType === 'nearby'));
        _SetLobbyLeaderNameAvatar(elTile, lobbyType);
        _SetGroupNameLink(elTile, lobbyType);
        _SetPrime(elTile);
        if (!_m_isPerfectWorld) {
            _SetRegion(elTile);
        }
        _SetSkillGroup(elTile, gameMode);
        _SetLobbySettings(elTile, gameMode);
        _SetLobbyPlayerSlots(elTile, gameMode, lobbyType);
        _SetUpJoinBtn(elTile, lobbyType);
        _SetUpLobbiesPopupBtn(elTile);
        _SetDismissButton(elTile, lobbyType);
        elTile.SetHasClass('friendlobby--is-in-popup', _m_isInPopup);
    }
    friendLobby.Init = Init;
    function _SetLobbyLeaderNameAvatar(elTile, lobbyType) {
        let xuidLobbyLeader = PartyBrowserAPI.GetPartyMemberXuid(_m_xuid, 0);
        let rawName = FriendsListAPI.GetFriendName(xuidLobbyLeader);
        elTile.SetDialogVariable('friendname', $.HTMLEscape(rawName));
        let nameString = (lobbyType === 'invited') ? '#tooltip_friend_invited_you' : "#tooltip_lobby_leader_name";
        elTile.FindChildTraverse('JsFriendLobbyLeaderName').text = nameString;
        elTile.FindChildTraverse('JsFriendLobbyLeaderAvatar').PopulateFromSteamID(xuidLobbyLeader);
        elTile.FindChildTraverse('JsFriendLobbyLeaderBtn').SetPanelEvent('onactivate', () => _OpenContextMenu(xuidLobbyLeader));
    }
    function _SetPrime(elTile) {
        let primeValue = PartyBrowserAPI.GetPartySessionSetting(_m_xuid, 'game/apr');
        elTile.FindChildTraverse('JsFriendLobbyPrime').visible = (primeValue && primeValue != '0') ? true : false;
    }
    function _SetRegion(elTile) {
        let countryCode = PartyBrowserAPI.GetPartySessionSetting(_m_xuid, 'game/loc');
        CommonUtil.SetRegionOnLabel(countryCode, elTile);
    }
    function _SetSkillGroup(elTile, gameMode) {
        let szSkillGroupType = "Competitive";
        if (gameMode === 'scrimcomp2v2') {
            szSkillGroupType = 'Wingman';
        }
        else {
            szSkillGroupType = 'Premier';
        }
        const options = {
            root_panel: elTile.FindChildTraverse('jsRatingEmblem'),
            xuid: _m_xuid,
            do_fx: true,
            full_details: false,
            api: 'partybrowser',
            rating_type: szSkillGroupType
        };
        RatingEmblem.SetXuid(options);
    }
    function _SetLobbySettings(elTile, gameMode) {
        let gameModeType = GameTypesAPI.GetGameModeType(gameMode);
        let gameModeDisplay = GameTypesAPI.GetGameModeAttribute(gameModeType, gameMode, 'nameID');
        elTile.SetDialogVariable('lobby-mode', $.Localize(gameModeDisplay));
        elTile.SetDialogVariable('lobby-maps', _GetMapNames(gameMode));
    }
    function _GetMapNames(gameMode) {
        let mapGroups = PartyBrowserAPI.GetPartySessionSetting(_m_xuid, 'game/mapgroupname');
        if (mapGroups == 'workshop')
            return $.Localize('#SFUI_Groups_workshop');
        if (gameMode === 'cooperative') {
            let questId = PartyBrowserAPI.GetPartySessionSetting(_m_xuid, 'game/questid');
            if (questId && questId != '0')
                return $.Localize(MissionsAPI.GetQuestDefinitionField(parseInt(questId), "loc_name"));
        }
        if (!mapGroups)
            mapGroups = '';
        let mapsList = mapGroups.split(',');
        let mapsNiceNamesList = [];
        for (let i = 0; i < mapsList.length; i++) {
            if (i < 4) {
                let mapNiceName = GameTypesAPI.GetMapGroupAttribute(mapsList[i], 'nameID');
                mapsNiceNamesList.push($.Localize(mapNiceName));
            }
        }
        return mapsNiceNamesList.join(', ');
    }
    function _SetLobbyPlayerSlots(elTile, gameMode, lobbyType) {
        if (lobbyType === 'nearby')
            return;
        let numSlotsToShow = SessionUtil.GetMaxLobbySlotsForGameMode(gameMode) - 1;
        let elAvatarRow = elTile.FindChildTraverse('JsFriendLobbyAvatars');
        for (let i = 1; i <= numSlotsToShow; i++) {
            let xuid = PartyBrowserAPI.GetPartyMemberXuid(_m_xuid, i);
            let slotId = _m_xuid + ':' + i;
            let playerSlot = elAvatarRow.FindChild(slotId);
            if (!playerSlot) {
                playerSlot = $.CreatePanel('Panel', elAvatarRow, slotId);
                playerSlot.BLoadLayoutSnippet('FriendLobbyAvatarSlot');
            }
            if (i === 1)
                playerSlot.AddClass('friendlobby__slot--first');
            let elEmpty = playerSlot.FindChildTraverse('JsFriendAvatarEmpty');
            let elAvatar = playerSlot.FindChildTraverse('JsFriendAvatar');
            if (xuid) {
                elAvatar.PopulateFromSteamID(xuid);
                playerSlot.FindChild('JsFriendAvatarBtn').SetPanelEvent('onactivate', () => _OpenContextMenu(xuid));
                elEmpty.visible = false;
                elAvatar.visible = true;
            }
            else {
                elEmpty.visible = true;
                elAvatar.visible = false;
            }
        }
    }
    function _SetUpJoinBtn(elTile, lobbyType) {
        let elJoinBtn = elTile.FindChildInLayoutFile('JsFriendLobbyJoinBtn');
        let clientInLobby = false;
        let clientXuid = MyPersonaAPI.GetXuid();
        let count = PartyBrowserAPI.GetPartyMembersCount(_m_xuid);
        for (let i = 0; i <= count; i++) {
            if (clientXuid === PartyBrowserAPI.GetPartyMemberXuid(_m_xuid, i)) {
                clientInLobby = true;
                break;
            }
        }
        if (clientInLobby || lobbyType === 'suggested') {
            elJoinBtn.AddClass('hidden');
            return;
        }
        elJoinBtn.RemoveClass('hidden');
        let tooltipText = $.Localize((lobbyType === 'invited') ? '#tooltip_accept_invite' : '#tooltip_join_public_lobby');
        elJoinBtn.SetPanelEvent('onmouseover', () => UiToolkitAPI.ShowTextTooltip('JsFriendLobbyJoinBtn', tooltipText));
        elJoinBtn.SetPanelEvent('onmouseout', () => UiToolkitAPI.HideTextTooltip());
        let lobbyLeaderXuid = _m_xuid;
        elJoinBtn.SetPanelEvent('onactivate', () => {
            $.DispatchEvent('CSGOPlaySoundEffectMuteBypass', 'PanoramaUI.Lobby.Joined', 'MOUSE', 1.0);
            PartyBrowserAPI.ActionJoinParty(lobbyLeaderXuid);
        });
    }
    function _SetGroupNameLink(elTile, lobbyType) {
        let elGroupLBtn = elTile.FindChildTraverse('JsFriendLobbyGroupBtn');
        let elGroupLabel = elTile.FindChildTraverse('JsFriendLobbyGroupTxt');
        if (lobbyType === 'invited') {
            elGroupLabel.visible = false;
            elGroupLBtn.visible = false;
        }
        if (lobbyType === 'nearby') {
            elGroupLabel.text = $.Localize('#SFUI_Lobby_GroupsNearby');
            elGroupLBtn.enabled = false;
        }
        else {
            let clanId = PartyBrowserAPI.GetPartySessionSetting(_m_xuid, "game/clanid");
            let clanName = PartyBrowserAPI.GetPartySessionSetting(_m_xuid, "game/clantag");
            if (lobbyType === 'suggested') {
                elGroupLabel.SetDialogVariable('group', clanName);
                elGroupLabel.text = $.Localize('#FriendsLobby_GroupsSuggested', elGroupLabel);
            }
            else {
                elGroupLabel.SetDialogVariable('group', clanName);
                elGroupLabel.text = $.Localize('#FriendsLobby_GroupName', elGroupLabel);
            }
            let onActivate = _GetClanLink(clanId);
            elGroupLBtn.SetPanelEvent('onactivate', onActivate);
            elGroupLBtn.enabled = true;
        }
    }
    function _SetDismissButton(elTile, lobbyType) {
        if (lobbyType === 'invited') {
            var elCloseButton = elTile.FindChildInLayoutFile('FriendLobbyCloseButton');
            elCloseButton.RemoveClass('hidden');
            elCloseButton.SetPanelEvent("onactivate", function () {
                $.DispatchEvent('CSGOPlaySoundEffectMuteBypass', 'PanoramaUI.Lobby.Left', 'MOUSE', 1.0);
                PartyBrowserAPI.ClearInvite(elTile.GetAttributeString('xuid', '(not found)'));
            });
            elCloseButton.SetPanelEvent('onmouseover', () => {
                UiToolkitAPI.ShowTextTooltip('FriendLobbyCloseButton', $.Localize('#tooltip_discard_invite'));
            });
            elCloseButton.SetPanelEvent('onmouseout', () => {
                UiToolkitAPI.HideTextTooltip();
            });
        }
    }
    function _SetUpLobbiesPopupBtn(elTile) {
        let elAlert = elTile.FindChildInLayoutFile('JsFriendLobbyCount');
        let nLobbies = PartyBrowserAPI.GetInvitesCount();
        if (nLobbies < 2) {
            elTile.FindChildInLayoutFile('JsFriendLobbySeeAllInvites').visible = false;
            return;
        }
        if (elAlert && elAlert.IsValid()) {
            elAlert.SetDialogVariable("lobby_count", (nLobbies - 1).toString());
            elAlert.SetDialogVariable("alert_value", $.Localize('#friends_lobby_count', elAlert));
        }
        let elBtn = elTile.FindChildInLayoutFile('JsFriendLobbySeeAllInvitesBtn');
        elBtn.SetPanelEvent('onmouseover', () => {
            UiToolkitAPI.ShowTextTooltip('JsFriendLobbySeeAllInvitesBtn', $.Localize('#tooltip_lobby_count'));
        });
        elBtn.SetPanelEvent('onmouseout', () => {
            UiToolkitAPI.HideTextTooltip();
        });
        elBtn.SetPanelEvent('onactivate', OpenLobbiesContextMenu);
    }
    function OpenLobbiesContextMenu() {
        var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenu('', '', 'file://{resources}/layout/context_menus/context_menu_lobbies.xml');
        contextMenuPanel.AddClass("ContextMenu_NoArrow");
    }
    function _GetClanLink(clanId) {
        return () => {
            let link = '';
            if (SteamOverlayAPI.GetAppID() == 710)
                link = "http://beta.steamcommunity.com/gid/" + clanId;
            else
                link = "http://steamcommunity.com/gid/" + clanId;
            SteamOverlayAPI.OpenURL(link);
        };
    }
    function _OpenContextMenu(xuid) {
        $.DispatchEvent('SidebarContextMenuActive', true);
        var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent('', '', 'file://{resources}/layout/context_menus/context_menu_playercard.xml', 'xuid=' + xuid, () => $.DispatchEvent('SidebarContextMenuActive', false));
        contextMenuPanel.AddClass("ContextMenu_NoArrow");
    }
})(friendLobby || (friendLobby = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJpZW5kbG9iYnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9jb250ZW50L2NzZ28vcGFub3JhbWEvc2NyaXB0cy9mcmllbmRsb2JieS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsa0NBQWtDO0FBQ2xDLHlDQUF5QztBQUN6Qyw2Q0FBNkM7QUFFN0MsSUFBVSxXQUFXLENBMFZwQjtBQTFWRCxXQUFVLFdBQVc7SUFFcEIsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLElBQUksWUFBWSxHQUFXLEtBQUssQ0FBQztJQUVqQyxTQUFnQixJQUFJLENBQUUsTUFBYztRQUVuQyxNQUFNLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxlQUFlLEVBQUUsS0FBSyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRTNGLE9BQU8sR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBRSxDQUFDO1FBRTdELElBQUksT0FBTyxLQUFJLGFBQWEsRUFDNUI7WUFDQyxPQUFPO1NBQ1A7UUFFRCxZQUFZLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFFLGFBQWEsRUFBRSxPQUFPLENBQUUsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzdGLElBQUksU0FBUyxHQUFVLGVBQWUsQ0FBQyxZQUFZLENBQUUsT0FBTyxDQUFFLENBQUM7UUFDL0QsSUFBSSxRQUFRLEdBQVUsZUFBZSxDQUFDLHNCQUFzQixDQUFFLE9BQU8sRUFBQyxXQUFXLENBQUUsQ0FBQztRQUdwRixNQUFNLENBQUMsV0FBVyxDQUFFLGVBQWUsRUFBRSxDQUFFLFNBQVMsS0FBSyxRQUFRLENBQUUsQ0FBRSxDQUFDO1FBRWxFLHlCQUF5QixDQUFFLE1BQU0sRUFBRSxTQUFTLENBQUUsQ0FBQztRQUMvQyxpQkFBaUIsQ0FBRSxNQUFNLEVBQUUs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