'use strict';
// UNUSED JAVASCRIPT: This script is unused because the slideshow code is very poor. Sometimes it causes the game to crash because I dunno... 
// If anyone really wants to patch it then go for it. Line 104 is where the function code is.
var LoadingScreen = (function () {

    var cvars = ['mp_roundtime', 'mp_fraglimit', 'mp_maxrounds'];
    var cvalues = ['0', '0', '0'];

    var _Init = function () {
        $('#ProgressBar').value = 0;

        var elOverview = $('#LoadingScreenOverview');
        elOverview.RemoveAndDeleteChildren();

        $('#LoadingScreenMapName').text = "";
        $('#LoadingScreenGameMode').SetLocalizationString("#SFUI_LOADING");
        $('#LoadingScreenModeDesc').text = "";
        $('#LoadingScreenGameModeIcon').SetImage("");

        var elBackgroundImage = $.GetContextPanel().FindChildInLayoutFile('BackgroundMapImage');
        elBackgroundImage.SetImage("file://{images}/map_icons/screenshots/1080p/default.png");

        $('#LoadingScreenIcon').visible = false;
    }

    var _UpdateLoadingScreenInfo = function (mapName, prettyMapName, prettyGameModeName, gameType, gameMode, descriptionText) {
        for (var j = 0; j < cvars.length; ++j) {
            var val = GameInterfaceAPI.GetSettingString(cvars[j]);
            if (val !== '0') {
                cvalues[j] = val;
            }
        }

        for (var j = 0; j < cvars.length; ++j) {
            const regex = new RegExp('\\${d:' + cvars[j] + '}', 'gi');
            descriptionText = descriptionText.replace(regex, cvalues[j]);
            $.GetContextPanel().SetDialogVariable(cvars[j], cvalues[j]);
        }

        if (mapName) {
            _LoadSlideshowImages(mapName); // the loading screen slideshow finds the map name after the map name gets caught
            
            var mapIconFailedToLoad = function () {
                $('#LoadingScreenMapName').RemoveClass("loading-screen-content__info__text-title-short");
                $('#LoadingScreenMapName').AddClass("loading-screen-content__info__text-title-long");
                $('#LoadingScreenIcon').visible = false;
            }

            $('#LoadingScreenIcon').visible = true;
            $.RegisterEventHandler('ImageFailedLoad', $('#LoadingScreenIcon'), mapIconFailedToLoad.bind(undefined));
            $('#LoadingScreenMapName').RemoveClass("loading-screen-content__info__text-title-long");
            $('#LoadingScreenMapName').AddClass("loading-screen-content__info__text-title-short");
            $('#LoadingScreenIcon').SetImage('file://{images}/map_icons/map_icon_' + mapName + '.svg');

            var mapOverviewLoaded = function () {
                $('#LoadingScreenOverview').visible = true;
            }

            $.RegisterEventHandler('ImageLoaded', $('#LoadingScreenOverview'), mapOverviewLoaded.bind(undefined));
            var mapOverviewFailed = function () {
                $('#LoadingScreenOverview').visible = false;
            }

            $.RegisterEventHandler('ImageFailedLoad', $('#LoadingScreenOverview'), mapOverviewFailed.bind(undefined));

            var elOverview = $('#LoadingScreenOverview');
            if (mapName === "lobby_mapveto") {
                elOverview.SetImage('file://{images}/overheadmaps/' + mapName + '.png');
            } else {
                elOverview.SetImage('file://{images_overviews}/' + mapName + '_radar.dds');
            }

            $('#LoadingScreenIcon').AddClass('show');

            if (prettyMapName != "")
                $('#LoadingScreenMapName').SetProceduralTextThatIPromiseIsLocalizedAndEscaped(prettyMapName, false);
            else
                $('#LoadingScreenMapName').SetLocalizationString(GameStateAPI.GetMapDisplayNameToken(mapName));
        }

        var elInfoBlock = $('#LoadingScreenInfo');

        if (gameMode) {
            elInfoBlock.RemoveClass('hidden');
            if (prettyGameModeName != "")
                $('#LoadingScreenGameMode').SetProceduralTextThatIPromiseIsLocalizedAndEscaped(prettyGameModeName, false);
            else
                $('#LoadingScreenGameMode').SetLocalizationString('#sfui_gamemode_' + gameMode);

            if (GameStateAPI.IsQueuedMatchmakingMode_Team() || mapName === 'lobby_mapveto')
                $('#LoadingScreenGameModeIcon').SetImage("file://{images}/icons/ui/competitive_teams.svg");
            else
                $('#LoadingScreenGameModeIcon').SetImage('file://{images}/icons/ui/' + gameMode + '.svg');

            if (descriptionText != "")
                $('#LoadingScreenModeDesc').SetProceduralTextThatIPromiseIsLocalizedAndEscaped(descriptionText, false);
            else
                $('#LoadingScreenModeDesc').SetLocalizationString("");
        } else {
            elInfoBlock.AddClass('hidden');
        }
    }

var _LoadSlideshowImages = function (mapName) {
    var images = [];
    var suffixes = ['.png', '_1.png', '_2.png', '_3.png', '_4.png'];

    suffixes.forEach(function (suffix) {
        var imagePath = 'file://{images}/map_icons/screenshots/1080p/' + mapName + suffix;
        images.push(imagePath);
    });

    var elBackgroundImage = $.GetContextPanel().FindChildInLayoutFile('BackgroundMapImage');
    var currentImageIndex = 0;

    var changeImage = function () {
        elBackgroundImage.style.opacity = 0;

        $.Schedule(0.25, function () {
            elBackgroundImage.SetImage(images[currentImageIndex % images.length]);
            elBackgroundImage.style.opacity = 1;
        });

        currentImageIndex = (currentImageIndex + 1) % 10; 
    };

    var slideshowHandle = $.Schedule(4, function cycleSlideshow() {
        changeImage();
        slideshowHandle = $.Schedule(4, cycleSlideshow);
    });
    var stopScriptHandle = $.Schedule(40, function () {
        $.CancelScheduled(slideshowHandle);
        $.Msg("Slideshow completed after 10 slides.");
    });
};

    var _SetCharacterAnim = function (elPanel, settings) {
    }

    function CreateMapIcon(overviewKV, elParent, name) {
        var X = overviewKV[name + '_x'];
        var Y = overviewKV[name + '_y'];
        if (X != null && Y != null && parseFloat(X) && parseFloat(Y)) {
            var elIcon = $.CreatePanel("Image", elParent, name);
            elIcon.style.position = Math.floor(X * 100).toString() + "% " + Math.floor(Y * 100).toString() + "% 0px;";
            return elIcon;
        }
    }

    var _OnMapConfigLoaded = function (overviewKV) {
        var elMapOverview = $('#LoadingScreenOverview');
        if (elMapOverview) {
            var elImage;
            if (elImage = CreateMapIcon(overviewKV, elMapOverview, "CTSpawn")) {
                elImage.SetImage("file://{images}/hud/radar/RadarCTLogo.svg");
                elImage.AddClass("ct-spawn");
            }

            if (elImage = CreateMapIcon(overviewKV, elMapOverview, "TSpawn")) {
                elImage.SetImage("file://{images}/hud/radar/RadarTLogo.svg");
                elImage.AddClass("t-spawn");
            }

            if (elImage = CreateMapIcon(overviewKV, elMapOverview, "bombA")) {
                elImage.SetImage("file://{images}/hud/radar/icon-bomb-zone-a.png");
                elImage.AddClass("bomb-zone");
            }

            if (elImage = CreateMapIcon(overviewKV, elMapOverview, "bombB")) {
                elImage.SetImage("file://{images}/hud/radar/icon-bomb-zone-b.png");
                elImage.AddClass("bomb-zone");
            }

            for (var i = 1; i <= 6; i++) {
                if (elImage = CreateMapIcon(overviewKV, elMapOverview, "Hostage" + i)) {
                    elImage.SetImage("file://{images}/icons/ui/hostage_alive.svg");
                    elImage.AddClass("hostage-alive");
                }
            }
        }
    }

    return {
        Init: _Init,
        UpdateLoadingScreenInfo: _UpdateLoadingScreenInfo,
        OnMapConfigLoaded: _OnMapConfigLoaded
    }
})();

(function () {
    $.RegisterForUnhandledEvent('PopulateLoadingScreen', LoadingScreen.UpdateLoadingScreenInfo);
    $.RegisterForUnhandledEvent('QueueConnectToServer', LoadingScreen.Init);
    $.RegisterForUnhandledEvent('OnMapConfigLoaded', LoadingScreen.OnMapConfigLoaded);
    $.RegisterForUnhandledEvent('UnloadLoadingScreenAndReinit', LoadingScreen.Init);
})();
