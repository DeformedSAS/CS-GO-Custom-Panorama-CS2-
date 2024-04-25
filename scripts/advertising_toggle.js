"use strict";
/// <reference path="csgo.d.ts" />
var AdvertisingToggle;
(function (AdvertisingToggle) {
    let _m_elParent = $.GetContextPanel().FindChildInLayoutFile('id-friendslist-broadcast-toggle');
    let _m_elBtn = _m_elParent.FindChildInLayoutFile('id-slider-btn');
    let _m_lobbyListerFilter = '';
    function _Init() {
        _m_elBtn.SetPanelEvent('onactivate', _OnActivateToggle);
    }
    ;
    function OnFilterPressed(sFilter) {
        _m_lobbyListerFilter = sFilter;
        _UpdateToggle();
        _UpdateTooltip(PartyListAPI.GetCount() > 1);
    }
    AdvertisingToggle.OnFilterPressed = OnFilterPressed;
    function _UpdateToggle() {
        if (PartyListAPI.GetCount() > 1) {
            _m_elBtn.checked = false;
            _m_elBtn.enabled = false;
            _UpdateTooltip(true);
            return;
        }
        _m_elBtn.enabled = true;
        _m_elBtn.checked = GetAdvertisingSetting() === _m_lobbyListerFilter;
        _m_elBtn.SetDialogVariable('slide_toggle_text', $.Localize("#advertising_for_hire_" + _m_lobbyListerFilter));
        _UpdateTooltip(false);
    }
    ;
    function _OnActivateToggle() {
        let currentSetting = GetAdvertisingSetting();
        let newSetting = currentSetting === _m_lobbyListerFilter ? '' : _m_lobbyListerFilter;
        PartyListAPI.SetLocalPlayerForHireAdvertising(newSetting);
    }
    function GetAdvertisingSetting() {
        let strAdvertising = PartyListAPI.GetLocalPlayerForHireAdvertising();
        return strAdvertising.split('-')[0];
    }
    AdvertisingToggle.GetAdvertisingSetting = GetAdvertisingSetting;
    function _AdvertisingChanged() {
        let currentSetting = GetAdvertisingSetting();
        _m_elBtn.checked = (currentSetting !== '' && currentSetting === _m_lobbyListerFilter);
        PartyBrowserAPI.Refresh();
    }
    function _UpdateTooltip(isDisabled) {
        let OnMouseOver = function () {
            let tooltipText = isDisabled === true ? '#advertising_for_hire_tooltip_disabled' : '#advertising_for_hire_tooltip';
            UiToolkitAPI.ShowTitleTextTooltip(_m_elBtn.id, '#advertising_for_hire_tooltip_title', tooltipText);
        };
        _m_elBtn.SetPanelEvent('onmouseover', OnMouseOver);
        _m_elBtn.SetPanelEvent('onmouseout', function () { UiToolkitAPI.HideTitleTextTooltip(); });
    }
    ;
    {
        _Init();
        $.RegisterForUnhandledEvent('PanoramaComponent_PartyBrowser_LocalPlayerForHireAdvertisingChanged', _AdvertisingChanged);
        $.RegisterForUnhandledEvent("PanoramaComponent_PartyList_RebuildPartyList", _UpdateToggle);
    }
})(AdvertisingToggle || (AdvertisingToggle = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWR2ZXJ0aXNpbmdfdG9nZ2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vY29udGVudC9jc2dvL3Bhbm9yYW1hL3NjcmlwdHMvYWR2ZXJ0aXNpbmdfdG9nZ2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxrQ0FBa0M7QUFFbEMsSUFBVSxpQkFBaUIsQ0E0RTFCO0FBNUVELFdBQVUsaUJBQWlCO0lBRXZCLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBRSxpQ0FBaUMsQ0FBRSxDQUFDO0lBQ2pHLElBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBRSxlQUFlLENBQUUsQ0FBQztJQUNwRSxJQUFJLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztJQUU5QixTQUFTLEtBQUs7UUFFVixRQUFRLENBQUMsYUFBYSxDQUFFLFlBQVksRUFBRSxpQkFBaUIsQ0FBRSxDQUFDO0lBQzlELENBQUM7SUFBQSxDQUFDO0lBRUYsU0FBZ0IsZUFBZSxDQUFFLE9BQWU7UUFFNUMsb0JBQW9CLEdBQUcsT0FBTyxDQUFDO1FBQy9CLGFBQWEsRUFBRSxDQUFDO1FBQ2hCLGNBQWMsQ0FBRSxZQUFZLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFHLENBQUM7SUFDbkQsQ0FBQztJQUxlLGlDQUFlLGtCQUs5QixDQUFBO0lBR0QsU0FBUyxhQUFhO1FBRWxCLElBQUssWUFBWSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFDaEM7WUFDSSxRQUFRLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUN6QixRQUFRLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUN6QixjQUFjLENBQUUsSUFBSSxDQUFFLENBQUM7WUFDdkIsT0FBTztTQUNWO1FBRUQsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDeEIsUUFBUSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsRUFBRSxLQUFLLG9CQUFvQixDQUFDO1FBQ3BFLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFFLHdCQUF3QixHQUFHLG9CQUFvQixDQUFFLENBQUUsQ0FBQztRQUNqSCxjQUFjLENBQUUsS0FBSyxDQUFFLENBQUM7SUFDNUIsQ0FBQztJQUFBLENBQUM7SUFHRixTQUFTLGlCQUFpQjtRQUV0QixJQUFJLGNBQWMsR0FBRyxxQkFBcUIsRUFBRSxDQUFDO1FBQzdDLElBQUksVUFBVSxHQUFHLGNBQWMsS0FBSyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztRQUNyRixZQUFZLENBQUMsZ0NBQWdDLENBQUUsVUFBVSxDQUFFLENBQUM7SUFDaEUsQ0FBQztJQUVELFNBQWdCLHFCQUFxQjtRQUVqQyxJQUFJLGNBQWMsR0FBRyxZQUFZLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQztRQUNyRSxPQUFPLGNBQWMsQ0FBQyxLQUFLLENBQUUsR0FBRyxDQUFFLENBQUUsQ0FBQyxDQUFFLENBQUM7SUFDNUMsQ0FBQztJQUplLHVDQUFxQix3QkFJcEMsQ0FBQTtJQUVELFNBQVMsbUJBQW1CO1FBRXhCLElBQUksY0FBYyxHQUFHLHFCQUFxQixFQUFFLENBQUM7UUFDN0MsUUFBUSxDQUFDLE9BQU8sR0FBRyxDQUFFLGNBQWMsS0FBSyxFQUFFLElBQUksY0FBYyxLQUFLLG9CQUFvQixDQUFFLENBQUM7UUFDeEYsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRCxTQUFTLGNBQWMsQ0FBRSxVQUFtQjtRQUV4QyxJQUFJLFdBQVcsR0FBRztZQUVkLElBQUksV0FBVyxHQUFHLFVBQVUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLHdDQUF3QyxDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQztZQUNuSCxZQUFZLENBQUMsb0JBQW9CLENBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxxQ0FBcUMsRUFBRSxXQUFXLENBQUUsQ0FBQztRQUN6RyxDQUFDLENBQUM7UUFFRixRQUFRLENBQUMsYUFBYSxDQUFFLGFBQWEsRUFBRSxXQUFXLENBQUUsQ0FBQztRQUNyRCxRQUFRLENBQUMsYUFBYSxDQUFFLFlBQVksRUFBRSxjQUFhLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUM7SUFDaEcsQ0FBQztJQUFBLENBQUM7SUFLRjtRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsQ0FBQyxDQUFDLHlCQUF5QixDQUFFLHFFQUFxRSxFQUFFLG1CQUFtQixDQUFFLENBQUM7UUFDMUgsQ0FBQyxDQUFDLHlCQUF5QixDQUFFLDhDQUE4QyxFQUFFLGFBQWEsQ0FBRSxDQUFDO0tBQ2hHO0FBQ0wsQ0FBQyxFQTVFUyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBNEUxQiJ9