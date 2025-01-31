'use strict';

function ShowIntroMovie() {
    var movieName = "file://{resources}/videos/intro.webm";
    var launcherType = MyPersonaAPI.GetLauncherType();
    if (launcherType == "perfectworld") {
        movieName = "file://{resources}/videos/intro-perfectworld.webm";
    }

    $("#IntroMoviePlayer").SetMovie(movieName);
    $("#IntroMoviePlayer").SetFocus();
	$.RegisterKeyBind($("#IntroMoviePlayer"), "key_enter,key_space,key_escape", SkipIntroMovie);
    PlayIntroMovie();
}

function PlayIntroMovie() {
    $("#IntroMoviePlayer").Play();

    $.DispatchEvent('PlaySoundEffect', 'UIPanorama.cs2_logo', 'MOUSE');
}

function SkipIntroMovie() {
    $("#IntroMoviePlayer").Stop();
    HideIntroMovie(); 
}

function DestroyMoviePlayer() {
    $("#IntroMoviePlayer").SetMovie("");
}

function HideIntroMovie() {
    $.Schedule(0.0, DestroyMoviePlayer);
    $.DispatchEvent("CSGOHideIntroMovie");
}

(function() {  
    $.RegisterForUnhandledEvent("CSGOShowIntroMovie", ShowIntroMovie);
    $.RegisterEventHandler("MoviePlayerPlaybackEnded", $("#IntroMoviePlayer"), HideIntroMovie);
})();
