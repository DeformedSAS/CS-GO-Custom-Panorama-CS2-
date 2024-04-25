"use strict";

var PopupLimitedTest = ( function() {

    var m_scheduleHandle = null;
    function _OnOKPressed()
    {
        MyPersonaAPI.ActionBetaEnrollmentActivate();

        $.GetContextPanel().FindChildInLayoutFile ( 'id-popup-limited-test-download-btn').visible = false;
        $.GetContextPanel().FindChildInLayoutFile ( 'id-popup-limited-test-info-btn').enabled = false;
        $.GetContextPanel().FindChildInLayoutFile ( 'id-popup-limited-test-close-btn').enabled = false;
        $.GetContextPanel().FindChildInLayoutFile ( 'id-popup-limited-test-spinner').SetHasClass( 'hidden', false );

        if ( m_scheduleHandle )
		{
			$.CancelScheduled( m_scheduleHandle );
			m_scheduleHandle = null;
		}
        
      
        m_scheduleHandle = $.Schedule ( 5, _TimeoutEnroll );
    }

    function _TimeoutEnroll()
    {
        
        m_scheduleHandle = null;

        $.DispatchEvent( 'UIPopupButtonClicked', '' );

        UiToolkitAPI.ShowGenericPopupOk(
			$.Localize( '#SFUI_SteamConnectionErrorTitle' ),
			$.Localize( '#popup_limited_test_error' ),
			'',
			function()
			{
			},
			function()
			{
			}
		);
    }

    function _BetaEnrollmentStatusChange()
    {
        let strMyBetaStatus = MyPersonaAPI.GetMyBetaEnrollmentStatus();

                                                       
        if ( strMyBetaStatus === 'enrolled' )
        {
            if ( m_scheduleHandle )
            {
                $.CancelScheduled( m_scheduleHandle );
                m_scheduleHandle = null;
            }

            $.GetContextPanel().FindChildInLayoutFile( 'id-popup-limited-test-spinner' ).SetHasClass( 'hidden', true );
            $.GetContextPanel().FindChildInLayoutFile( 'id-popup-limited-test-check' ).SetHasClass( 'hidden', false );
            $.GetContextPanel().FindChildInLayoutFile( 'id-popup-limited-warning' ).SetHasClass( 'hidden', false );
            $.GetContextPanel().FindChildInLayoutFile ( 'id-popup-limited-test-quit-btn').SetHasClass( 'hidden', false );
            $.GetContextPanel().FindChildInLayoutFile ( 'id-popup-limited-test-info-btn').enabled = true;
            $.GetContextPanel().FindChildInLayoutFile( 'id-popup-limited-test-close-btn' ).enabled = true;
        }
    }

    function _OnQuitPressed ()
    {
        UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle( '#UI_ConfirmExitTitle',
            '#UI_ConfirmExitMessage',
            '',
            '#UI_Quit',
            function() {
                QuitGame( 'Option1' );
            },
            '#UI_Return',
            function() {
            },
            'dim'
        );
    }

    function QuitGame( msg )
    {
                                                         
        GameInterfaceAPI.ConsoleCommand('quit');
    }

    function _OnInfoPressed()
    {
        SteamOverlayAPI.OpenURL( "https://counter-strike.net/cs2" );
        $.DispatchEvent( 'UIPopupButtonClicked', '' );
    }

    function _OnCancelPressed()
    {
        if( m_scheduleHandle )
        {
            return;
        }
        
        $.DispatchEvent( 'UIPopupButtonClicked', '' );
    }

    return {
        OnOKPressed: _OnOKPressed,
        OnInfoPressed: _OnInfoPressed,
        OnCancelPressed: _OnCancelPressed,
        OnQuitPressed: _OnQuitPressed,
        BetaEnrollmentStatusChange: _BetaEnrollmentStatusChange
    }
})();

(function()
{
    $.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_BetaEnrollmentStatusChange', PopupLimitedTest.BetaEnrollmentStatusChange );
})();