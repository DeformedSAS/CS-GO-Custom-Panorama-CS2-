"use strict";
/// <reference path="csgo.d.ts" />
/// <reference path="common/promoted_settings.ts" />
/// <reference path="settingsmenu_shared.ts" />
var SettingsMenu;
(function (SettingsMenu) {
    const TabInfo = {
        Promoted: {
            xml: "settings_promoted",
            radioid: "PromotedSettingsRadio"
        },
        KeybdMouseSettings: {
            xml: 'settings_kbmouse',
            radioid: "KBMouseRadio"
        },
        GameSettings: {
            xml: "settings_game",
            radioid: "GameRadio"
        },
        AudioSettings: {
            xml: "settings_audio",
            radioid: "AudioRadio"
        },
        VideoSettings: {
            xml: "settings_video",
            radioid: "VideoRadio"
        },
        Search: {
            xml: "settings_search",
            radioid: "SearchRadio"
        }
    };
    let activeTab;
    function IsTabId(tabname) {
        return TabInfo[tabname] != null;
    }
    SettingsMenu.IsTabId = IsTabId;
    function NavigateToTab(tabID) {
        let bDisplaySteamInputSettings = false;
        let parentPanel = $('#SettingsMenuContent');
        if (!parentPanel.FindChildInLayoutFile(tabID)) {
            let newPanel = $.CreatePanel('Panel', parentPanel, tabID);
            let XmlName = TabInfo[tabID].xml;
            if (bDisplaySteamInputSettings) {
                XmlName = "settings_steaminput";
            }
            newPanel.BLoadLayout('file://{resources}/layout/settings/' + XmlName + '.xml', false, false);
            newPanel.OnPropertyTransitionEndEvent = (panel, propertyName) => {
                if (newPanel === panel && propertyName === 'opacity') {
                    if (newPanel.visible === true && newPanel.BIsTransparent()) {
                        newPanel.visible = false;
                        newPanel.SetReadyForDisplay(false);
                        return true;
                    }
                }
                return false;
            };
            $.RegisterEventHandler('PropertyTransitionEnd', newPanel, newPanel.OnPropertyTransitionEndEvent);
            newPanel.visible = false;
            let contentPanel = newPanel.FindChildInLayoutFile('SettingsMenuTabContent');
            let jumpButtons = newPanel.FindChildInLayoutFile('SettingsMenuJumpButtons');
            if (contentPanel && jumpButtons) {
                contentPanel.SetSendScrollPositionChangedEvents(true);
                $.RegisterEventHandler('ScrollPositionChanged', contentPanel, () => {
                    if (newPanel.Data().bScrollingToId)
                        newPanel.Data().bScrollingToId = false;
                    else
                        jumpButtons.Children().forEach(jumpButton => jumpButton.checked = false);
                });
                jumpButtons.Children()[0].checked = true;
            }
            const newSettings = PromotedSettingsUtil.GetUnacknowledgedPromotedSettings();
            for (let setting of newSettings) {
                const el = newPanel.FindChildTraverse(setting.id);
                if (el) {
                    el.AddClass("setting-is-new");
                }
            }
        }
        if (tabID == "Search") {
            let settings = parentPanel.FindChildInLayoutFile(tabID);
            let searchTextEntry = settings.FindChildInLayoutFile('SettingsSearchTextEntry');
            searchTextEntry.SetFocus();
        }
        if (activeTab !== tabID) {
            if (activeTab) {
                let panelToHide = $.GetContextPanel().FindChildInLayoutFile(activeTab);
                panelToHide.RemoveClass('Active');
            }
            $("#" + TabInfo[tabID].radioid).checked = true;
            activeTab = tabID;
            let activePanel = $.GetContextPanel().FindChildInLayoutFile(tabID);
            activePanel.AddClass('Active');
            {
                activePanel.visible = true;
                activePanel.SetReadyForDisplay(true);
            }
            SettingsMenuShared.NewTabOpened(activeTab);
        }
    }
    SettingsMenu.NavigateToTab = NavigateToTab;
    function _AccountPrivacySettingsChanged() {
        let gameSettingPanel = $.GetContextPanel().FindChildInLayoutFile("GameSettings");
        if (gameSettingPanel != null) {
            let twitchTvSetting = gameSettingPanel.FindChildInLayoutFile("accountprivacydropdown");
            if (twitchTvSetting != null) {
                // @ts-ignore
                twitchTvSetting.OnShow();
            }
        }
    }
    function _OnSettingsMenuShown() {
        SettingsMenuShared.NewTabOpened(activeTab);
    }
    function _OnSettingsMenuHidden() {
        GameInterfaceAPI.ConsoleCommand("host_writeconfig");
        InventoryAPI.StopItemPreviewMusic();
    }
    function _NavigateToSetting(tab, id) {
        if (!IsTabId(tab))
            return;
        $.DispatchEvent("Activated", $("#" + TabInfo[tab].radioid), "mouse");
        SettingsMenuShared.ScrollToId(id);
    }
    function _NavigateToSettingPanel(tab, submenuRadioId, p) {
        if (!IsTabId(tab))
            return;
        $.DispatchEvent("Activated", $("#" + TabInfo[tab].radioid), "mouse");
        if (submenuRadioId != '') {
            let elSubMenuRadio = $.GetContextPanel().GetParent().FindChildTraverse(submenuRadioId);
            if (elSubMenuRadio) {
                $.DispatchEvent("Activated", elSubMenuRadio, "mouse");
            }
        }
        p.ScrollParentToMakePanelFit(3, false);
        p.AddClass('Highlight');
    }
    function _Init() {
        for (let tab in TabInfo) {
            if (tab !== "Promoted" && tab !== "Search")
                NavigateToTab(tab);
        }
    }
    {
        _Init();
        if ($.GetContextPanel().GetAttributeString('set-active-section', '') !== '') {
            let tab = $.GetContextPanel().GetAttributeString('set-active-section', '');
            if (SettingsMenu.IsTabId(tab)) {
                NavigateToTab(tab);
                $.GetContextPanel().SetAttributeString('set-active-section', '');
            }
        }
        else if (PromotedSettingsUtil.GetUnacknowledgedPromotedSettings().length > 0) {
            NavigateToTab('Promoted');
        }
        else {
            const now = new Date();
            if (g_PromotedSettings.filter(setting => setting.start_date <= now && setting.end_date > now).length == 0)
                $('#PromotedSettingsRadio').visible = false;
            NavigateToTab('VideoSettings');
        }
        MyPersonaAPI.RequestAccountPrivacySettings();
        $.RegisterForUnhandledEvent("PanoramaComponent_MyPersona_AccountPrivacySettingsChanged", _AccountPrivacySettingsChanged);
        $.RegisterEventHandler('ReadyForDisplay', $('#JsSettings'), _OnSettingsMenuShown);
        $.RegisterEventHandler('UnreadyForDisplay', $('#JsSettings'), _OnSettingsMenuHidden);
        $.RegisterForUnhandledEvent('SettingsMenu_NavigateToSetting', _NavigateToSetting);
        $.RegisterForUnhandledEvent('SettingsMenu_NavigateToSettingPanel', _NavigateToSettingPanel);
    }
})(SettingsMenu || (SettingsMenu = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NtZW51LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vY29udGVudC9jc2dvL3Bhbm9yYW1hL3NjcmlwdHMvc2V0dGluZ3NtZW51LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxrQ0FBa0M7QUFDbEMsb0RBQW9EO0FBQ3BELCtDQUErQztBQUsvQyxJQUFVLFlBQVksQ0E2UHJCO0FBN1BELFdBQVUsWUFBWTtJQUVyQixNQUFNLE9BQU8sR0FBRztRQUNmLFFBQVEsRUFBRTtZQUNULEdBQUcsRUFBRSxtQkFBbUI7WUFDeEIsT0FBTyxFQUFFLHVCQUF1QjtTQUNoQztRQUNELGtCQUFrQixFQUFFO1lBQ25CLEdBQUcsRUFBRSxrQkFBa0I7WUFDdkIsT0FBTyxFQUFFLGNBQWM7U0FDdkI7UUFDRCxZQUFZLEVBQUU7WUFDYixHQUFHLEVBQUUsZUFBZTtZQUNwQixPQUFPLEVBQUUsV0FBVztTQUNwQjtRQUNELGFBQWEsRUFBRTtZQUNkLEdBQUcsRUFBRSxnQkFBZ0I7WUFDckIsT0FBTyxFQUFFLFlBQVk7U0FDckI7UUFDRCxhQUFhLEVBQUU7WUFDZCxHQUFHLEVBQUUsZ0JBQWdCO1lBQ3JCLE9BQU8sRUFBRSxZQUFZO1NBQ3JCO1FBQ0QsTUFBTSxFQUFFO1lBQ1AsR0FBRyxFQUFFLGlCQUFpQjtZQUN0QixPQUFPLEVBQUUsYUFBYTtTQUN0QjtLQUNELENBQUM7SUFJRixJQUFJLFNBQThCLENBQUM7SUFFbkMsU0FBZ0IsT0FBTyxDQUFHLE9BQWU7UUFFeEMsT0FBTyxPQUFPLENBQUUsT0FBa0IsQ0FBRSxJQUFJLElBQUksQ0FBQztJQUM5QyxDQUFDO0lBSGUsb0JBQU8sVUFHdEIsQ0FBQTtJQUVELFNBQWdCLGFBQWEsQ0FBRyxLQUFjO1FBRTdDLElBQUksMEJBQTBCLEdBQUcsS0FBSyxDQUFDO1FBRXZDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBRSxzQkFBc0IsQ0FBRyxDQUFDO1FBSS9DLElBQUssQ0FBQyxXQUFXLENBQUMscUJBQXFCLENBQUUsS0FBSyxDQUFFLEVBQ2hEO1lBRUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBcUIsQ0FBQztZQUcvRSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUUsS0FBSyxDQUFFLENBQUMsR0FBRyxDQUFDO1lBQ25DLElBQUssMEJBQTBCLEVBQy9CO2dCQUNDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQzthQUNoQztZQUNELFFBQVEsQ0FBQyxXQUFXLENBQUUscUNBQXFDLEdBQUcsT0FBTyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUM7WUFJL0YsUUFBUSxDQUFDLDRCQUE0QixHQUFHLENBQUUsS0FBYyxFQUFFLFlBQW9CLEVBQUcsRUFBRTtnQkFFbEYsSUFBSyxRQUFRLEtBQUssS0FBSyxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQ3JEO29CQUVDLElBQUssUUFBUSxDQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksUUFBUSxDQUFDLGNBQWMsRUFBRSxFQUMzRDt3QkFFQyxRQUFRLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQzt3QkFDekIsUUFBUSxDQUFDLGtCQUFrQixDQUFFLEtBQUssQ0FBRSxDQUFDO3dCQUNyQyxPQUFPLElBQUksQ0FBQztxQkFDWjtpQkFDRDtnQkFFRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQztZQUVGLENBQUMsQ0FBQyxvQkFBb0IsQ0FBRSx1QkFBdUIsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLDRCQUE0QixDQUFFLENBQUM7WUFHbkcsUUFBUSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFHekIsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLHFCQUFxQixDQUFFLHdCQUF3QixDQUFFLENBQUM7WUFDOUUsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLHFCQUFxQixDQUFFLHlCQUF5QixDQUFFLENBQUM7WUFDOUUsSUFBSyxZQUFZLElBQUksV0FBVyxFQUNoQztnQkFDQyxZQUFZLENBQUMsa0NBQWtDLENBQUUsSUFBSSxDQUFFLENBQUM7Z0JBQ3hELENBQUMsQ0FBQyxvQkFBb0IsQ0FBRSx1QkFBdUIsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFO29CQUVuRSxJQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxjQUFjO3dCQUNsQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQzs7d0JBRXZDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBRSxDQUFDO2dCQUM3RSxDQUFDLENBQUUsQ0FBQztnQkFHSixXQUFXLENBQUMsUUFBUSxFQUFFLENBQUUsQ0FBQyxDQUFFLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzthQUMzQztZQUVELE1BQU0sV0FBVyxHQUFHLG9CQUFvQixDQUFDLGlDQUFpQyxFQUFFLENBQUM7WUFDN0UsS0FBTSxJQUFJLE9BQU8sSUFBSSxXQUFXLEVBQ2hDO2dCQUNDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBRSxPQUFPLENBQUMsRUFBRSxDQUFFLENBQUM7Z0JBQ3BELElBQUssRUFBRSxFQUNQO29CQUNDLEVBQUUsQ0FBQyxRQUFRLENBQUUsZ0JBQWdCLENBQUUsQ0FBQztpQkFDaEM7YUFDRDtTQUNEO1FBRUQsSUFBSyxLQUFLLElBQUksUUFBUSxFQUN0QjtZQUNDLElBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBRSxLQUFLLENBQUUsQ0FBQztZQUMxRCxJQUFJLGVBQWUsR0FBRyxRQUFRLENBQUMscUJBQXFCLENBQUUseUJBQXlCLENBQUUsQ0FBQztZQUNsRixlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDM0I7UUFJRCxJQUFLLFNBQVMsS0FBSyxLQUFLLEVBQ3hCO1lBRUMsSUFBSyxTQUFTLEVBQ2Q7Z0JBQ0MsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLHFCQUFxQixDQUFFLFNBQVMsQ0FBRSxDQUFDO2dCQUN6RSxXQUFXLENBQUMsV0FBVyxDQUFFLFFBQVEsQ0FBRSxDQUFDO2FBQ3BDO1lBR0QsQ0FBQyxDQUFFLEdBQUcsR0FBRyxPQUFPLENBQUUsS0FBSyxDQUFFLENBQUMsT0FBTyxDQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUdwRCxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBRSxLQUFLLENBQUUsQ0FBQztZQUNyRSxXQUFXLENBQUMsUUFBUSxDQUFFLFFBQVEsQ0FBRSxDQUFDO1lBR2pDO2dCQUNDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2dCQUMzQixXQUFXLENBQUMsa0JBQWtCLENBQUUsSUFBSSxDQUFFLENBQUM7YUFDdkM7WUFFRCxrQkFBa0IsQ0FBQyxZQUFZLENBQUUsU0FBUyxDQUFFLENBQUM7U0FDN0M7SUFDRixDQUFDO0lBNUdlLDBCQUFhLGdCQTRHNUIsQ0FBQTtJQUVELFNBQVMsOEJBQThCO1FBS3RDLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLHFCQUFxQixDQUFFLGNBQWMsQ0FBRSxDQUFDO1FBQ25GLElBQUssZ0JBQWdCLElBQUksSUFBSSxFQUM3QjtZQUNDLElBQUksZUFBZSxHQUFHLGdCQUFnQixDQUFDLHFCQUFxQixDQUFFLHdCQUF3QixDQUFFLENBQUM7WUFDekYsSUFBSyxlQUFlLElBQUksSUFBSSxFQUM1QjtnQkFDQyxhQUFhO2dCQUNiLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUN6QjtTQUNEO0lBQ0YsQ0FBQztJQUVELFNBQVMsb0JBQW9CO1FBSzVCLGtCQUFrQixDQUFDLFlBQVksQ0FBRSxTQUFVLENBQUUsQ0FBQztJQUMvQyxDQUFDO0lBRUQsU0FBUyxxQkFBcUI7UUFHN0IsZ0JBQWdCLENBQUMsY0FBYyxDQUFFLGtCQUFrQixDQUFFLENBQUM7UUFDdEQsWUFBWSxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVELFNBQVMsa0JBQWtCLENBQUcsR0FBVyxFQUFFLEVBQVU7UUFFcEQsSUFBSyxDQUFDLE9BQU8sQ0FBRSxHQUFHLENBQUU7WUFDbkIsT0FBTztRQUVSLENBQUMsQ0FBQyxhQUFhLENBQUUsV0FBVyxFQUFFLENBQUMsQ0FBRSxHQUFHLEdBQUcsT0FBTyxDQUFFLEdBQUcsQ0FBRSxDQUFDLE9BQU8sQ0FBRyxFQUFFLE9BQU8sQ0FBRSxDQUFDO1FBQzVFLGtCQUFrQixDQUFDLFVBQVUsQ0FBRSxFQUFFLENBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQsU0FBUyx1QkFBdUIsQ0FBRyxHQUFXLEVBQUUsY0FBc0IsRUFBRSxDQUFVO1FBRWpGLElBQUssQ0FBQyxPQUFPLENBQUUsR0FBRyxDQUFFO1lBQ25CLE9BQU87UUFFUixDQUFDLENBQUMsYUFBYSxDQUFFLFdBQVcsRUFBRSxDQUFDLENBQUUsR0FBRyxHQUFHLE9BQU8sQ0FBRSxHQUFHLENBQUUsQ0FBQyxPQUFPLENBQUcsRUFBRSxPQUFPLENBQUUsQ0FBQztRQUM1RSxJQUFLLGNBQWMsSUFBSSxFQUFFLEVBQ3pCO1lBQ0MsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFFLGNBQWMsQ0FBRSxDQUFDO1lBQ3pGLElBQUssY0FBYyxFQUNuQjtnQkFDQyxDQUFDLENBQUMsYUFBYSxDQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFFLENBQUM7YUFDeEQ7U0FDRDtRQUNELENBQUMsQ0FBQywwQkFBMEIsQ0FBRSxDQUFDLEVBQUUsS0FBSyxDQUFFLENBQUM7UUFDekMsQ0FBQyxDQUFDLFFBQVEsQ0FBRSxXQUFXLENBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsU0FBUyxLQUFLO1FBR2IsS0FBTSxJQUFJLEdBQUcsSUFBSSxPQUFPLEVBQ3hCO1lBQ0MsSUFBSyxHQUFHLEtBQUssVUFBVSxJQUFJLEdBQUcsS0FBSyxRQUFRO2dCQUMxQyxhQUFhLENBQUUsR0FBYyxDQUFFLENBQUM7U0FDakM7SUFDRixDQUFDO0lBS0Q7UUFDQyxLQUFLLEVBQUUsQ0FBQztRQUVSLElBQUssQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLGtCQUFrQixDQUFFLG9CQUFvQixFQUFFLEVBQUUsQ0FBRSxLQUFLLEVBQUUsRUFDOUU7WUFDQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsa0JBQWtCLENBQUUsb0JBQW9CLEVBQUUsRUFBRSxDQUFFLENBQUM7WUFDN0UsSUFBSyxZQUFZLENBQUMsT0FBTyxDQUFFLEdBQUcsQ0FBRSxFQUNoQztnQkFDQyxhQUFhLENBQUUsR0FBRyxDQUFFLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBRSxvQkFBb0IsRUFBRSxFQUFFLENBQUUsQ0FBQzthQUNuRTtTQUNEO2FBQ0ksSUFBSyxvQkFBb0IsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQzdFO1lBQ0MsYUFBYSxDQUFFLFVBQVUsQ0FBRSxDQUFDO1NBQzVCO2FBRUQ7WUFDQyxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3ZCLElBQUssa0JBQWtCLENBQUMsTUFBTSxDQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFDM0csQ0FBQyxDQUFFLHdCQUF3QixDQUFHLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUVoRCxhQUFhLENBQUUsZUFBZSxDQUFFLENBQUM7U0FDakM7UUFFRCxZQUFZLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztRQUM3QyxDQUFDLENBQUMseUJBQXlCLENBQUUsMkRBQTJELEVBQUUsOEJBQThCLENBQUUsQ0FBQztRQUUzSCxDQUFDLENBQUMsb0JBQW9CLENBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFFLGFBQWEsQ0FBRyxFQUFFLG9CQUFvQixDQUFFLENBQUM7UUFDdkYsQ0FBQyxDQUFDLG9CQUFvQixDQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBRSxhQUFhLENBQUcsRUFBRSxxQkFBcUIsQ0FBRSxDQUFDO1FBQzFGLENBQUMsQ0FBQyx5QkFBeUIsQ0FBRSxnQ0FBZ0MsRUFBRSxrQkFBa0IsQ0FBRSxDQUFDO1FBQ3BGLENBQUMsQ0FBQyx5QkFBeUIsQ0FBRSxxQ0FBcUMsRUFBRSx1QkFBdUIsQ0FBRSxDQUFDO0tBQzlGO0FBQ0YsQ0FBQyxFQTdQUyxZQUFZLEtBQVosWUFBWSxRQTZQckIifQ==