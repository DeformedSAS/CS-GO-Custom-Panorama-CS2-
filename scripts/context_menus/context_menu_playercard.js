"use strict";
/// <reference path="../csgo.d.ts" />
var ContextmenuPlayerCard;
(function (ContextmenuPlayerCard) {
    function Init() {
        _LoadPlayerCard();
        _GetContextMenuEntries();
    }
    ContextmenuPlayerCard.Init = Init;
    function _LoadPlayerCard() {
        let xuid = $.GetContextPanel().GetAttributeString("xuid", "(not found)");
        let oldPanel = $.GetContextPanel().FindChildInLayoutFile('JsContextMenuPlayercard');
        if (oldPanel)
            oldPanel.DeleteAsync(.0);
        let newPanel = $.CreatePanel('Panel', $.GetContextPanel().FindChildInLayoutFile('JsContextMenuSections'), 'JsContextMenuPlayercard');
        newPanel.SetAttributeString("xuid", xuid);
        newPanel.BLoadLayout('file://{resources}/layout/playercard.xml', false, false);
    }
    ContextmenuPlayerCard.ContextMenus = [
        {
            name: 'invite',
            icon: 'invite',
            AvailableForItem: (id) => {
                return !GameStateAPI.IsLocalPlayerPlayingMatch() && !(LobbyAPI.IsPartyMember(id)) && !_IsSelf(id) &&
                    ('purchased' === MyPersonaAPI.GetLicenseType());
            },
            OnSelected: (id, type) => {
                if (type)
                    StoreAPI.RecordUIEvent("ActionInviteFriendFrom_" + type);
                else
                    StoreAPI.RecordUIEvent("ActionInviteFriendGeneric");
                FriendsListAPI.ActionInviteFriend(id, '');
                $.DispatchEvent('ContextMenuEvent', '');
                $.DispatchEvent('FriendInvitedFromContextMenu', id);
            },
            IsDisabled: () => {
                let gss = LobbyAPI.GetSessionSettings();
                if (!gss || !gss.hasOwnProperty('game')) {
                    return false;
                }
                return gss.game.apr > 1 ? true : false;
            },
        },
        {
            name: 'join',
            icon: 'JoinPlayer',
            AvailableForItem: (id) => {
                if (FriendsListAPI.IsFriendJoinable(id)) {
                    if (GameStateAPI.IsPlayerConnected(id))
                        return false;
                    if (LobbyAPI.IsSessionActive()) {
                        let party = LobbyAPI.GetSessionSettings().members;
                        for (let i = 0; i < party.numPlayers; i++) {
                            if (id === party['machine' + i].player0.xuid)
                                return false;
                        }
                    }
                    return ('purchased' === MyPersonaAPI.GetLicenseType());
                }
                return false;
            },
            OnSelected: (id) => {
                FriendsListAPI.ActionJoinFriendSession(id);
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'watch',
            icon: 'watch_tv',
            AvailableForItem: (id) => {
                return !GameStateAPI.IsLocalPlayerPlayingMatch() &&
                    FriendsListAPI.IsFriendWatchable(id) &&
                    !GameStateAPI.IsPlayerConnected(id);
            },
            OnSelected: (id) => {
                FriendsListAPI.ActionWatchFriendSession(id);
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'steamprofile',
            icon: 'profile',
            AvailableForItem: (id) => MyPersonaAPI.GetLauncherType() !== "perfectworld",
            OnSelected: (id) => {
                SteamOverlayAPI.ShowUserProfilePage(id);
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'kick_from_lobby',
            icon: 'friendignore',
            AvailableForItem: (id) => {
                if (GameStateAPI.IsLocalPlayerPlayingMatch())
                    return false;
                if (LobbyAPI.IsSessionActive() && LobbyAPI.BIsHost()) {
                    let party = LobbyAPI.GetSessionSettings().members;
                    for (let i = 0; i < party.numPlayers; i++) {
                        if (id === party['machine' + i].player0.xuid && !_IsSelf(id))
                            return true;
                    }
                }
                return false;
            },
            OnSelected: (id) => {
                LobbyAPI.KickPlayer(id);
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'leave_lobby',
            icon: 'leave',
            AvailableForItem: (id) => {
                if (!GameStateAPI.IsLocalPlayerPlayingMatch() && _IsSelf(id) && LobbyAPI.IsSessionActive()) {
                    let party = LobbyAPI.GetSessionSettings().members;
                    return party.numPlayers > 1 ? true : false;
                }
                return false;
            },
            OnSelected: (id) => {
                LobbyAPI.CloseSession();
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'message',
            icon: 'message',
            AvailableForItem: (id) => {
                return !_IsSelf(id);
            },
            OnSelected: (id) => {
                SteamOverlayAPI.StartChatWithUser(id);
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'trade',
            icon: 'trade',
            AvailableForItem: (id) => FriendsListAPI.GetFriendRelationship(id) === "friend",
            OnSelected: (id) => {
                SteamOverlayAPI.StartTradeWithUser(id);
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'friendaccept',
            icon: 'friendaccept',
            AvailableForItem: (id) => FriendsListAPI.GetFriendStatusBucket(id) === 'AwaitingLocalAccept',
            OnSelected: (id) => {
                SteamOverlayAPI.InteractWithUser(id, 'friendrequestaccept');
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'friendignore',
            icon: 'friendignore',
            AvailableForItem: (id) => FriendsListAPI.GetFriendStatusBucket(id) === 'AwaitingLocalAccept',
            OnSelected: (id) => {
                SteamOverlayAPI.InteractWithUser(id, 'friendrequestignore');
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'cancelinvite',
            icon: 'friendignore',
            AvailableForItem: (id) => FriendsListAPI.GetFriendStatusBucket(id) === 'AwaitingRemoteAccept',
            OnSelected: (id) => {
                SteamOverlayAPI.InteractWithUser(id, 'friendremove');
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'removefriend',
            icon: 'friendremove',
            AvailableForItem: (id) => {
                if (MyPersonaAPI.GetLauncherType() === "perfectworld") {
                    if (_IsSelf(id))
                        return false;
                    let status = FriendsListAPI.GetFriendStatusBucket(id);
                    return status !== 'AwaitingRemoteAccept' && status !== 'AwaitingLocalAccept';
                }
                return false;
            },
            OnSelected: (id) => {
                SteamOverlayAPI.InteractWithUser(id, 'friendremove');
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'request',
            icon: 'addplayer',
            AvailableForItem: (id) => {
                let status = FriendsListAPI.GetFriendStatusBucket(id);
                let isRequest = status === 'AwaitingRemoteAccept' || status === 'AwaitingLocalAccept';
                return FriendsListAPI.GetFriendRelationship(id) !== "friend" && !_IsSelf(id) && !isRequest;
            },
            OnSelected: (id) => {
                SteamOverlayAPI.InteractWithUser(id, 'friendadd');
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'editprofile',
            icon: 'edit',
            AvailableForItem: (id) => _IsSelf(id),
            OnSelected: (id) => {
                let communityUrl = SteamOverlayAPI.GetSteamCommunityURL();
                SteamOverlayAPI.OpenURL(communityUrl + "/profiles/" + id + "/minimaledit");
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'changecolor',
            icon: 'colorwheel',
            AvailableForItem: (id) => {
                return !GameStateAPI.IsLocalPlayerPlayingMatch() &&
                    LobbyAPI.IsSessionActive() &&
                    _IsSelf(id);
            },
            OnSelected: (id) => {
                LobbyAPI.ChangeTeammateColor();
            },
        },
        {
            name: 'mute',
            xml: 'file://{resources}/layout/mute_spinner.xml',
            icon: null,
            AvailableForItem: (id) => {
                return GameStateAPI.IsLocalPlayerPlayingMatch() &&
                    !_IsSelf(id) &&
                    GameStateAPI.IsPlayerConnected(id);
            },
            OnSelected: null,
        },
        {
            name: 'report',
            icon: 'alert',
            AvailableForItem: (id) => {
                return (GameStateAPI.IsLocalPlayerPlayingMatch() ||
                    (GameStateAPI.IsLocalPlayerWatchingOwnDemo() && MatchInfoAPI.CanReportFromCurrentlyPlayingDemo()) ||
                    GameStateAPI.GetGameModeInternalName(false) === "survival") &&
                    !_IsSelf(id) &&
                    GameStateAPI.IsPlayerConnected(id);
            },
            OnSelected: (id) => {
                UiToolkitAPI.ShowCustomLayoutPopupParameters('', 'file://{resources}/layout/popups/popup_report_player.xml', 'xuid=' + id);
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'commend',
            icon: 'smile',
            AvailableForItem: (id) => {
                return (GameStateAPI.IsLocalPlayerPlayingMatch() || GameStateAPI.GetGameModeInternalName(false) === "survival") &&
                    !_IsSelf(id) &&
                    GameStateAPI.IsPlayerConnected(id);
            },
            OnSelected: (id) => {
                UiToolkitAPI.ShowCustomLayoutPopupParameters('', 'file://{resources}/layout/popups/popup_commend_player.xml', 'xuid=' + id);
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'borrowmusickit',
            icon: 'music_kit',
            AvailableForItem: (id) => {
                let borrowedPlayerSlot = parseInt(GameInterfaceAPI.GetSettingString("cl_borrow_music_from_player_slot"));
                return GameStateAPI.IsLocalPlayerPlayingMatch() &&
                    !_IsSelf(id) &&
                    borrowedPlayerSlot !== GameStateAPI.GetPlayerSlot(id) &&
                    _HasMusicKit(id) &&
                    GameStateAPI.IsPlayerConnected(id);
            },
            OnSelected: (id) => {
                GameInterfaceAPI.SetSettingString("cl_borrow_music_from_player_slot", "" + GameStateAPI.GetPlayerSlot(id));
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'stopborrowmusickit',
            icon: 'no_musickit',
            AvailableForItem: (id) => {
                let borrowedPlayerSlot = parseInt(GameInterfaceAPI.GetSettingString("cl_borrow_music_from_player_slot"));
                if (borrowedPlayerSlot === -1)
                    return false;
                return GameStateAPI.IsLocalPlayerPlayingMatch() &&
                    ((_IsSelf(id) && borrowedPlayerSlot !== -1) ||
                        (borrowedPlayerSlot === GameStateAPI.GetPlayerSlot(id))) &&
                    GameStateAPI.IsPlayerConnected(id);
            },
            OnSelected: (id) => {
                $.DispatchEvent('Scoreboard_UnborrowMusicKit');
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
        {
            name: 'copycrosshair',
            icon: 'crosshair',
            AvailableForItem: (id) => {
                return GameStateAPI.IsLocalPlayerPlayingMatch() &&
                    !_IsSelf(id) &&
                    GameStateAPI.IsPlayerConnected(id);
            },
            OnSelected: (xuid) => {
                $.DispatchEvent('Scoreboard_ApplyPlayerCrosshairCode', xuid);
                $.DispatchEvent('ContextMenuEvent', '');
            },
        },
    ];
    function _HasMusicKit(id) {
        return (InventoryAPI.GetMusicIDForPlayer(id) > 1);
    }
    function _IsSelf(id) {
        return id === MyPersonaAPI.GetXuid();
    }
    function _GetContextMenuEntries() {
        $.CreatePanel('Panel', $.GetContextPanel(), '', { class: 'context-menu-playercard-seperator' });
        let elContextMenuBtnsParent = $.CreatePanel('Panel', $.GetContextPanel(), '', { class: 'context-menu-playercard-btns' });
        let xuid = $.GetContextPanel().GetAttributeString("xuid", "(not found)");
        let type = $.GetContextPanel().GetAttributeString("type", "");
        let count = 0;
        let rowCount = 0;
        let elContextMenuBtns;
        for (let entry of ContextmenuPlayerCard.ContextMenus) {
            if (entry.AvailableForItem(xuid)) {
                count = count === 5 ? 0 : count;
                if (count === 0) {
                    elContextMenuBtns = $.GetContextPanel().FindChildInLayoutFile('id_playercard-button-row' + rowCount);
                    if (!elContextMenuBtns) {
                        elContextMenuBtns = $.CreatePanel('Panel', elContextMenuBtnsParent, 'id_playercard-button-row' + rowCount, { class: 'context-menu-playercard-btns__container' });
                        elContextMenuBtns.xuid = xuid;
                        rowCount++;
                    }
                }
                if ('xml' in entry) {
                    let elEntryBtn = $.CreatePanel('Panel', elContextMenuBtns, entry.name, {
                        class: 'IconButton',
                        style: 'tooltip-position: bottom;'
                    });
                    elEntryBtn.BLoadLayout(entry.xml, false, false);
                }
                else {
                    let elEntryBtn = $.CreatePanel('Button', elContextMenuBtns, entry.name, {
                        class: 'IconButton',
                        style: 'tooltip-position: bottom;'
                    });
                    $.CreatePanel('Image', elEntryBtn, entry.name, { src: 'file://{images}/icons/ui/' + entry.icon + '.svg' });
                    let label = $.CreatePanel('Label', elEntryBtn, entry.name + '-label');
                    label.text = $.Localize('#tooltip_short_' + entry.name);
                    let tooltip = '#tooltip_' + entry.name;
                    if ('IsDisabled' in entry) {
                        if (entry.IsDisabled()) {
                            elEntryBtn.enabled = false;
                            tooltip = '#tooltip_disabled_' + entry.name;
                        }
                        else {
                            elEntryBtn.enabled = true;
                        }
                    }
                    let onSelected = entry.OnSelected;
                    elEntryBtn.SetPanelEvent('onactivate', () => onSelected(xuid, type));
                    elEntryBtn.SetPanelEvent('onmouseover', () => UiToolkitAPI.ShowTextTooltip(elEntryBtn.id, tooltip));
                    elEntryBtn.SetPanelEvent('onmouseout', () => UiToolkitAPI.HideTextTooltip());
                }
                count++;
            }
        }
    }
})(ContextmenuPlayerCard || (ContextmenuPlayerCard = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dF9tZW51X3BsYXllcmNhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9jb250ZW50L2NzZ28vcGFub3JhbWEvc2NyaXB0cy9jb250ZXh0X21lbnVzL2NvbnRleHRfbWVudV9wbGF5ZXJjYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQ0FBcUM7QUFFckMsSUFBVSxxQkFBcUIsQ0E2ZTlCO0FBN2VELFdBQVUscUJBQXFCO0lBRTlCLFNBQWdCLElBQUk7UUFFbkIsZUFBZSxFQUFFLENBQUM7UUFDbEIsc0JBQXNCLEVBQUUsQ0FBQztJQUcxQixDQUFDO0lBTmUsMEJBQUksT0FNbkIsQ0FBQTtJQUVELFNBQVMsZUFBZTtRQUV2QixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsa0JBQWtCLENBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBRSxDQUFDO1FBRTNFLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBRSx5QkFBeUIsQ0FBRSxDQUFDO1FBQ3RGLElBQUssUUFBUTtZQUNiLFFBQVEsQ0FBQyxXQUFXLENBQUUsRUFBRSxDQUFFLENBQUM7UUFFM0IsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLHFCQUFxQixDQUFDLHVCQUF1QixDQUFDLEVBQUUseUJBQXlCLENBQUUsQ0FBQztRQUN0SSxRQUFRLENBQUMsa0JBQWtCLENBQUUsTUFBTSxFQUFFLElBQUksQ0FBRSxDQUFDO1FBQzVDLFFBQVEsQ0FBQyxXQUFXLENBQUMsMENBQTBDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFXVSxrQ0FBWSxHQUFrQjtRQWV4QztZQUNDLElBQUksRUFBRSxRQUFRO1lBQ2QsSUFBSSxFQUFFLFFBQVE7WUFDZCxnQkFBZ0IsRUFBRSxDQUFF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