'use strict';


var PopupAcceptMatch = ( function(){

	var m_hasPressedAccept = false;
	var m_numPlayersReady = 0;
	var m_numTotalClientsInReservation = 0;
	var m_numSecondsRemaining = 0;
	var m_isReconnect= false;
	var m_isNqmmAnnouncementOnly = false;
	var m_lobbySettings;
	var m_elTimer = $.GetContextPanel().FindChildInLayoutFile ( 'AcceptMatchCountdown' );
	var m_jsTimerUpdateHandle = false;

	          
	                    
	          
	
	var _Init = function ()
	{
		               
		var elPlayerSlots = $.GetContextPanel().FindChildInLayoutFile( 'AcceptMatchSlots' );
		elPlayerSlots.RemoveAndDeleteChildren();
		
		var settings = $.GetContextPanel().GetAttributeString( 'map_and_isreconnect', '' );

		                                           
		var settingsList = settings.split( ',' );

		var map = settingsList[ 0 ];
		if ( map.charAt( 0 ) === '@' )
		{
			m_isNqmmAnnouncementOnly = true;
			m_hasPressedAccept = true;
			map = map.substr( 1 );
		}
		
		                                                             
		m_isReconnect = settingsList[ 1 ] === 'true' ? true : false;
		m_lobbySettings = LobbyAPI.GetSessionSettings();

		          
		              
		 
			                                 
			                          
			                      
		 
		          

		if ( !m_isReconnect && m_lobbySettings && m_lobbySettings.game  )
		{
			                         
			var elAgreement = $.GetContextPanel().FindChildInLayoutFile( 'Agreement' );
			elAgreement.visible = true;

			var elAgreementComp = $.GetContextPanel().FindChildInLayoutFile( 'AcceptMatchAgreementCompetitive' );
			elAgreementComp.visible = ( m_lobbySettings.game.mode === "competitive" );
		}

		$.DispatchEvent( "ShowReadyUpPanel", "" );

		_SetMatchData( map );

		if ( m_isNqmmAnnouncementOnly )
		{
			$( '#AcceptMatchDataContainer' ).SetHasClass( 'auto', true );
			_UpdateUiState();
			m_jsTimerUpdateHandle = $.Schedule( 1.9, _OnNqmmAutoReadyUp );
		}

		_PopulatePlayerList();
	}

	function _PopulatePlayerList()
	{
		                                         

		var numPlayers = LobbyAPI.GetConfirmedMatchPlayerCount();
		          
		              
		 
			                
			                              
			                 
		 
		          
		if ( !numPlayers || numPlayers <= 2 )
			return;

		$.GetContextPanel().SetHasClass( "accept-match-with-player-list", true );

		$.GetContextPanel().FindChildInLayoutFile( 'id-map-draft-phase-teams' ).RemoveClass( 'hidden' );
		
		var iYourXuidTeamIdx = 0;
		var yourXuid = MyPersonaAPI.GetXuid();
		                                                
		for ( var i = 0; i < numPlayers; ++ i )
		{
			var xuidPlayer = LobbyAPI.GetConfirmedMatchPlayerByIdx( i );
			if ( xuidPlayer && xuidPlayer === yourXuid )
			iYourXuidTeamIdx = ( i < (numPlayers/2) ) ? 0 : 1;
		}
		
		                                                            
		for ( var i = 0; i < numPlayers; ++ i )
		{
			var xuid = LobbyAPI.GetConfirmedMatchPlayerByIdx( i );
			if ( !xuid )
			{
				          
				              
					                
				    
				          
				continue;
			}

			                                                                   
			var iThisPlayerTeamIdx = ( i < (numPlayers/2) ) ? 0 : 1;
			var teamPanelId = ( iYourXuidTeamIdx === iThisPlayerTeamIdx ) ? 'id-map-draft-phase-your-team' : 'id-map-draft-phase-other-team';
			var elTeammates = $.GetContextPanel().FindChildInLayoutFile( teamPanelId ).FindChild( 'id-map-draft-phase-avatars' );
			_MakeAvatar( xuid, elTeammates, true );
		}
	}

	var _MakeAvatar = function( xuid, elTeammates, bisTeamLister = false )
	{
		var panelType = bisTeamLister ? 'Button' : 'Panel';
		var elAvatar = $.CreatePanel( panelType, elTeammates, xuid );
		elAvatar.BLoadLayoutSnippet( 'SmallAvatar' );

		if(bisTeamLister )
		{
			_AddOpenPlayerCardAction( elAvatar, xuid );
		}

		elAvatar.FindChildTraverse('JsAvatarImage').steamid = xuid;
		var elTeamColor = elAvatar.FindChildInLayoutFile( 'JsAvatarTeamColor' );
		elTeamColor.visible = false;

		var strName = FriendsListAPI.GetFriendName( xuid );
		                                                                  
		elAvatar.SetDialogVariable( 'teammate_name', strName );
	}

	var _AddOpenPlayerCardAction = function ( elAvatar, xuid ) {
		var openCard = function ( xuid )
		{
			                                                                                             
			$.DispatchEvent( 'SidebarContextMenuActive', true );
			
			if ( xuid !== 0 ) {
				var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
					'',
					'',
					'file://{resources}/layout/context_menus/context_menu_playercard.xml', 
					'xuid='+xuid,
					function () {
						$.DispatchEvent('SidebarContextMenuActive', false )
					}
				);
				contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
			}
		}

		elAvatar.SetPanelEvent( "onactivate", openCard.bind( undefined, xuid ));
	};

	var _UpdateUiState = function()
	{
		var btnAccept = $.GetContextPanel().FindChildInLayoutFile ( 'AcceptMatchBtn' );
		var elPlayerSlots = $.GetContextPanel().FindChildInLayoutFile ( 'AcceptMatchSlots' );

		var bHideTimer = false;
		var bShowPlayerSlots = m_hasPressedAccept || m_isReconnect;
		if ( m_isNqmmAnnouncementOnly )
		{
			bShowPlayerSlots = false;
			bHideTimer = true;
		}
		
		btnAccept.SetHasClass( 'hidden', m_hasPressedAccept || m_isReconnect );
		elPlayerSlots.SetHasClass( 'hidden', !bShowPlayerSlots );

		if ( bShowPlayerSlots )
		{
			_UpdatePlayerSlots( elPlayerSlots );
			bHideTimer = true;
		}

		m_elTimer.GetChild(0).text = "0:"+( (m_numSecondsRemaining<10) ? "0":"")+m_numSecondsRemaining;
		m_elTimer.SetHasClass( "hidden", bHideTimer || ( m_numSecondsRemaining <= 0 ) );

		if( m_jsTimerUpdateHandle )
		{
			$.CancelScheduled( m_jsTimerUpdateHandle );
			m_jsTimerUpdateHandle = false;
		}
	}

	var _UpdateTimeRemainingSeconds = function()
	{
		m_numSecondsRemaining = LobbyAPI.GetReadyTimeRemainingSeconds();
		          
		              
			                           
		          
	}

	var _OnTimerUpdate = function()
	{
		m_jsTimerUpdateHandle = false;
		
		_UpdateTimeRemainingSeconds();
		_UpdateUiState();

		if ( m_numSecondsRemaining > 0 )
		{
			if ( m_hasPressedAccept )
			{
				$.DispatchEvent( 'PlaySoundEffect', 'popup_accept_match_waitquiet', 'MOUSE' );
			}
			else
			{
				$.DispatchEvent( 'PlaySoundEffect', 'popup_accept_match_beep', 'MOUSE' );
			}
			m_jsTimerUpdateHandle = $.Schedule( 1.0, _OnTimerUpdate );
		}
	}

	var _FriendsListNameChanged = function ( xuid )
	{
		                                            
		if ( !xuid ) return;
		var elNameLabel = $.GetContextPanel().FindChildTraverse( 'xuid' );
		if ( !elNameLabel ) return;
		
		var strName = FriendsListAPI.GetFriendName( xuid );
		                                                              
		elNameLabel.SetDialogVariable( 'teammate_name', strName );
	}

	var _ReadyForMatch = function ( shouldShow, playersReadyCount, numTotalClientsInReservation )
	{
		                                                             		
		                                                
		if( !shouldShow )
		{
			if( m_jsTimerUpdateHandle )
			{
				$.CancelScheduled( m_jsTimerUpdateHandle );
				m_jsTimerUpdateHandle = false;
			}

			$.DispatchEvent( "CloseAcceptPopup" );
			$.DispatchEvent( 'UIPopupButtonClicked', '' );
			return;
		}

		if ( m_hasPressedAccept && m_numPlayersReady && ( playersReadyCount > m_numPlayersReady ) )
		{
			                                                                                               
			$.DispatchEvent( 'PlaySoundEffect', 'popup_accept_match_person', 'MOUSE' );
		}

		if ( playersReadyCount == 1 && numTotalClientsInReservation == 1 && ( m_numTotalClientsInReservation > 1 ) )
		{	                                                                                 
			                                                                          
			numTotalClientsInReservation = m_numTotalClientsInReservation;
			playersReadyCount = m_numTotalClientsInReservation;
		}
		m_numPlayersReady = playersReadyCount;
		m_numTotalClientsInReservation = numTotalClientsInReservation;
		_UpdateTimeRemainingSeconds();
		_UpdateUiState();

		m_jsTimerUpdateHandle = $.Schedule( 1.0, _OnTimerUpdate );
	}

	var _UpdatePlayerSlots = function ( elPlayerSlots )
	{
		          
		              
		 
			                                    
			                      
		 
		          

		for( var i = 0; i < m_numTotalClientsInReservation; i++ )
		{
			var Slot = $.GetContextPanel().FindChildInLayoutFile( 'AcceptMatchSlot' + i );

			if( !Slot )
			{
				Slot = $.CreatePanel( 'Panel', elPlayerSlots, 'AcceptMatchSlot' + i );
				Slot.BLoadLayoutSnippet( 'AcceptMatchPlayerSlot' );
			}

			Slot.SetHasClass ( 'accept-match__slots__player--accepted', ( i < m_numPlayersReady ) );
		}

		var labelPlayersAccepted = $.GetContextPanel().FindChildInLayoutFile( 'AcceptMatchPlayersAccepted' );
		labelPlayersAccepted.SetDialogVariableInt( 'accepted', m_numPlayersReady );
		labelPlayersAccepted.SetDialogVariableInt( 'slots', m_numTotalClientsInReservation );
		labelPlayersAccepted.text = $.Localize( '#match_ready_players_accepted', labelPlayersAccepted );
	}

	                                                                                             
	var _SetMatchData = function ( map )
	{
		if ( !m_lobbySettings || !m_lobbySettings.game )
			return;

		var labelData = $.GetContextPanel().FindChildInLayoutFile ( 'AcceptMatchModeMap' );
		var strLocalize = '#match_ready_match_data';

		                                                                                                                                                      
		
		labelData.SetDialogVariable( 'mode', $.Localize( '#SFUI_GameMode_' + m_lobbySettings.game.mode ) );

		                                    
		                                                          
		   	                                                                                     
		    
		   	                                                                                         
		   	                                                                                                
		   	                                                    
		   	                                                                                          
		    

		var flags = parseInt( m_lobbySettings.game.gamemodeflags );

		if ( GameModeFlags.DoesModeUseFlags( m_lobbySettings.game.mode ) && flags )
		{
			labelData.SetDialogVariable( 'modifier', $.Localize( '#play_setting_gamemodeflags_' + m_lobbySettings.game.mode + '_' + flags ) );
			strLocalize = '#match_ready_match_data_modifier';
		}

		if( MyPersonaAPI.GetElevatedState() === 'elevated' && SessionUtil.DoesGameModeHavePrimeQueue( m_lobbySettings.game.mode ) && ( m_lobbySettings.game.prime !== 1 || !SessionUtil.AreLobbyPlayersPrime() ))
		{
			$.GetContextPanel().FindChildInLayoutFile( 'AcceptMatchWarning' ).RemoveClass( 'hidden' );
		}

		labelData.SetDialogVariable ( 'map', $.Localize( '#SFUI_Map_' + map ) );

		if ( ( m_lobbySettings.game.mode === 'competitive' ) && ( map === 'lobby_mapveto' ) )
		{
			$('#AcceptMatchModeIcon').SetImage( "file://{images}/icons/ui/competitive_teams.svg" );

			if ( m_lobbySettings.options && m_lobbySettings.options.challengekey )
			{
				                                                                 
				strLocalize = '#match_ready_match_data_map';
				labelData.SetDialogVariable ( 'map', $.Localize( '#SFUI_Lobby_LeaderMatchmaking_Type_PremierPrivateQueue' ) );
			}
		}

		labelData.text = $.Localize( strLocalize, labelData );

		var imgMap = $.GetContextPanel().FindChildInLayoutFile ( 'AcceptMatchMapImage' );		
		imgMap.style.backgroundImage = 'url("file://{images}/map_icons/screenshots/360p/' + map + '.png")';
	}

	var _OnNqmmAutoReadyUp = function ()
	{
		m_jsTimerUpdateHandle = false;
		$.DispatchEvent( 'PlaySoundEffect', 'popup_accept_match_confirmed', 'MOUSE' );
		LobbyAPI.SetLocalPlayerReady( 'deferred' );
		$.DispatchEvent( "CloseAcceptPopup" );
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
	}

	var _OnAcceptMatchPressed = function ()
	{
		m_hasPressedAccept = true;
		$.DispatchEvent( 'PlaySoundEffect', 'popup_accept_match_person', 'MOUSE' );
		LobbyAPI.SetLocalPlayerReady( 'accept' );
	}

	return {
		Init					: _Init,
		ReadyForMatch			: _ReadyForMatch,
		FriendsListNameChanged	: _FriendsListNameChanged,
		OnAcceptMatchPressed	: _OnAcceptMatchPressed
	}

})();

(function()
{
	
	  
	                                                                                                    
	                                                                                                          
	  
	$.RegisterForUnhandledEvent( 'PanoramaComponent_FriendsList_NameChanged', PopupAcceptMatch.FriendsListNameChanged );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Lobby_ReadyUpForMatch', PopupAcceptMatch.ReadyForMatch );
	$.RegisterForUnhandledEvent( 'MatchAssistedAccept', PopupAcceptMatch.OnAcceptMatchPressed );

	  
	           
	                                                                           
	                                                                          
	                                                                          
	                                                                          
	  
	
})();
