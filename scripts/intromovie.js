'use strict';

function ShowIntroMovie()
{
    var movieName = "file://{resources}/videos/intro.webm";
    var launcherType = MyPersonaAPI.GetLauncherType();
    if (launcherType == "perfectworld")
    {
        movieName = "file://{resources}/videos/intro-perfectworld.webm";
    }
    
    $("#IntroMoviePlayer").SetMovie(movieName);

                                                                 
                                                                                                                                     
                                                                                                                 
    $.Schedule(0.0, PlayIntroMovie);
    $("#IntroMoviePlayer").SetFocus();
    $.RegisterKeyBind($("#IntroMoviePlayer"), "key_enter,key_space,key_escape", SkipIntroMovie);
}

function PlayIntroMovie() {
    $("#IntroMoviePlayer").Play();
}

function SkipIntroMovie() {
    $("#IntroMoviePlayer").Stop();
}

function DestroyMoviePlayer() {
    $("#IntroMoviePlayer").SetMovie("");
}

function HideIntroMovie() {
                                                                                                                 
                                                                                  
    $.Schedule( 0.0, DestroyMoviePlayer );

    $.DispatchEvent("CSGOHideIntroMovie");
}

                                                                                                    
                                           
                                                                                                    
(function()
{  
    $.RegisterForUnhandledEvent("CSGOShowIntroMovie", ShowIntroMovie);
    $.RegisterEventHandler("MoviePlayerPlaybackEnded", $("#IntroMoviePlayer"), HideIntroMovie);
})();