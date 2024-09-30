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

    // Dispatch sound only when the movie starts playing
    $.DispatchEvent('PlaySoundEffect', 'UIPanorama.cs2_logo', 'MOUSE');
}

function SkipIntroMovie() {
    $("#IntroMoviePlayer").Stop();
    HideIntroMovie(); // Call to hide movie when skipped
}

function DestroyMoviePlayer() {
    $("#IntroMoviePlayer").SetMovie("");
}

function HideIntroMovie() {
    // Call the function to destroy the movie player
    $.Schedule(0.0, DestroyMoviePlayer);

    // Dispatch an event to hide the intro movie
    $.DispatchEvent("CSGOHideIntroMovie");
}

// Register event handlers
(function() {  
    $.RegisterForUnhandledEvent("CSGOShowIntroMovie", ShowIntroMovie);
    $.RegisterEventHandler("MoviePlayerPlaybackEnded", $("#IntroMoviePlayer"), HideIntroMovie);
})();
