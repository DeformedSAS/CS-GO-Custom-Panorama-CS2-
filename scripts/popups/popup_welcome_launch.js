var WelcomeLaunch = (function () {
    function _OnOKPressed() {
        var strGoalVersion = $.GetContextPanel().GetAttributeString("uisettingversion", '');
        GameInterfaceAPI.SetSettingString('ui_popup_weaponupdate_version', strGoalVersion);
        $.DispatchEvent('UIPopupButtonClicked', '');
    }

    function _OnCancelPressed() {
        _OnOKPressed();
    }

    function _OnGithubButtonPressed() {
        SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser("https://github.com/DeformedSAS/CS-GO-Custom-Panorama-CS2-");
    }

    function _OnDiscordButtonPressed() {
        SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser("https://discord.gg/dtDxKNNAXZ");
    }

    return {
        OnOKPressed: _OnOKPressed,
        OnCancelPressed: _OnCancelPressed,
        OnGithubButtonPressed: _OnGithubButtonPressed,
        OnDiscordButtonPressed: _OnDiscordButtonPressed
    };
})();
