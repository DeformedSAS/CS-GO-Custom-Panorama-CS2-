"use strict";
/// <reference path="csgo.d.ts" />
/// <reference path="settingsmenu_shared.ts" />
var SettingsMenuVideo;
(function (SettingsMenuVideo) {
    function SelectSimpleVideoSettings() {
        SettingsMenuShared.VideoSettingsDiscardChanges();
        SettingsMenuShared.SetVis('video_settings', true);
        SettingsMenuShared.SetVis('advanced_video', false);
        $('#SimpleVideoSettingsRadio').checked = true;
        $('#AdvancedVideoSettingsRadio').checked = false;
    }
    SettingsMenuVideo.SelectSimpleVideoSettings = SelectSimpleVideoSettings;
    function SelectAdvancedVideoSettings() {
        SettingsMenuShared.VideoSettingsDiscardChanges();
        SettingsMenuShared.SetVis('video_settings', false);
        SettingsMenuShared.SetVis('advanced_video', true);
        $('#SimpleVideoSettingsRadio').checked = false;
        $('#AdvancedVideoSettingsRadio').checked = true;
    }
    SettingsMenuVideo.SelectAdvancedVideoSettings = SelectAdvancedVideoSettings;
    function Init() {
        let elMainMenuBkgSetting = $('#MainMenuBkgSettingContainer');
        let cvarInfo = GameInterfaceAPI.GetSettingInfo("ui_mainmenu_bkgnd_movie");
        let aMaps = cvarInfo.allowed_values;
        for (let map of aMaps) {
            let p = $.CreatePanel("Label", elMainMenuBkgSetting, "ui_mainmenu_bkgnd_movie_" + map, {
                text: "#SFUI_Map_" + map,
                value: map
            });
            elMainMenuBkgSetting.AddOption(p);
        }
        elMainMenuBkgSetting.RefreshDisplay();
        let elInspectBkgSetting = $('#InspectBackgroundMapDropDown');
        elInspectBkgSetting.SetDialogVariableLocString("mainmenu_bkgnd", "#SFUI_Map_" + GameInterfaceAPI.GetSettingString("ui_mainmenu_bkgnd_movie"));
        $.RegisterForUnhandledEvent("CSGOMainInitBackgroundMovie", () => {
            elInspectBkgSetting.SetDialogVariableLocString("mainmenu_bkgnd", "#SFUI_Map_" + GameInterfaceAPI.GetSettingString("ui_mainmenu_bkgnd_movie"));
        });
        cvarInfo = GameInterfaceAPI.GetSettingInfo("ui_inspect_bkgnd_map");
        aMaps = cvarInfo.allowed_values;
        for (let map of aMaps) {
            let p = $.CreatePanel("Label", elInspectBkgSetting, "ui_inspect_bkgnd_map_" + map, {
                text: "#SFUI_Map_" + map,
                value: map
            });
            elInspectBkgSetting.AddOption(p);
        }
        elInspectBkgSetting.RefreshDisplay();
    }
    function ShowHudEdgePositions() {
        UiToolkitAPI.ShowCustomLayoutPopupWithCancelCallback('', 'file://{resources}/layout/popups/popup_hud_edge_positions.xml', () => { });
    }
    SettingsMenuVideo.ShowHudEdgePositions = ShowHudEdgePositions;
    {
        SelectSimpleVideoSettings();
        Init();
    }
})(SettingsMenuVideo || (SettingsMenuVideo = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3NtZW51X3ZpZGVvLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vY29udGVudC9jc2dvL3Bhbm9yYW1hL3NjcmlwdHMvc2V0dGluZ3NtZW51X3ZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxrQ0FBa0M7QUFDbEMsK0NBQStDO0FBRS9DLElBQVUsaUJBQWlCLENBc0UxQjtBQXRFRCxXQUFVLGlCQUFpQjtJQUUxQixTQUFnQix5QkFBeUI7UUFFeEMsa0JBQWtCLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztRQUNqRCxrQkFBa0IsQ0FBQyxNQUFNLENBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFFLENBQUM7UUFDcEQsa0JBQWtCLENBQUMsTUFBTSxDQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBRSxDQUFDO1FBQ3JELENBQUMsQ0FBRSwyQkFBMkIsQ0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDakQsQ0FBQyxDQUFFLDZCQUE2QixDQUFHLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUNyRCxDQUFDO0lBUGUsMkNBQXlCLDRCQU94QyxDQUFBO0lBRUQsU0FBZ0IsMkJBQTJCO1FBRTFDLGtCQUFrQixDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDakQsa0JBQWtCLENBQUMsTUFBTSxDQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBRSxDQUFDO1FBQ3JELGtCQUFrQixDQUFDLE1BQU0sQ0FBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUUsQ0FBQztRQUNwRCxDQUFDLENBQUUsMkJBQTJCLENBQUcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ2xELENBQUMsQ0FBRSw2QkFBNkIsQ0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDcEQsQ0FBQztJQVBlLDZDQUEyQiw4QkFPMUMsQ0FBQTtJQUVELFNBQVMsSUFBSTtRQUdaLElBQUksb0JBQW9CLEdBQUcsQ0FBQyxDQUFFLDhCQUE4QixDQUFnQyxDQUFDO1FBQzdGLElBQUksUUFBUSxHQUFHLGdCQUFnQixDQUFDLGNBQWMsQ0FBRSx5QkFBeUIsQ0FBRSxDQUFDO1FBQzVFLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUM7UUFDcEMsS0FBTSxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQ3RCO1lBQ0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsMEJBQTBCLEdBQUcsR0FBRyxFQUFFO2dCQUN2RixJQUFJLEVBQUUsWUFBWSxHQUFHLEdBQUc7Z0JBQ3hCLEtBQUssRUFBRSxHQUFHO2FBQ1YsQ0FBRSxDQUFDO1lBQ0osb0JBQW9CLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBRSxDQUFDO1NBQ3BDO1FBQ0Qsb0JBQW9CLENBQUMsY0FBYyxFQUFFLENBQUM7UUFHdEMsSUFBSSxtQkFBbUIsR0FBRyxDQUFDLENBQUUsK0JBQStCLENBQWdDLENBQUM7UUFDN0YsbUJBQW1CLENBQUMsMEJBQTBCLENBQUUsZ0JBQWdCLEVBQy9ELFlBQVksR0FBRyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBRSx5QkFBeUIsQ0FBRSxDQUFFLENBQUM7UUFFakYsQ0FBQyxDQUFDLHlCQUF5QixDQUFFLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtZQUVoRSxtQkFBbUIsQ0FBQywwQkFBMEIsQ0FBRSxnQkFBZ0IsRUFDL0QsWUFBWSxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixDQUFFLHlCQUF5QixDQUFFLENBQUUsQ0FBQztRQUNsRixDQUFDLENBQUUsQ0FBQztRQUVKLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUUsc0JBQXNCLENBQUUsQ0FBQztRQUNyRSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQztRQUNoQyxLQUFNLElBQUksR0FBRyxJQUFJLEtBQUssRUFDdEI7WUFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSx1QkFBdUIsR0FBRyxHQUFHLEVBQUU7Z0JBQ25GLElBQUksRUFBRSxZQUFZLEdBQUcsR0FBRztnQkFDeEIsS0FBSyxFQUFFLEdBQUc7YUFDVixDQUFFLENBQUM7WUFDSixtQkFBbUIsQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFFLENBQUM7U0FDbkM7UUFDRCxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsU0FBZ0Isb0JBQW9CO1FBRW5DLFlBQVksQ0FBQyx1Q0FBdUMsQ0FBRSxFQUFFLEVBQUUsK0RBQStELEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFFLENBQUM7SUFDeEksQ0FBQztJQUhlLHNDQUFvQix1QkFHbkMsQ0FBQTtJQUdEO1FBQ0MseUJBQXlCLEVBQUUsQ0FBQztRQUM1QixJQUFJLEVBQUUsQ0FBQztLQUNQO0FBQ0YsQ0FBQyxFQXRFUyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBc0UxQiJ9