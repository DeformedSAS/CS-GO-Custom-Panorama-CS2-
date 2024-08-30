"use strict";
/// <reference path="csgo.d.ts" />
/// <reference path="rating_emblem.ts" />
/// <reference path="common/teamcolor.ts" />
/// <reference path="honor_icon.ts" />
const regionToRegionName = {
    'namc': 'NorthAmerica',
    'samc': 'SouthAmerica',
    'euro': 'Europe',
    'asia': 'Asia',
    'ausc': 'Australia',
    'afrc': 'Africa',
    'cn': 'China',
};
var Leaderboard;
(function (Leaderboard) {
    function _msg(msg) {
    }
    let m_bEventsRegistered = false;
    let m_myXuid = MyPersonaAPI.GetXuid();
    let m_lbType;
    let m_LeaderboardsDirtyEventHandler;
    let m_LeaderboardsStateChangeEventHandler;
    let m_FriendsListNameChangedEventHandler;
    let m_LobbyPlayerUpdatedEventHandler;
    let m_NameLockEventHandler;
    let m_leaderboardName = '';
    function RegisterEventHandlers() {
        _msg('RegisterEventHandlers');
        if (!m_bEventsRegistered) {
            m_LeaderboardsDirtyEventHandler = $.RegisterForUnhandledEvent('PanoramaComponent_Leaderboards_Dirty', OnLeaderboardDirty);
            m_LeaderboardsStateChangeEventHandler = $.RegisterForUnhandledEvent('PanoramaComponent_Leaderboards_StateChange', OnLeaderboardStateChange);
            m_FriendsListNameChangedEventHandler = $.RegisterForUnhandledEvent('PanoramaComponent_FriendsList_NameChanged', _UpdateName);
            if (m_lbType === 'party') {
                m_LobbyPlayerUpdatedEventHandler = $.RegisterForUnhandledEvent("PanoramaComponent_PartyList_RebuildPartyList", _UpdatePartyList);
            }
            if (m_lbType === 'general') {
                m_NameLockEventHandler = $.RegisterForUnhandledEvent('PanoramaComponent_MyPersona_SetPlayerLeaderboardSafeName', _UpdateNameLockButton);
            }
            m_bEventsRegistered = true;
        }
    }
    Leaderboard.RegisterEventHandlers = RegisterEventHandlers;
    function UnregisterEventHandlers() {
        _msg('UnregisterEventHandlers');
        if (m_bEventsRegistered) {
            $.UnregisterForUnhandledEvent('PanoramaComponent_Leaderboards_Dirty', m_LeaderboardsDirtyEventHandler);
            $.UnregisterForUnhandledEvent('PanoramaComponent_Leaderboards_StateChange', m_LeaderboardsStateChangeEventHandler);
            $.UnregisterForUnhandledEvent('PanoramaComponent_FriendsList_NameChanged', m_FriendsListNameChangedEventHandler);
            if (m_lbType === 'party') {
                $.UnregisterForUnhandledEvent('PanoramaComponent_PartyList_RebuildPartyList', m_LobbyPlayerUpdatedEventHandler);
            }
            if (m_lbType === 'general') {
                $.UnregisterForUnhandledEvent('PanoramaComponent_MyPersona_SetPlayerLeaderboardSafeName', m_NameLockEventHandler);
            }
            m_bEventsRegistered = false;
        }
    }
    Leaderboard.UnregisterEventHandlers = UnregisterEventHandlers;
    function _Init() {
        _msg('init');
        m_lbType = $.GetContextPanel().GetAttributeString('lbtype', '');
        RegisterEventHandlers();
        _SetTitle();
        _InitNavPanels();
        _UpdateLeaderboardName();
        if (m_lbType === 'party') {
            _UpdatePartyList();
            if (LeaderboardsAPI.DoesTheLocalPlayerNeedALeaderboardSafeNameSet()) {
                _AutomaticLeaderboardNameLockPopup();
            }
        }
        else if (m_lbType === 'general') {
            UpdateLeaderboardList();
            $.Schedule(0.5, _UpdateNameLockButton);
        }
        _ShowGlobalRank();
    }
    function _SetHonorIcon(elPanel, xuid) {
        const honorIconOptions = {
            honor_icon_frame_panel: elPanel.FindChildTraverse('jsHonorIcon'),
            xuid: xuid,
            do_fx: true,
            xptrail_value: PartyListAPI.GetFriendXpTrailLevel(xuid),
            prime_value: PartyListAPI.GetFriendPrimeEligible(xuid)
        };
        HonorIcon.SetOptions(honorIconOptions);
    }
    function _SetTitle() {
        $.GetContextPanel().SetDialogVariable('leaderboard-title', $.Localize('#leaderboard_title_' + String(m_lbType)));
    }
    function _InitSeasonDropdown() {
        let elSeasonDropdown = $('#jsNavSeason');
        elSeasonDropdown.visible = true;
        elSeasonDropdown.RemoveAllOptions();
        let lbs = LeaderboardsAPI.GetAllSeasonPremierLeaderboards();
        for (let i = 0; i < lbs.length; i++) {
            let szLb = lbs[i];
            const elEntry = $.CreatePanel('Label', elSeasonDropdown, szLb, {
                'class': ''
            });
            elEntry.SetAttributeString('leaderboard', szLb);
            elEntry.SetAcceptsFocus(true);
            elEntry.text = $.Localize('#' + szLb + '_name');
            elSeasonDropdown.AddOption(elEntry);
        }
        elSeasonDropdown.SetSelected(LeaderboardsAPI.GetCurrentSeasonPremierLeaderboard());
    }
    function _InitLocationDropdown() {
        let elLocationDropdown = $('#jsNavLocation');
        elLocationDropdown.visible = true;
        elLocationDropdown.RemoveAllOptions();
        let regions = LeaderboardsAPI.GetAllSeasonPremierLeaderboardRegions();
        regions.sort();
        regions.unshift('World');
        regions.unshift('Friends');
        let defaultRegion = 'World';
        for (let i = 0; i < regions.length; i++) {
            const szRegion = regions[i];
            const elEntry = $.CreatePanel('Label', elLocationDropdown, szRegion);
            const bCurrentRegion = _FindLocalPlayerInRegion(szRegion);
            elEntry.SetHasClass('of-interest', bCurrentRegion);
            switch (szRegion) {
                case 'World':
                    elEntry.SetAttributeString('leaderboard-class', szRegion.toLowerCase());
                    break;
                case 'Friends':
                    elEntry.SetAttributeString('friendslb', 'true');
                    elEntry.SetAttributeString('leaderboard-class', 'friends');
                    break;
                default:
                    elEntry.SetAttributeString('location-suffix', '_' + szRegion);
                    elEntry.SetAttributeString('leaderboard-class', szRegion.toLowerCase());
                    if (bCurrentRegion) {
                        defaultRegion = szRegion;
                    }
            }
            elEntry.SetAcceptsFocus(true);
            elEntry.text = $.Localize('#leaderboard_region_' + szRegion);
            elLocationDropdown.AddOption(elEntry);
        }
        if (MyPersonaAPI.GetLauncherType() === "perfectworld") {
            defaultRegion = 'friends';
        }
        elLocationDropdown.SetSelected(defaultRegion);
    }
    function _getRegionFromLeaderboardName(lbname) {
        return lbname.split('_').slice(-1)[0];
    }
    function _isLeaderboardTheFriendsLeaderboard(lbname) {
        return lbname.split('.').slice(-1)[0] === 'friends';
    }
    function _FindLocalPlayerInRegion(region) {
        let arrLBsOfInterest = LeaderboardsAPI.GetPremierLeaderboardsOfInterest();
        let elSeasonDropdown = $('#jsNavSeason');
        let elSeason = elSeasonDropdown.GetSelected();
        let lb = elSeason.GetAttributeString('leaderboard', '');
        for (let i = 0; i < arrLBsOfInterest.length; i++) {
            switch (region) {
                case 'World':
                    if (arrLBsOfInterest[i] === lb)
                        return true;
                    break;
                case 'Friends':
                    if (_isLeaderboardTheFriendsLeaderboard(arrLBsOfInterest[i]))
                        return true;
                    break;
                default:
                    if (_getRegionFromLeaderboardName(arrLBsOfInterest[i]) === region)
                        return true;
            }
        }
        return false;
    }
    function _UpdateLeaderboardName() {
        if (m_lbType === 'general') {
            let elSeasonDropdown = $('#jsNavSeason');
            let elLocationDropdown = $('#jsNavLocation');
            let elregion = elLocationDropdown.GetSelected();
            let elSeason = elSeasonDropdown.GetSelected();
            if (elregion && elSeason) {
                if (elregion.GetAttributeString('friendslb', '') === 'true') {
                    m_leaderboardName = elSeason.GetAttributeString('leaderboard', '') + '.friends';
                }
                else {
                    m_leaderboardName = elSeason.GetAttributeString('leaderboard', '') + elregion.GetAttributeString('location-suffix', '');
                }
                $.GetContextPanel().SwitchClass('region', elregion.GetAttributeString('leaderboard-class', ''));
            }
        }
        else if (m_lbType === 'party') {
            m_leaderboardName = LeaderboardsAPI.GetCurrentSeasonPremierLeaderboard() + '.party';
        }
        _msg(m_leaderboardName);
        return m_leaderboardName;
    }
    function _UpdateNameLockButton() {
        let elNameButton = $.GetContextPanel().FindChildTraverse('lbNameButton');
        elNameButton.visible = true;
        let status = MyPersonaAPI.GetMyLeaderboardNameStatus();
        let needsName = LeaderboardsAPI.DoesTheLocalPlayerNeedALeaderboardSafeNameSet();
        let showButton = status !== '' || needsName;
        elNameButton.visible = showButton;
        elNameButton.SetHasClass('no-hover', status !== '');
        elNameButton.ClearPanelEvent('onactivate');
        let buttonText = '';
        if (status) {
            let name = MyPersonaAPI.GetMyLeaderboardName();
            elNameButton.SetDialogVariable('leaderboard-name', name);
            buttonText = $.Localize('#leaderboard_namelock_button_hasname', elNameButton);
            let tooltipText = '';
            switch (status) {
                case 'submitted':
                    elNameButton.SwitchClass('status', 'submitted');
                    tooltipText = $.Localize('#leaderboard_namelock_button_tooltip_submitted');
                    break;
                case 'approved':
                    elNameButton.SwitchClass('status', 'approved');
                    tooltipText = $.Localize('#leaderboard_namelock_button_tooltip_approved');
                    break;
            }
            function onMouseOver(id, tooltipText) {
                UiToolkitAPI.ShowTextTooltip(id, tooltipText);
            }
            elNameButton.SetPanelEvent('onmouseover', onMouseOver.bind(elNameButton, elNameButton.id, tooltipText));
            elNameButton.SetPanelEvent('onmouseout', () => UiToolkitAPI.HideTextTooltip());
        }
        else if (needsName) {
            buttonText = $.Localize('#leaderboard_namelock_button_needsname');
            elNameButton.SetPanelEvent('onactivate', _NameLockPopup);
        }
        elNameButton.SetDialogVariable('leaderboard_namelock_button', buttonText);
    }
    function _InitNavPanels() {
        $('#jsNavSeason').visible = false;
        $('#jsNavLocation').visible = false;
        $('#jsGoToTop').visible = m_lbType === 'general';
        $('#jsGoToMe').visible = m_lbType === 'general';
        if (m_lbType === 'party')
            return;
        _InitSeasonDropdown();
        _InitLocationDropdown();
    }
    function _ShowGlobalRank() {
        let showRank = $.GetContextPanel().GetAttributeString('showglobaloverride', 'true');
        $.GetContextPanel().SetHasClass('hide-global-rank', showRank === 'false');
    }
    function _UpdateGoToMeButton() {
        let lb = m_leaderboardName;
        let arrLBsOfInterest = LeaderboardsAPI.GetPremierLeaderboardsOfInterest();
        let myIndex = LeaderboardsAPI.GetIndexByXuid(lb, m_myXuid);
        let bPresent = arrLBsOfInterest.includes(lb) && myIndex !== -1;
        $.GetContextPanel().FindChildInLayoutFile('jsGoToMe').enabled = bPresent;
    }
    function UpdateLeaderboardList() {
        _msg('-------------- UpdateLeaderboardList ' + m_leaderboardName);
        _UpdateGoToMeButton();
        let status = LeaderboardsAPI.GetState(m_leaderboardName);
        _msg(status + '');
        let elStatus = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-loading');
        let elData = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-nodata');
        let elLeaderboardList = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-list');
        if ("none" == status) {
            elStatus.SetHasClass('hidden', false);
            elData.SetHasClass('hidden', true);
            elLeaderboardList.SetHasClass('hidden', true);
            LeaderboardsAPI.Refresh(m_leaderboardName);
            _msg('leaderboard status: requested');
        }
        else if ("loading" == status) {
            elStatus.SetHasClass('hidden', false);
            elData.SetHasClass('hidden', true);
            elLeaderboardList.SetHasClass('hidden', true);
        }
        else if ("ready" == status) {
            let count = LeaderboardsAPI.GetCount(m_leaderboardName);
            if (count === 0) {
                elData.SetHasClass('hidden', false);
                elStatus.SetHasClass('hidden', true);
                elLeaderboardList.SetHasClass('hidden', true);
            }
            else {
                elLeaderboardList.SetHasClass('hidden', false);
                elStatus.SetHasClass('hidden', true);
                elData.SetHasClass('hidden', true);
                _FillOutEntries();
            }
            if (1 <= LeaderboardsAPI.HowManyMinutesAgoCached(m_leaderboardName)) {
                LeaderboardsAPI.Refresh(m_leaderboardName);
                _msg('leaderboard status: requested');
            }
        }
    }
    Leaderboard.UpdateLeaderboardList = UpdateLeaderboardList;
    function _AddPlayer(elEntry, oPlayer, index) {
        elEntry.SetDialogVariable('player-rank', '');
        elEntry.SetDialogVariable('player-name', '');
        elEntry.SetDialogVariable('player-wins', '');
        elEntry.SetDialogVariable('player-winrate', '');
        elEntry.SetDialogVariable('player-percentile', '');
        elEntry.SetHasClass('no-hover', oPlayer === null);
        elEntry.SetHasClass('background', index % 2 === 0);
        let elAvatar = elEntry.FindChildInLayoutFile('leaderboard-entry-avatar');
        elAvatar.visible = false;
        if (oPlayer) {
            function _AddOpenPlayerCardAction(elPanel, xuid) {
                function openCard() {
                    if (xuid && (xuid !== 0)) {
                        $.DispatchEvent('SidebarContextMenuActive', true);
                        let contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent('', '', 'file://{resources}/layout/context_menus/context_menu_playercard.xml', 'xuid=' + xuid, () => $.DispatchEvent('SidebarContextMenuActive', false));
                        contextMenuPanel.AddClass("ContextMenu_NoArrow");
                    }
                }
                elPanel.SetPanelEvent("onactivate", openCard);
                elPanel.SetPanelEvent("oncontextmenu", openCard);
            }
            elEntry.enabled = true;
            if (m_lbType === 'party' && oPlayer.XUID) {
                elAvatar.PopulateFromSteamID(oPlayer.XUID);
                elAvatar.visible = true;
                _SetHonorIcon(elEntry, oPlayer.XUID);
            }
            else {
                elAvatar.visible = false;
            }
            let elRatingEmblem = elEntry.FindChildTraverse('jsRatingEmblem');
            if (m_lbType === 'party') {
                const teamColorIdx = PartyListAPI.GetPartyMemberSetting(oPlayer.XUID, 'game/teamcolor');
                const teamColorRgb = TeamColor.GetTeamColor(Number(teamColorIdx));
                elAvatar.style.border = '2px solid rgb(' + teamColorRgb + ')';
            }
            _AddOpenPlayerCardAction(elEntry, oPlayer.XUID);
            let options;
            if (m_lbType === 'party') {
                options =
                    {
                        root_panel: elRatingEmblem,
                        rating_type: 'Premier',
                        do_fx: true,
                        leaderboard_details: oPlayer,
                        full_details: false,
                        local_player: oPlayer.XUID === MyPersonaAPI.GetXuid()
                    };
            }
            else {
                options =
                    {
                        root_panel: elRatingEmblem,
                        rating_type: 'Premier',
                        do_fx: true,
                        leaderboard_details: oPlayer,
                        full_details: false,
                        local_player: oPlayer.XUID === MyPersonaAPI.GetXuid()
                    };
            }
            RatingEmblem.SetXuid(options);
            elEntry.SetDialogVariable('player-name', oPlayer.displayName ?? FriendsListAPI.GetFriendName(oPlayer.XUID));
            elEntry.Data().allowNameUpdates = !oPlayer.hasOwnProperty('displayName');
            elEntry.SetDialogVariable('player-wins', oPlayer.hasOwnProperty('matchesWon') ? String(oPlayer.matchesWon) : '-');
            let bHasRank = oPlayer.hasOwnProperty('rank') && oPlayer.rank > 0;
            elEntry.SetDialogVariableInt('player-rank', bHasRank ? oPlayer.rank : 0);
            elEntry.FindChildTraverse('jsPlayerRank').text = bHasRank ? $.Localize('{d:player-rank}', elEntry) : '-';
            let canShowWinRate = oPlayer.hasOwnProperty('matchesWon') && oPlayer.hasOwnProperty('matchesTied') && oPlayer.hasOwnProperty('matchesLost');
            if (canShowWinRate) {
                let matchesPlayed = (oPlayer.matchesWon ? oPlayer.matchesWon : 0) +
                    (oPlayer.matchesTied ? oPlayer.matchesTied : 0) +
                    (oPlayer.matchesLost ? oPlayer.matchesLost : 0);
                let winRate = matchesPlayed === 0 ? 0 : oPlayer.matchesWon * 100.00 / matchesPlayed;
                elEntry.SetDialogVariable('player-winrate', winRate.toFixed(2) + '%');
            }
            else {
                elEntry.SetDialogVariable('player-winrate', '-');
            }
            elEntry.SetDialogVariable('player-percentile', (oPlayer.hasOwnProperty('pct') && oPlayer.pct && oPlayer.pct > 0) ? oPlayer.pct.toFixed(0) + '%' : '-');
            elEntry.SetDialogVariable('player-region', (oPlayer.hasOwnProperty('region')) ? $.Localize('#leaderboard_region_abbr_' + regionToRegionName[oPlayer.region]) : '-');
        }
        return elEntry;
    }
    function _UpdatePartyList() {
        if (m_lbType !== 'party')
            return;
        let elStatus = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-loading');
        let elData = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-nodata');
        let elLeaderboardList = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-list');
        elLeaderboardList.SetHasClass('hidden', false);
        elStatus.SetHasClass('hidden', true);
        elData.SetHasClass('hidden', true);
        function OnMouseOver(xuid) {
            $.DispatchEvent('LeaderboardHoverPlayer', xuid);
        }
        function OnMouseOut() {
            $.DispatchEvent('LeaderboardHoverPlayer', '');
        }
        let elList = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-entries');
        if (LobbyAPI.IsSessionActive()) {
            let members = LobbyAPI.GetSessionSettings().members;
            function GetPartyLBRow(idx) {
                let oPlayer = null;
                let machine = 'machine' + idx;
                let bValidPartyPlayer = members.hasOwnProperty(machine) && members[machine].hasOwnProperty('player0') &&
                    members[machine].player0.hasOwnProperty('xuid');
                if (!bValidPartyPlayer)
                    return null;
                let xuid = members[machine].player0.xuid;
                oPlayer = LeaderboardsAPI.GetEntryDetailsObjectByXuid(m_leaderboardName, xuid);
                if (!oPlayer.XUID) {
                    oPlayer.XUID = xuid;
                }
                if (PartyListAPI.GetFriendCompetitiveRankType(xuid) === "Premier") {
                    let partyScore = PartyListAPI.GetFriendCompetitiveRank(xuid);
                    let partyWins = PartyListAPI.GetFriendCompetitiveWins(xuid);
                    if (partyScore || partyWins) {
                        oPlayer.score = PartyListAPI.GetFriendCompetitiveRank(xuid);
                        oPlayer.matchesWon = PartyListAPI.GetFriendCompetitiveWins(xuid);
                        oPlayer.rankWindowStats = PartyListAPI.GetFriendCompetitivePremierWindowStatsObject(xuid);
                        _msg('PartyList player ' + xuid + ' score=' + oPlayer.score + ' wins=' + oPlayer.matchesWon + ' data={' + JSON.stringify(oPlayer) + '}');
                    }
                }
                return oPlayer;
            }
            elList.SetLoadListItemFunction((parent, nPanelIdx, reusePanel) => {
                let oPlayer = GetPartyLBRow(nPanelIdx);
                if (!reusePanel || reusePanel.IsValid()) {
                    reusePanel = $.CreatePanel("Button", elList, oPlayer ? oPlayer.XUID : '');
                    reusePanel.BLoadLayoutSnippet("leaderboard-entry");
                }
                _AddPlayer(reusePanel, oPlayer, nPanelIdx);
                reusePanel.SetPanelEvent('onmouseover', oPlayer ? OnMouseOver.bind(reusePanel, oPlayer.XUID) : OnMouseOut);
                reusePanel.SetPanelEvent('onmouseout', OnMouseOut);
                return reusePanel;
            });
            elList.UpdateListItems(PartyListAPI.GetCount());
        }
    }
    function OnLeaderboardDirty(type) {
        _msg('OnLeaderboardDirty');
        if (m_leaderboardName && m_leaderboardName === type) {
            LeaderboardsAPI.Refresh(m_leaderboardName);
        }
    }
    function ReadyForDisplay() {
        _msg("ReadyForDisplay");
        RegisterEventHandlers();
        if (m_leaderboardName) {
            LeaderboardsAPI.Refresh(m_leaderboardName);
        }
    }
    Leaderboard.ReadyForDisplay = ReadyForDisplay;
    function UnReadyForDisplay() {
        _msg("UnReadyForDisplay");
        UnregisterEventHandlers();
    }
    Leaderboard.UnReadyForDisplay = UnReadyForDisplay;
    function _UpdateName(xuid) {
        let elList = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-entries');
        let elEntry = elList.FindChildInLayoutFile(xuid);
        if (elEntry && elEntry.Data().allowNameUpdates) {
            elEntry.SetDialogVariable('player-name', FriendsListAPI.GetFriendName(xuid));
        }
    }
    function _NameLockPopup() {
        UiToolkitAPI.ShowCustomLayoutPopup('', 'file://{resources}/layout/popups/popup_leaderboard_namelock.xml');
    }
    function _AutomaticLeaderboardNameLockPopup() {
        let data = $.GetContextPanel().Data();
        let bAlreadyAsked = data && data.bPromptedForLeaderboardSafeName;
        if (bAlreadyAsked)
            return;
        _NameLockPopup();
        data.bPromptedForLeaderboardSafeName = true;
    }
    function _FillOutEntries() {
        let nPlayers = LeaderboardsAPI.GetCount(m_leaderboardName);
        _msg(nPlayers + ' accounts found.');
        const elList = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-entries');
        elList.SetLoadListItemFunction((parent, nPanelIdx, reusePanel) => {
            let oPlayer = LeaderboardsAPI.GetEntryDetailsObjectByIndex(m_leaderboardName, nPanelIdx);
            if (!reusePanel || !reusePanel.IsValid()) {
                reusePanel = $.CreatePanel("Button", elList, oPlayer ? oPlayer.XUID : '');
                reusePanel.BLoadLayoutSnippet("leaderboard-entry");
            }
            _AddPlayer(reusePanel, oPlayer, nPanelIdx);
            reusePanel.SetHasClass('local-player', (oPlayer ? oPlayer.XUID : '') === m_myXuid);
            return reusePanel;
        });
        elList.UpdateListItems(nPlayers);
        $.DispatchEvent('ScrollToDelayLoadListItem', elList, 0, 'topleft', true);
    }
    function OnLeaderboardStateChange(type) {
        _msg('OnLeaderboardStateChange');
        _msg('leaderboard status: received');
        if (m_leaderboardName === type) {
            if (m_lbType === 'party') {
                _UpdatePartyList();
            }
            else if (m_lbType === 'general') {
                UpdateLeaderboardList();
            }
            return;
        }
    }
    Leaderboard.OnLeaderboardStateChange = OnLeaderboardStateChange;
    function OnLeaderboardChange() {
        _UpdateLeaderboardName();
        UpdateLeaderboardList();
    }
    Leaderboard.OnLeaderboardChange = OnLeaderboardChange;
    function GoToSelf() {
        let myIndex = LeaderboardsAPI.GetIndexByXuid(m_leaderboardName, m_myXuid);
        const elList = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-entries');
        $.DispatchEvent('ScrollToDelayLoadListItem', elList, myIndex, 'topleft', true);
    }
    Leaderboard.GoToSelf = GoToSelf;
    function GoToTop() {
        const elList = $.GetContextPanel().FindChildInLayoutFile('id-leaderboard-entries');
        $.DispatchEvent('ScrollToDelayLoadListItem', elList, 0, 'topleft', true);
    }
    Leaderboard.GoToTop = GoToTop;
    {
        $.RegisterEventHandler('ReadyForDisplay', $.GetContextPanel(), Leaderboard.ReadyForDisplay);
        $.RegisterEventHandler('UnreadyForDisplay', $.GetContextPanel(), Leaderboard.UnReadyForDisplay);
        _Init();
    }
})(Leaderboard || (Leaderboard = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZGVyYm9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9jb250ZW50L2NzZ28vcGFub3JhbWEvc2NyaXB0cy9sZWFkZXJib2FyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsa0NBQWtDO0FBQ2xDLHlDQUF5QztBQUN6Qyw0Q0FBNEM7QUFDNUMsc0NBQXNDO0FBY3RDLE1BQU0sa0JBQWtCLEdBQThCO0lBQ3JELE1BQU0sRUFBRSxjQUFjO0lBQ3RCLE1BQU0sRUFBRSxjQUFjO0lBQ3RCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsTUFBTSxFQUFFLFdBQVc7SUFDbkIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsSUFBSSxFQUFFLE9BQU87Q0FDYixDQUFBO0FBRUQsSUFBVSxXQUFXLENBc3ZCcEI7QUF0dkJELFdBQVUsV0FBVztJQUVwQixTQUFTLElBQUksQ0FBRyxHQUFXO0lBRzNCLENBQUM7SUFFRCxJQUFJLG1CQUFtQixHQUFHLEtBQUssQ0FBQztJQUNoQyxJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdEMsSUFBSSxRQUEyQixDQUFDO0lBRWhDLElBQUksK0JBQXVDLENBQUM7SUFDNUMsSUFBSSxxQ0FBNkMsQ0FBQztJQUNsRCxJQUFJLG9DQUE0QyxDQUFDO0lBQ2pELElBQUksZ0NBQXdDLENBQUM7SUFDN0MsSUFBSSxzQkFBOEIsQ0FBQztJQUVuQyxJQUFJLGlCQUFpQixHQUFXLEVBQUUsQ0FBQztJQUVuQyxTQUFnQixxQkFBcUI7UUFFcEMsSUFBSSxDQUFFLHVCQUF1QixDQUFFLENBQUM7UUFFaEMsSUFBSyxDQUFDLG1CQUFtQixFQUN6QjtZQUNDLCtCQUErQixHQUFHLENBQUMsQ0FBQyx5QkFBeUIsQ0FBRSxzQ0FBc0MsRUFBRSxrQkFBa0IsQ0FBRSxDQUFDO1lBQzVILHFDQUFxQyxHQUFHLENBQUMsQ0FBQyx5QkFBeUIsQ0FBRSw0Q0FBNEMs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