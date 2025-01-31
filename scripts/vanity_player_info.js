/// <reference path="csgo.d.ts" />
/// <reference path="avatar.ts" />
/// <reference path="common/sessionutil.ts" />
/// <reference path="mock_adapter.ts" />
var VanityPlayerInfo = (function () {
    const _CreateUpdateVanityInfoPanel = function (elParent, oSettings, XML = 'file://{resources}/layout/vanity_player_info.xml') {
        const idPrefix = "id-player-vanity-info-" + oSettings.playeridx;
        let newPanel = elParent.FindChildInLayoutFile(idPrefix);
        if (!newPanel) {
            newPanel = $.CreatePanel('Button', elParent, idPrefix);
            newPanel.BLoadLayout(XML, false, false);
            newPanel.AddClass('vanity-info-loc-' + oSettings.playeridx);
            newPanel.AddClass('show');
        }
        _SetName(newPanel, oSettings.xuid);
        _SetAvatar(newPanel, oSettings.xuid);
        _SetRank(newPanel, oSettings.xuid, oSettings.isLocalPlayer);
        _SetSkillGroup(newPanel, oSettings.xuid, oSettings.isLocalPlayer);
        _SetPrime(newPanel, oSettings.xuid, oSettings.isLocalPlayer);
        _AddOpenPlayerCardAction(newPanel.FindChildInLayoutFile('vanity-info-container'), oSettings.xuid);
        _SetLobbyLeader(newPanel, oSettings.xuid);
        return newPanel;
    };
    const _DeleteVanityInfoPanel = function (elParent, index) {
        const idPrefix = "id-player-vanity-info-" + index;
        const elPanel = elParent.FindChildInLayoutFile(idPrefix);
        if (elPanel && elPanel.IsValid()) {
            elPanel.DeleteAsync(0);
        }
    };
    const _RoundToPixel = function (context, value, axis) {
        const scale = axis === "x" ? context.actualuiscale_x : context.actualuiscale_y;
        return Math.round(value * scale) / scale;
    };
    const _SetVanityInfoPanelPos = function (elParent, index, oPos, OnlyXOrY) {
        const idPrefix = "id-player-vanity-info-" + index;
        const elPanel = elParent.FindChildInLayoutFile(idPrefix);
        if (elPanel && elPanel.IsValid()) {
            switch (OnlyXOrY) {
                case 'x':
                    elPanel.style.transform = 'translateX( ' + oPos.x + 'px );';
                    break;
                case 'y':
                    elPanel.style.transform = 'translateY( ' + oPos.x + 'px );';
                    break;
                default:
                    elPanel.style.transform = 'translate3d( ' + _RoundToPixel(elParent, oPos.x, "x") + 'px, ' + _RoundToPixel(elParent, oPos.y, "y") + 'px, 0px );';
                    break;
            }
        }
    };
    const _SetName = function (newPanel, xuid) {
        const name = MockAdapter.IsFakePlayer(xuid)
            ? MockAdapter.GetPlayerName(xuid)
            : FriendsListAPI.GetFriendName(xuid);
        newPanel.SetDialogVariable('player_name', name);
    };
    const _SetAvatar = function (newPanel, xuid) {
        const elParent = newPanel.FindChildInLayoutFile('vanity-avatar-container');
        let elAvatar = elParent.FindChildInLayoutFile('JsPlayerVanityAvatar-' + xuid);
        if (!elAvatar) {
            elAvatar = $.CreatePanel("Panel", elParent, 'JsPlayerVanityAvatar-' + xuid);
            elAvatar.SetAttributeString('xuid', xuid);
            elAvatar.BLoadLayout('file://{resources}/layout/avatar.xml', false, false);
            elAvatar.BLoadLayoutSnippet("AvatarPlayerCard");
            elAvatar.AddClass('avatar--vanity');
        }
        Avatar.Init(elAvatar, xuid, 'playercard');
        if (MockAdapter.IsFakePlayer(xuid)) {
            const elAvatarImage = elAvatar.FindChildInLayoutFile("JsAvatarImage");
            elAvatarImage.PopulateFromPlayerSlot(MockAdapter.GetPlayerSlot(xuid));
        }
    };
    const _SetRank = function (newPanel, xuid, isLocalPlayer) {
        const elRankText = newPanel.FindChildInLayoutFile('vanity-rank-name');
        const elRankIcon = newPanel.FindChildInLayoutFile('vanity-xp-icon');
        const elXpBarInner = newPanel.FindChildInLayoutFile('vanity-xp-bar-inner');
        if (!isLocalPlayer || !MyPersonaAPI.IsInventoryValid()) {
            newPanel.FindChildInLayoutFile('vanity-xp-container').visible = false;
            return;
        }
        newPanel.FindChildInLayoutFile('vanity-xp-container').visible = true;
        const currentLvl = FriendsListAPI.GetFriendLevel(xuid);
        if (!MyPersonaAPI.IsInventoryValid() ||
            !currentLvl ||
            (!_HasXpProgressToFreeze() && !_IsPlayerPrime(xuid))) {
            newPanel.AddClass('no-valid-xp');
            return;
        }
        const bHasRankToFreezeButNoPrestige = (!_IsPlayerPrime(xuid) && _HasXpProgressToFreeze()) ? true : false;
        const currentPoints = FriendsListAPI.GetFriendXp(xuid), pointsPerLevel = MyPersonaAPI.GetXpPerLevel();
        if (bHasRankToFreezeButNoPrestige) {
            elXpBarInner.GetParent().visible = false;
        }
        else {
            const percentComplete = (currentPoints / pointsPerLevel) * 100;
            elXpBarInner.style.width = percentComplete + '%';
            elXpBarInner.GetParent().visible = true;
        }
        elRankText.SetHasClass('player-card-prime-text', bHasRankToFreezeButNoPrestige);
        if (bHasRankToFreezeButNoPrestige) {
            elRankText.text = $.Localize('#Xp_RankName_Locked');
        }
        else {
            elRankText.SetDialogVariable('name', $.Localize('#SFUI_XP_RankName_' + currentLvl));
            elRankText.SetDialogVariableInt('level', currentLvl);
        }
        elRankIcon.SetImage('file://{images}/icons/xp/level' + currentLvl + '.png');
        newPanel.RemoveClass('no-valid-xp');
    };
    const _SetRankFromParty = function (newPanel, elRankText, elRankIcon, elXpBarInner, xuid) {
        const rankLvl = PartyListAPI.GetFriendLevel(xuid);
        const xpPoints = PartyListAPI.GetFriendXp(xuid);
        const pointsPerLevel = MyPersonaAPI.GetXpPerLevel();
        if (!rankLvl) {
            newPanel.AddClass('no-valid-xp');
            return;
        }
        const percentComplete = (xpPoints / pointsPerLevel) * 100;
        elXpBarInner.style.width = percentComplete + '%';
        elXpBarInner.GetParent().visible = true;
        elRankIcon.SetImage('file://{images}/icons/xp/level' + rankLvl + '.png');
        elRankText.SetDialogVariable('name', $.Localize('#SFUI_XP_RankName_' + rankLvl));
        elRankText.SetDialogVariableInt('level', rankLvl);
        newPanel.RemoveClass('no-valid-xp');
    };
    const _SetSkillGroup = function (newPanel, xuid, isLocalPlayer) {
        const elImage = newPanel.FindChildInLayoutFile('vanity-skillgroup-icon');
        const elLabel = newPanel.FindChildInLayoutFile('vanity-skillgroup-label');
        if (!isLocalPlayer) {
            _SetSkillGroupFromParty(newPanel, elImage, elLabel, xuid);
            return;
        }
        if (!_IsPlayerPrime(xuid) && _HasXpProgressToFreeze()) {
            return;
        }
        const type = "Competitive";
        const skillGroup = FriendsListAPI.GetFriendCompetitiveRank(xuid, type);
        const isloading = (skillGroup === -1) ? true : false;
        if (isloading) {
            return;
        }
        const winsNeededForRank = SessionUtil.GetNumWinsNeededForRank(type);
        const wins = FriendsListAPI.GetFriendCompetitiveWins(xuid, type);
        if (wins < winsNeededForRank) {
            const winsneeded = (winsNeededForRank - wins);
            elImage.SetImage('file://{images}/icons/skillgroups/skillgroup_none.svg');
            elLabel.text = $.Localize('#skillgroup_0');
            elLabel.SetDialogVariableInt("winsneeded", winsneeded);
        }
        else if (wins >= winsNeededForRank && skillGroup < 1) {
            if (!isLocalPlayer)
                return;
            elImage.SetImage('file://{images}/icons/skillgroups/skillgroup_expired.svg');
            elLabel.text = $.Localize('#skillgroup_expired');
        }
        else {
            elImage.SetImage('file://{images}/icons/skillgroups/skillgroup' + skillGroup + '.svg');
            elLabel.text = $.Localize('#skillgroup_' + skillGroup);
        }
    };
    const _SetSkillGroupFromParty = function (newPanel, elImage, elLabel, xuid) {
        const skillgroupType = PartyListAPI.GetFriendCompetitiveRankType(xuid);
        const skillGroup = PartyListAPI.GetFriendCompetitiveRank(xuid);
        const wins = PartyListAPI.GetFriendCompetitiveWins(xuid);
        const winsNeededForRank = SessionUtil.GetNumWinsNeededForRank(skillgroupType);
        if (wins < winsNeededForRank || (wins >= winsNeededForRank && skillGroup < 1) || !PartyListAPI.GetFriendPrimeEligible(xuid)) {
            newPanel.AddClass('no-valid-rank');
            return;
        }
        const imageName = (skillgroupType !== 'Competitive') ? skillgroupType : 'skillgroup';
        elImage.SetImage('file://{images}/icons/skillgroups/' + imageName + skillGroup + '.svg');
        elLabel.text = $.Localize('#skillgroup_' + skillGroup);
        newPanel.RemoveClass('no-valid-rank');
    };
    const _SetPrime = function (elPanel, xuid, isLocalPlayer) {
        const elPrime = elPanel.FindChildInLayoutFile('vanity-prime-icon');
        elPrime.visible = isLocalPlayer ? _IsPlayerPrime(xuid) : PartyListAPI.GetFriendPrimeEligible(xuid);
    };
    const _UpdateVoiceIcon = function (elAvatar, xuid) {
        Avatar.UpdateTalkingState(elAvatar, xuid);
    };
    const _HasXpProgressToFreeze = function () {
        return MyPersonaAPI.HasPrestige() || (MyPersonaAPI.GetCurrentLevel() > 2);
    };
    const _IsPlayerPrime = function (xuid) {
        return FriendsListAPI.GetFriendPrimeEligible(xuid);
    };
    const _SetLobbyLeader = function (elPanel, xuid) {
        elPanel.SetHasClass('is-not-leader', LobbyAPI.GetHostSteamID() !== xuid);
    };
    const _AddOpenPlayerCardAction = function (elPanel, xuid) {
        const openCard = function (xuid) {
            $.DispatchEvent('SidebarContextMenuActive', true);
            if (xuid !== "0") {
                const contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent('', '', 'file://{resources}/layout/context_menus/context_menu_playercard.xml', 'xuid=' + xuid, function () {
                    $.DispatchEvent('SidebarContextMenuActive', false);
                });
                contextMenuPanel.AddClass("ContextMenu_NoArrow");
            }
        };
        elPanel.SetPanelEvent("onactivate", openCard.bind(undefined, xuid));
    };
    return {
        CreateUpdateVanityInfoPanel: _CreateUpdateVanityInfoPanel,
        DeleteVanityInfoPanel: _DeleteVanityInfoPanel,
        SetVanityInfoPanelPos: _SetVanityInfoPanelPos,
        UpdateVoiceIcon: _UpdateVoiceIcon
    };
})();
(function () {
    if ($.DbgIsReloadingScript()) {
    }
})();