"use strict";
/// <reference path="csgo.d.ts" />
/// <reference path="common/formattext.ts" />
var MatchmakingStatus;
(function (MatchmakingStatus) {
    let _m_searchTimeUpdateHandle = false;
    let _m_elStatusPanel = $.GetContextPanel();
    let _m_showMatchingMissions = true;
    function _BCanShow() {
        if (_m_elStatusPanel.GetAttributeString('data-type', '') === 'hud') {
            let mode = GameStateAPI.GetGameModeInternalName(false);
            if (mode === 'survival') {
                let teamCount = Number(GameInterfaceAPI.GetSettingString('sv_dz_team_count'));
                if (teamCount > 1)
                    return false;
                else
                    return true;
            }
            else {
                return false;
            }
        }
        return true;
    }
    function _SessionUpdate() {
        if (!_m_elStatusPanel || !_m_elStatusPanel.IsValid())
            return;
        _UpdateMatchmakingStatus();
    }
    function _UpdateMatchmakingStatus() {
        let lobbySettings = LobbyAPI.GetSessionSettings().game;
        if (!LobbyAPI.IsSessionActive() || !_BCanShow()) {
            _m_elStatusPanel.SetHasClass('hidden', true);
            return;
        }
        _m_elStatusPanel.SetHasClass('hidden', false);
        _UpdateStatusPanel(lobbySettings);
    }
    ;
    function _UpdateStatusPanel(lobbySettings) {
        _CancelSearchTimeUpdate();
        _UpdateSearchWaitPanel(lobbySettings);
        _SearchPanelSearching(lobbySettings);
        _ShowMatchmakingWarnings(lobbySettings);
        _CheckForMatchingMissions(lobbySettings);
    }
    function _UpdateSearchWaitPanel(lobbySettings) {
        let elStatusWait = _m_elStatusPanel.FindChildInLayoutFile('MatchStatusWait');
        if (!lobbySettings || _IsHost() || _IsSeaching()) {
            elStatusWait.AddClass('hidden');
            return;
        }
        elStatusWait.RemoveClass('hidden');
        elStatusWait.FindChildInLayoutFile('MatchStatusWaitLabel').text = $.Localize("#party_waiting_lobby_leader");
    }
    ;
    function _SearchPanelSearching(lobbySettings) {
        let elStatusSearching = _m_elStatusPanel.FindChildInLayoutFile('MatchStatusSearching');
        if (!lobbySettings || !_IsSeaching()) {
            elStatusSearching.AddClass('hidden');
            _m_showMatchingMissions = true;
            _CancelSearchTimeUpdate();
            return;
        }
        elStatusSearching.RemoveClass('hidden');
        let unavailableMatch = _GetSearchStatus().indexOf('unavailable') !== -1 ? true : false;
        let elWarningIcon = elStatusSearching.FindChildInLayoutFile('MatchStatusFailIcon');
        elWarningIcon.SetHasClass('hidden', !unavailableMatch);
        let elSearchTime = elStatusSearching.FindChildInLayoutFile('MatchStatusTime');
        elSearchTime.SetHasClass('hidden', unavailableMatch);
        let elLabel = elStatusSearching.FindChildInLayoutFile('MatchStatusSearchingLabel');
        elLabel.text = $.Localize(_GetSearchStatus());
        if (unavailableMatch)
            return;
        _UpdateSearchTime();
    }
    ;
    function _ShowMatchmakingWarnings(lobbySettings) {
        let elStatusWarnings = _m_elStatusPanel.FindChildInLayoutFile('MatchStatusWarning');
        if (!lobbySettings || !_IsSeaching()) {
            elStatusWarnings.AddClass('hidden');
            return;
        }
        elStatusWarnings.RemoveClass('hidden');
        let serverWarning = NewsAPI.GetCurrentActiveAlertForUser();
        let isWarning = serverWarning !== '' && serverWarning !== undefined ? true : false;
        elStatusWarnings.SetHasClass('hidden', !isWarning);
        if (isWarning)
            elStatusWarnings.FindChild('MatchStatusWarningLabel').text = $.Localize(serverWarning);
    }
    ;
    function _CheckForMatchingMissions(lobbySettings) {
        let nSeasonAccess = GameTypesAPI.GetActiveSeasionIndexValue();
        if (nSeasonAccess < 0 || nSeasonAccess === null) {
            return;
        }
        if (_IsSeaching() && lobbySettings && lobbySettings.mapgroupname && _m_showMatchingMissions) {
            // @ts-ignore
            OperationUtil.MissionsThatMatchYourMatchMakingSettings(lobbySettings.mode, lobbySettings.mapgroupname.split(','), nSeasonAccess);
            _m_showMatchingMissions = false;
        }
    }
    function _IsHost() {
        return LobbyAPI.BIsHost();
    }
    function _GetSearchStatus() {
        return LobbyAPI.GetMatchmakingStatusString();
    }
    ;
    function _IsSeaching() {
        let StatusString = _GetSearchStatus();
        return (StatusString !== '' && StatusString !== null) ? true : false;
    }
    function _UpdateSearchTime() {
        let seconds = LobbyAPI.GetTimeSpentMatchmaking();
        let elSearchTime = _m_elStatusPanel.FindChildInLayoutFile('MatchStatusTime');
        elSearchTime.text = FormatText.SecondsToDDHHMMSSWithSymbolSeperator(seconds);
        _m_searchTimeUpdateHandle = $.Schedule(1.0, _UpdateSearchTime);
    }
    function _CancelSearchTimeUpdate() {
        if (_m_searchTimeUpdateHandle !== false) {
            $.CancelScheduled(_m_searchTimeUpdateHandle);
            _m_searchTimeUpdateHandle = false;
        }
    }
    function _OnHideMainMenu() {
        _CancelSearchTimeUpdate();
    }
    function _OnHidePauseMenu() {
        _CancelSearchTimeUpdate();
    }
    ;
    function _OnShowMenu() {
        _UpdateMatchmakingStatus();
    }
    {
        _UpdateMatchmakingStatus();
        $.RegisterForUnhandledEvent("PanoramaComponent_Lobby_MatchmakingSessionUpdate", _SessionUpdate);
        $.RegisterForUnhandledEvent('PanoramaComponent_GC_Hello', _SessionUpdate);
        $.RegisterForUnhandledEvent("CSGOHideMainMenu", _OnHideMainMenu);
        $.RegisterForUnhandledEvent("CSGOHidePauseMenu", _OnHidePauseMenu);
        $.RegisterForUnhandledEvent("CSGOShowPauseMenu", _OnShowMenu);
        $.RegisterForUnhandledEvent("CSGOShowMainMenu", _OnShowMenu);
    }
})(MatchmakingStatus || (MatchmakingStatus = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2htYWtpbmdfc3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vY29udGVudC9jc2dvL3Bhbm9yYW1hL3NjcmlwdHMvbWF0Y2htYWtpbmdfc3RhdHVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxrQ0FBa0M7QUFDbEMsNkNBQTZDO0FBTTdDLElBQVUsaUJBQWlCLENBcU4xQjtBQXJORCxXQUFVLGlCQUFpQjtJQUUxQixJQUFJLHlCQUF5QixHQUFtQixLQUFLLENBQUM7SUFDdEQsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7SUFFM0MsSUFBSSx1QkFBdUIsR0FBRyxJQUFJLENBQUM7SUFFbkMsU0FBUyxTQUFTO1FBRWpCLElBQUssZ0JBQWdCLENBQUMsa0JBQWtCLENBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBRSxLQUFLLEtBQUssRUFDckU7WUFDQyxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsdUJBQXVCLENBQUUsS0FBSyxDQUFFLENBQUM7WUFDekQsSUFBSyxJQUFJLEtBQUssVUFBVSxFQUN4QjtnQkFDQyxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUUsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUUsa0JBQWtCLENBQUUsQ0FBRSxDQUFDO2dCQUNsRixJQUFLLFNBQVMsR0FBRyxDQUFDO29CQUNqQixPQUFPLEtBQUssQ0FBQzs7b0JBRWIsT0FBTyxJQUFJLENBQUM7YUFDYjtpQkFFRDtnQkFDQyxPQUFPLEtBQUssQ0FBQzthQUNiO1NBQ0Q7UUFHRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxTQUFTLGNBQWM7UUFFdEIsSUFBSyxDQUFDLGdCQUFnQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO1lBQ3BELE9BQU87UUFFUix3QkFBd0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxTQUFTLHdCQUF3QjtRQUVoQyxJQUFJLGFBQWEsR0FBRyxRQUFRLENB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