
var MatchmakingReconnect = ( function()
{
	var m_elOngoingMatch = $.GetContextPanel();
	
	var _Init = function()
	{
		_UpdateState();
		_SetUpButtons();

		m_elOngoingMatch.OnPropertyTransitionEndEvent = function ( panelName, propertyName )
		{
			if( m_elOngoingMatch.id === panelName && propertyName === 'opacity' )
			{
				                                         
				if( m_elOngoingMatch.visible === true && m_elOngoingMatch.BIsTransparent() )
				{
					                                               
					m_elOngoingMatch.visible = false;
					return true;
				}
			}

			return false;
		};
	};

	var _UpdateState = function()
	{
		var bHasOnGoingMatch = CompetitiveMatchAPI.HasOngoingMatch();
		
		m_elOngoingMatch.SetHasClass( 'hidden', !bHasOnGoingMatch );
		if ( m_elOngoingMatch )
		{
			return;
		}
	};

	var _SetUpButtons = function()
	{
		var btnReconnect = $.GetContextPanel().FindChildInLayoutFile( 'MatchmakingReconnect' );
		btnReconnect.SetPanelEvent( 'onactivate', function()
		{
			CompetitiveMatchAPI.ActionReconnectToOngoingMatch();
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
		} );

		var btnAbandon = $.GetContextPanel().FindChildInLayoutFile( 'MatchmakingAbandon' );
		btnAbandon.SetPanelEvent( 'onactivate', function()
		{
			CompetitiveMatchAPI.ActionAbandonOngoingMatch();
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
		} );
	};

	return {
		Init: _Init,
		UpdateState: _UpdateState
	};
} )();

( function()
{
	MatchmakingReconnect.Init();

	$.RegisterForUnhandledEvent( "PanoramaComponent_Lobby_MatchmakingSessionUpdate", MatchmakingReconnect.UpdateState );
	
	                                                                                                                             
	$.RegisterForUnhandledEvent( 'PanoramaComponent_GC_Hello', MatchmakingReconnect.UpdateState );
} )();