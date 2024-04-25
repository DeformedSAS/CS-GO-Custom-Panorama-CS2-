'use strict';

var PlayMenu = ( function()
{
	var k_workshopPanelId = 'gameModeButtonContainer_workshop';

	                                                                   
	var m_mapSelectionButtonContainers = {};
	                                        
	var m_gameModeConfigs = {};
	                                                    
	var m_arrGameModeRadios = [];
	                                                
	var GetMGDetails;
	var GetGameType;

	var m_bPerfectWorld = ( MyPersonaAPI.GetLauncherType() === 'perfectworld' );
	var m_activeMapGroupSelectionPanelID = null;
	var m_permissions = '';

	                                              
	var m_serverSetting = '';
	var m_gameModeSetting = '';
	var m_serverPrimeSetting = ( GameInterfaceAPI.GetSettingString( 'ui_playsettings_prime' ) === '1' ) ? 1 : 0;
	var m_singleSkirmishMapGroup = null;
	var m_arrSingleSkirmishMapGroups = [];
	                                                                                                                                            

	var m_gameModeFlags = {};

	                    
	var m_isWorkshop = false;

	                     
	var m_challengeKey = '';
	var m_popupChallengeKeyEntryValidate = null;

	var k_workshopModes = {
		classic: 'casual,competitive',

		casual: 'casual',
		competitive: 'competitive',
		wingman: 'scrimcomp2v2',
		deathmatch: 'deathmatch',
		training: 'training',
		coopstrike: 'coopmission',

		custom: 'custom',

		                 
		armsrace: 'armsrace',
		demolition: 'demolition',
		flyingscoutsman: 'flyingscoutsman',
		retakes: 'retakes'
	};

	function inDirectChallenge ()
	{
		return _GetDirectChallengeKey() != '';
	}

	function StartSearch ()
	{
		var btnStartSearch = $( '#StartMatchBtn' );
		btnStartSearch.AddClass( 'pressed' );

		$.DispatchEvent( 'PlaySoundEffect', 'mainmenu_press_GO', 'MOUSE' );

	  	                                 

		if ( inDirectChallenge() )
		{
			_DirectChallengeStartSearch();
			return;
		}
		
		if ( m_isWorkshop )
		{
			_DisplayWorkshopModePopup();
		}
		else
		{

			                                                                                                                                                       
			if ( !_CheckContainerHasAnyChildChecked( _GetMapListForServerTypeAndGameMode( m_activeMapGroupSelectionPanelID ) ) )
			{
				_NoMapSelectedPopup();

				btnStartSearch.RemoveClass( 'pressed' );

				return;
			}

			                                             
			  
			if ( GameModeFlags.DoesModeUseFlags( m_gameModeSetting ) && !m_gameModeFlags[ m_serverSetting + m_gameModeSetting ] )                                               
			{
				btnStartSearch.RemoveClass( 'pressed' );

				var resumeSearchFnHandle = UiToolkitAPI.RegisterJSCallback( StartSearch );
				_OnGameModeFlagsBtnClicked( resumeSearchFnHandle );

				return;
			}


			let settings = ( LobbyAPI.IsSessionActive() && !_GetTournamentOpponent() ) ? LobbyAPI.GetSessionSettings() : null;
			let stage = _GetTournamentStage();
			                                                                                   
			                                  
			   	                                                
			   	                                       
			   	                                       
			   	                                                              
			    
			   	            
			    

			LobbyAPI.StartMatchmaking( MyPersonaAPI.GetMyOfficialTournamentName(),
				MyPersonaAPI.GetMyOfficialTeamName(),
				_GetTournamentOpponent(),
				stage
			);
		}
	}

	function _Init()
	{
		                                                                                                     
		                         
		    
		   	                                                              
		   	                                                     
		   	                          
		   	 
		   		                                                    
		   	 
		    
		      

		                                                
		var cfg = GameTypesAPI.GetConfig();
		                                                                                                  
		                                                   
		for ( var type in cfg.gameTypes )
		{
			for ( var mode in cfg.gameTypes[ type ].gameModes )
			{
				m_gameModeConfigs[ mode ] = cfg.gameTypes[ type ].gameModes[ mode ];
			}
		}

		                                                                                  
		                                                                                                                                 
		GetGameType = function( mode )
		{
			for ( var gameType in cfg.gameTypes ) 
			{
				if ( cfg.gameTypes[ gameType ].gameModes.hasOwnProperty( mode ) )
					return gameType;
			}
		};

		GetMGDetails = function( mg )
		{
			return cfg.mapgroups[ mg ];
		};

		                                                                                                  
		                                                                
		                                                
		var elGameModeSelectionRadios = $( '#GameModeSelectionRadios' );
		m_arrGameModeRadios = elGameModeSelectionRadios.Children();
		m_arrGameModeRadios.forEach( function( entry )
		{
			entry.SetPanelEvent( 'onactivate', function()
			{
				m_isWorkshop = false;
				if ( _IsSingleSkirmishString( entry.id ) )
				{
					m_gameModeSetting = 'skirmish';
					m_singleSkirmishMapGroup = _GetSingleSkirmishMapGroupFromSingleSkirmishString( entry.id )
				}
				else
				{
					m_gameModeSetting = entry.id;
					m_singleSkirmishMapGroup = null;
				}

				if (( entry.id === "competitive" || entry.id === 'scrimcomp2v2' ) && !entry.FindChild( 'GameModeAlert' ).BHasClass( 'hidden' ))
				{
					if ( GameInterfaceAPI.GetSettingString( 'ui_show_unlock_competitive_alert' ) !== '1' )
					{
						GameInterfaceAPI.SetSettingString( 'ui_show_unlock_competitive_alert', '1' );
					}
				}

				                                                                        
				                                                                       
				m_challengeKey = '';

				_ApplySessionSettings();
			} );
		} );

		m_arrGameModeRadios.forEach( function( entry )
		{
			if ( _IsSingleSkirmishString( entry.id ) )
			{
				m_arrSingleSkirmishMapGroups.push( _GetSingleSkirmishMapGroupFromSingleSkirmishString( entry.id ) );
			}
		} );


		var elPrimeButton = $( '#id-play-menu-toggle-prime' );
		elPrimeButton.SetPanelEvent( 'onactivate', function()
		{
			UiToolkitAPI.HideTextTooltip();
			                          
			ApplyPrimeSetting();
		} );

		                         
		var elPermissionsButton = $( '#PermissionsSettings' );
		elPermissionsButton.SetPanelEvent( 'onactivate', function()
		{
			                                                                                                                                  
			var bCurrentlyPrivate = ( LobbyAPI.GetSessionSettings().system.access === "private" );
			var sNewAccessSetting = bCurrentlyPrivate ? "public" : "private";
			var settings = {
				update: {
					System: {
						access: sNewAccessSetting
					}
				}
			};
			GameInterfaceAPI.SetSettingString( 'lobby_default_privacy_bits', ( sNewAccessSetting === "public" ) ? "1" : "0" );
			LobbyAPI.UpdateSessionSettings( settings );
			$.DispatchEvent( 'UIPopupButtonClicked', '' );
		} );

		                           
		var btnStartSearch = $( '#StartMatchBtn' );
		btnStartSearch.SetPanelEvent( 'onactivate', StartSearch );

		var btnCancel = $.GetContextPanel().FindChildInLayoutFile( 'PartyCancelBtn' );
		btnCancel.SetPanelEvent( 'onactivate', function()
		{
			LobbyAPI.StopMatchmaking();
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
		});

		                                                               
		    
		   	                                                                                       
		       

		                                                              
		    
		   	                               
		       

		$( "#WorkshopSearchTextEntry" ).SetPanelEvent( 'ontextentrychange', _UpdateWorkshopMapFilter );

		                                            
		_SyncDialogsFromSessionSettings( LobbyAPI.GetSessionSettings() );
		_ApplySessionSettings();

		                         
		_ShowNewMatchmakingModePopup();

		                                                                        
		var strFavoriteMaps = GameInterfaceAPI.GetSettingString( 'ui_playsettings_custom_preset' );
		if ( strFavoriteMaps === '' )
		{
			_SaveMapSelectionToCustomPreset( true );
		}

		_UpdateGameModeFlagsBtn();
		_UpdateDirectChallengePage( );

	};

	function _RevertForceDirectChallengeSettings ()
	{
		_LoadGameModeFlagsFromSettings();
	}

	function _TurnOffDirectChallenge ()
	{
		_SetDirectChallengeKey( '' );
		_RevertForceDirectChallengeSettings();
		_ApplySessionSettings();

		Scheduler.Cancel( "directchallenge" );
	}


	function _OnDirectChallengeBtn ()
	{
		if ( inDirectChallenge() )
		{
			_TurnOffDirectChallenge();
		}
		else
		{
			                                                                              
			var savedKey = GameInterfaceAPI.GetSettingString( 'ui_playsettings_directchallengekey', '' );

			if ( !savedKey )
				_SetDirectChallengeKey( CompetitiveMatchAPI.GetDirectChallengeCode() );
			else
				_SetDirectChallengeKey( savedKey );
			
			_ApplySessionSettings();
		}
	}

	function _SetDirectChallengeKey ( key )
	{
		var keySource;
		var keySourceLabel;
		var type, id;

		if ( key != '' )
		{
			var oReturn = { value: [] };
			var bValid = _IsChallengeKeyValid( key, oReturn, 'set' );

			type = oReturn.value[ 2 ];                           
			id = oReturn.value[ 3 ];                                 

			if ( bValid )
			{
				switch ( type )
				{
					case 'u':
						keySource = FriendsListAPI.GetFriendName( id );
						keySourceLabel = $.Localize( '#DirectChallenge_CodeSourceLabelUser' );
						break;
					
					case 'g':
						keySource = MyPersonaAPI.GetMyClanNameById( id );
						keySourceLabel = $.Localize( '#DirectChallenge_CodeSourceLabelClan' );

						if ( !keySource )
						{
							keySource = $.Localize( "DirectChallenge_UnknownSource" );
						}

						break;
				}
			}
			
			GameInterfaceAPI.SetSettingString( 'ui_playsettings_directchallengekey', key );
		}


		_SetDirectChallengeIcons( type, id );

		$.GetContextPanel().SetDialogVariable( 'queue-code', key );
		$.GetContextPanel().SetDialogVariable( 'code-source', keySource );
		$.GetContextPanel().SetDialogVariable( 'code-source-label', keySourceLabel );
		$.GetContextPanel().SetAttributeString( 'code-xuid', id );
		$.GetContextPanel().SetAttributeString( 'code-type', type );

		if ( key && ( m_challengeKey != key ))
		{
			                          
			$.Schedule( 0.01, function ( )
			{
				var elHeader = $.GetContextPanel().FindChildTraverse( "JsDirectChallengeKey" );
				if ( elHeader && elHeader.IsValid() )
					elHeader.TriggerClass( 'directchallenge-status__header__queuecode' );
			});
		}

		                      
		var DirectChallengeCheckBox = $.GetContextPanel().FindChildTraverse( 'JsDirectChallengeBtn' );
		DirectChallengeCheckBox.checked = key != '';
		
		                    
		$.GetContextPanel().SetHasClass( 'directchallenge', key != ''  );

		                                            

		m_challengeKey = key;
	}

	var _ClansInfoUpdated = function ()
	{
		if ( m_challengeKey && $.GetContextPanel().GetAttributeString( 'code-type', '' ) === 'g' )
		{
			_SetDirectChallengeKey( m_challengeKey );
		}
	}

	var _AddOpenPlayerCardAction = function ( elAvatar, xuid )
	{
		var openCard = function ( xuid )
		{
			                                                                                             
			$.DispatchEvent( 'SidebarContextMenuActive', true );

			if ( xuid !== 0 )
			{
				var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
					'',
					'',
					'file://{resources}/layout/context_menus/context_menu_playercard.xml',
					'xuid=' + xuid,
					function ()
					{
						$.DispatchEvent( 'SidebarContextMenuActive', false )
					}
				);
				contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
			}
		}

		elAvatar.SetPanelEvent( "onactivate", openCard.bind( undefined, xuid ) );
	};

	function _SetDirectChallengeIcons ( type, id )
	{		
  		                                                                                  

		var elAvatar = $.GetContextPanel().FindChildInLayoutFile( 'JsDirectChallengeAvatar' );

		if ( !elAvatar )
		{
			$.Schedule( 0.1, function ( type, id) 
			{
				_SetDirectChallengeIcons( type, id )
			}.bind( this, type, id ) );
			
			return;
		}

		elAvatar.steamid = id;

		if ( !type || !id )
		{
			elAvatar.SetPanelEvent( 'onactivate', function () { } );
		}

		switch ( type )
		{
			case 'u':

				_AddOpenPlayerCardAction( elAvatar, id );
				break;

			case 'g':
				_AddGoToClanPageAction( elAvatar, id );
				break;
		}
	}

	function _AddGoToClanPageAction ( elAvatar, id )
	{
		elAvatar.SetPanelEvent( 'onactivate', function ()
		{
			SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser( "https://" + SteamOverlayAPI.GetSteamCommunityURL() + "/gid/" + id );
		} );
	}

	function _GetDirectChallengeKey ()
	{
		return m_challengeKey;
	}

	function _OnDirectChallengeRandom(  )
	{
		UiToolkitAPI.ShowGenericPopupOkCancel(
			$.Localize( '#DirectChallenge_CreateNewKey' ),
			$.Localize( '#DirectChallenge_CreateNewKeyMsg' ),
			'',
			function ()
			{
				_SetDirectChallengeKey( CompetitiveMatchAPI.GenerateDirectChallengeCode() );
				_ApplySessionSettings();
			},
			function ()	{}
		);


	}

	function _GetChallengeKeyType ( key )
	{
		var oReturn = { value: [] };
		if ( _IsChallengeKeyValid( key.toUpperCase(), oReturn, '' ) )
		{
			var type = oReturn.value[ 2 ];                           
			var id = oReturn.value[ 3 ];                                 

			return type;
		}
		else
		{
			return '';
		}
	}

	function _OnDirectChallengeEdit ()
	{

		function _SubmitCallback ( value )
		{
			_SetDirectChallengeKey( value.toUpperCase() );
			_ApplySessionSettings();
			StartSearch();
		}

		var submitCallback = UiToolkitAPI.RegisterJSCallback( _SubmitCallback );

		m_popupChallengeKeyEntryValidate = UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_directchallenge_join.xml',
			'&' + 'submitCallback=' + submitCallback
		);

	}

	function _OnDirectChallengeCopy()
	{
		SteamOverlayAPI.CopyTextToClipboard( _GetDirectChallengeKey() );
		UiToolkitAPI.ShowTextTooltip( 'CopyChallengeKey', '#DirectChallenge_Copied' );
	}

	function _IsChallengeKeyValid ( key, oReturn = { value:[] }, how = '' )
	{
		var code = CompetitiveMatchAPI.ValidateDirectChallengeCode( key, how );

		var bValid = ( typeof code === 'string' ) && code.includes( ',' );

		if ( bValid )
		{
			oReturn.value = code.split( ',' );
		}

		return bValid;
	}

	function _DirectChallengeStartSearch ()
	{
		var oReturn = { value:[] };

		var bValid = _IsChallengeKeyValid( m_challengeKey.toUpperCase(), oReturn, 'set' );
		if ( !bValid )
		{
			$.DispatchEvent( 'PlaySoundEffect', 'mainmenu_press_GO', 'MOUSE' );
			return;
		}

  		                                           
		_OnPrivateQueuesUpdate();

		LobbyAPI.StartMatchmaking( '', oReturn.value[ 0 ], oReturn.value[ 1 ], '1' );
	}

	function _NoMapSelectedPopup ()
	{
		                                       
		UiToolkitAPI.ShowGenericPopupOk(
			$.Localize( '#no_maps_selected_title' ),
			$.Localize( '#no_maps_selected_text' ),
			'',
			function () { },
			function () { } );
	}

	function _ShowNewMatchmakingModePopup()
	{
		return;                                                                                 
		var setVersionTo = '3';
		var currentVersion = GameInterfaceAPI.GetSettingString( 'ui_popup_weaponupdate_version' );

		if ( currentVersion !== setVersionTo )
		{	                                 
			GameInterfaceAPI.SetSettingString( 'ui_popup_weaponupdate_version', setVersionTo );
			UiToolkitAPI.ShowCustomLayoutPopup( 'prime_status', 'file://{resources}/layout/popups/popup_premier_matchmaking.xml' );
			                                               
			  	   
			  	                                                              
			  	                                   
			  	      
			    
		}
	};

	function _SetGameModeRadioButtonAvailableTooltip( gameMode, isAvailable, txtTooltip )
	{
		var elGameModeSelectionRadios = $( '#GameModeSelectionRadios' );
		var elTab = elGameModeSelectionRadios ? elGameModeSelectionRadios.FindChildInLayoutFile( gameMode ) : null;
		if ( elTab )
		{
			if ( !isAvailable )
			{
				elTab.SetPanelEvent( 'onmouseover', function()
				{
					UiToolkitAPI.ShowCustomLayoutParametersTooltip( elTab.id,
					'GamemodesLockedneedPrime',
					'file://{resources}/layout/tooltips/tooltip_title_progressbar.xml',
						'titletext=' + '#PlayMenu_unavailable_locked_mode_title' +
						'&' + 'bodytext=' + txtTooltip +
						'&' + 'usexp=' + 'true'
					);
				} ); 
				elTab.SetPanelEvent( 'onmouseout', function() {UiToolkitAPI.HideCustomLayoutTooltip('GamemodesLockedneedPrime');} );
			}
			else
			{
				elTab.SetPanelEvent( 'onmouseover', function() {} );
				elTab.SetPanelEvent( 'onmouseout', function() {} );
			}
		}
	}

	function _SetGameModeRadioButtonVisible( gameMode, isVisible )
	{
		var elGameModeSelectionRadios = $( '#GameModeSelectionRadios' );
		var elTab = elGameModeSelectionRadios ? elGameModeSelectionRadios.FindChildInLayoutFile( gameMode ) : null;
		if ( elTab )
		{
			elTab.visible = isVisible;
		}
	}

	function _IsGameModeAvailable( serverType, gameMode )
	{
		var isAvailable = true;
		
		if ( gameMode === "survival" )
		{
			isAvailable = _IsValveOfficialServer( serverType );
			_SetGameModeRadioButtonAvailableTooltip( gameMode, isAvailable, '#PlayMenu_dangerzone_onlineonly' );
			if ( !isAvailable )
				return false;
		}

		if ( gameMode === "cooperative" || gameMode === "coopmission" )
		{
			var questID = GetMatchmakingQuestId();
			var bGameModeMatchesLobby = questID && ( LobbyAPI.GetSessionSettings().game.mode === gameMode );
			var bAvailable = bGameModeMatchesLobby && MissionsAPI.GetQuestDefinitionField( questID, "gamemode" ) === gameMode;
			_SetGameModeRadioButtonVisible( gameMode, bAvailable );                                                  
			return bAvailable;
		}

		                                                                           
		if ( _IsValveOfficialServer( serverType ) &&                                                                                              
			LobbyAPI.BIsHost() && !(                                         
			MyPersonaAPI.HasPrestige() || ( MyPersonaAPI.GetCurrentLevel() >= 2 )
			) )
		{
			                                  
			                                                            
			  
			                                                          
			                                                                             
			  
			                                                                        
			                                                                         
			   
			                                                   
			    
			   	                                                              
			   		                                                                                                        
			   		      
			   	                                                         
			   		                                                                   
			   		      
			    
			isAvailable = ( gameMode == 'deathmatch' || gameMode == 'casual' || gameMode == 'survival' || gameMode == 'skirmish' );
		}
		                                                                                          
		_SetGameModeRadioButtonAvailableTooltip( gameMode, isAvailable, '#PlayMenu_unavailable_newuser_2' );
		return isAvailable;
	}

	function _GetTournamentOpponent()
	{
		var elTeamDropdown = $.GetContextPanel().FindChildInLayoutFile( 'TournamentTeamDropdown' );
		if ( elTeamDropdown.GetSelected() === null )
			return '';
		return elTeamDropdown.GetSelected().GetAttributeString( 'data', '' );
	}

	function _GetTournamentStage ()
	{
		var elStageDropdown = $.GetContextPanel().FindChildInLayoutFile( 'TournamentStageDropdown' );
		if ( elStageDropdown.GetSelected() === null )
			return '';
		return elStageDropdown.GetSelected().GetAttributeString( 'data', '' );
	}

	function _UpdateStartSearchBtn( isSearchingForTournament )
	{
		var btnStartSearch = $.GetContextPanel().FindChildInLayoutFile( 'StartMatchBtn' );
		btnStartSearch.enabled = isSearchingForTournament ? ( _GetTournamentOpponent() != '' && _GetTournamentStage() != '' ) : true;
	}

	function _UpdateTournamentButton( isHost, isSearching, settingsgamemapgroupname )
	{
		var bIsOfficialCompetitive = m_gameModeSetting === "competitive" && _IsPlayingOnValveOfficial();
		var strTeamName = MyPersonaAPI.GetMyOfficialTeamName();
		var strTournament = MyPersonaAPI.GetMyOfficialTournamentName();
		var isInTournament = isHost && strTeamName != "" && strTournament != "";
		$.GetContextPanel().SetHasClass( "play-menu__tournament", isInTournament );

		var isSearchingForTournament = bIsOfficialCompetitive && isInTournament;

		var elTeamDropdown = $.GetContextPanel().FindChildInLayoutFile( 'TournamentTeamDropdown' );
		var elStageDropdown = $.GetContextPanel().FindChildInLayoutFile( 'TournamentStageDropdown' );
		
		if ( isInTournament )
		{
			function AddDropdownOption( elDropdown, entryID, strText, strData, strSelectedData )
			{
				var newEntry = $.CreatePanel( 'Label', elDropdown, entryID, { data: strData } );
				newEntry.text = strText;
				elDropdown.AddOption( newEntry );

				               
				if ( strSelectedData === strData )
				{
					elDropdown.SetSelected( entryID );
				}
			}

			var strCurrentOpponent = _GetTournamentOpponent();
			var strCurrentStage = _GetTournamentStage();

			                         
			elTeamDropdown.RemoveAllOptions();
			AddDropdownOption( elTeamDropdown, 'PickOpponent', $.Localize( '#SFUI_Tournament_Pick_Opponent' ), '', strCurrentOpponent );
			var teamCount = CompetitiveMatchAPI.GetTournamentTeamCount( strTournament );
			for ( var i = 0; i < teamCount; i++ )
			{
				var strTeam = CompetitiveMatchAPI.GetTournamentTeamNameByIndex( strTournament, i );

				                                  
				if ( strTeamName === strTeam )
					continue;
				
				AddDropdownOption( elTeamDropdown, 'team_' + i, strTeam, strTeam, strCurrentOpponent );
			}
			elTeamDropdown.SetPanelEvent( 'oninputsubmit', _UpdateStartSearchBtn.bind( undefined, isSearchingForTournament ) );

			                          
			elStageDropdown.RemoveAllOptions();
			AddDropdownOption( elStageDropdown, 'PickStage', $.Localize( '#SFUI_Tournament_Stage' ), '', strCurrentStage );
			var stageCount = CompetitiveMatchAPI.GetTournamentStageCount( strTournament );
			for ( var i = 0; i < stageCount; i++ )
			{
				var strStage = CompetitiveMatchAPI.GetTournamentStageNameByIndex( strTournament, i );
				AddDropdownOption( elStageDropdown, 'stage_' + i, strStage, strStage, strCurrentStage );
			}
			elStageDropdown.SetPanelEvent( 'oninputsubmit', _UpdateStartSearchBtn.bind( undefined, isSearchingForTournament ) );
		}
		
		elTeamDropdown.enabled = isSearchingForTournament;
		elStageDropdown.enabled = isSearchingForTournament;

		_UpdateStartSearchBtn( isSearchingForTournament );
		_ShowActiveMapSelectionTab( !isSearchingForTournament );
	}

	function _SyncDialogsFromSessionSettings( settings )
	{
		if ( !settings || !settings.game || !settings.system )
		{
			return;
		}

		m_serverSetting = settings.options.server;
		m_permissions = settings.system.access;
		m_gameModeSetting = settings.game.mode;
		
		_SetDirectChallengeKey( settings.options.hasOwnProperty( 'challengekey' ) ? settings.options.challengekey : '' );
		if ( !m_challengeKey )
		{
			m_serverPrimeSetting = settings.game.prime;
		}

		_setAndSaveGameModeFlags( parseInt( settings.game.gamemodeflags ));
		
		                                       
		m_isWorkshop = settings.game.mapgroupname
			&& settings.game.mapgroupname.includes( '@workshop' );
		
		                                                                      
		$.GetContextPanel().SwitchClass( "gamemode", m_gameModeSetting );
		$.GetContextPanel().SwitchClass( "serversetting", m_serverSetting );
		$.GetContextPanel().SwitchClass( "directchallenge", inDirectChallenge() );

		                                                     
		m_singleSkirmishMapGroup = null;
		if ( m_gameModeSetting === 'skirmish' && settings.game.mapgroupname && m_arrSingleSkirmishMapGroups.includes( settings.game.mapgroupname ) )
		{
			m_singleSkirmishMapGroup = settings.game.mapgroupname;
		}

		var isHost = LobbyAPI.BIsHost();
		var isSearching = _IsSearching();
		var isEnabled = !isSearching && isHost ? true : false;

		if ( m_isWorkshop )
		{
			_SwitchToWorkshopTab( isEnabled );
			_SelectMapButtonsFromSettings( settings );
		}
		else if ( m_gameModeSetting )
		{
			                                           
			for ( var i = 0; i < m_arrGameModeRadios.length; ++i )
			{
				var strGameModeForButton = m_arrGameModeRadios[i].id;

				                                               
				if ( m_singleSkirmishMapGroup )
				{
					if ( _IsSingleSkirmishString( strGameModeForButton ) )
					{
						if ( m_singleSkirmishMapGroup === _GetSingleSkirmishMapGroupFromSingleSkirmishString( strGameModeForButton ) )
						{
							m_arrGameModeRadios[i].checked = true;
						}
					}
				}
				else if ( !_IsSingleSkirmishString( strGameModeForButton ) )
				{
					if ( strGameModeForButton === m_gameModeSetting )
					{
						m_arrGameModeRadios[i].checked = true;
					}
				}

				                                                                                     
				var isAvailable = _IsGameModeAvailable( m_serverSetting, strGameModeForButton );
				m_arrGameModeRadios[ i ].enabled = isAvailable && isEnabled;

				( strGameModeForButton === 'competitive' || strGameModeForButton === 'scrimcomp2v2' ) &&
					_IsPlayingOnValveOfficial() &&
					GameInterfaceAPI.GetSettingString( 'ui_show_unlock_competitive_alert' ) !== '1' &&
					MyPersonaAPI.HasPrestige()
				
				if ( strGameModeForButton === 'competitive' || strGameModeForButton === 'scrimcomp2v2' )
				{
					var bHide = GameInterfaceAPI.GetSettingString( 'ui_show_unlock_competitive_alert' ) === '1' ||
						MyPersonaAPI.HasPrestige() ||
						MyPersonaAPI.GetCurrentLevel() !== 2 ||
						!_IsPlayingOnValveOfficial();
					
					if ( m_arrGameModeRadios[ i ].FindChildInLayoutFile( 'GameModeAlert' ) )
					{
						m_arrGameModeRadios[ i ].FindChildInLayoutFile( 'GameModeAlert' ).SetHasClass( 'hidden', bHide );
					}
				}
			}

			                                                                   
			_UpdateMapGroupButtons( isEnabled, isSearching, isHost );

			                                                   
			_CancelRotatingMapGroupSchedule();
			if ( settings.game.mode === "survival" )
			{
				_GetRotatingMapGroupStatus( m_gameModeSetting, m_singleSkirmishMapGroup, settings.game.mapgroupname );
			}

			_SelectMapButtonsFromSettings( settings );
		}
		else
		{
			                                                         
			                                                                     
			                                                                           
			m_arrGameModeRadios[0].checked = true;
		}

		_ShowHideStartSearchBtn( isSearching, isHost );
		_ShowCancelSearchButton( isSearching, isHost );

		                           
		_UpdateTournamentButton( isHost, isSearching, settings.game.mapgroupname );

		                   
		_UpdatePrimeBtn( isSearching, isHost );
		_UpdatePermissionBtnText( settings, isEnabled );

		                             
		_UpdateLeaderboardBtn( m_gameModeSetting );

		                                         
		_UpdateSurvivalAutoFillSquadBtn( m_gameModeSetting );

		                                  
		_UpdatePlayDropDown();
		_UpdateBotDifficultyButton();

		_UpdateDirectChallengePage( isSearching, isHost );

		_UpdateGameModeFlagsBtn();

		$( '#PlayTopNavDropdown' ).enabled = BIsServerTypeDropdownEnabled();
		_SetClientViewLobbySettingsTitle( isHost );

		function BIsServerTypeDropdownEnabled()
		{
			if ( _IsPlayingOnValveOfficial() &&
				( m_gameModeSetting === "cooperative" || m_gameModeSetting === "coopmission" ) )
				return false;
			else
				return isEnabled;
		}

		_OnPrivateQueuesUpdate( );
	};


	function _UpdateDirectChallengePage ( isSearching = false, isHost = true )
	{
		var bEnable = !isSearching && isHost;

		if ( $( "#RandomChallengeKey" ))
			$( "#RandomChallengeKey" ).enabled = bEnable;

		if ( $( "#EditChallengeKey" ))
			$( "#EditChallengeKey" ).enabled = bEnable;

		if ( $( "#ClanChallengeKey" ))
			$( "#ClanChallengeKey" ).enabled = bEnable;
		
		if ( $( "#JsDirectChallengeBtn" ))
			$( "#JsDirectChallengeBtn" ).enabled = bEnable && ( MyPersonaAPI.HasPrestige() || ( MyPersonaAPI.GetCurrentLevel() >= 2 ) );
		
	}

	function _OnClanChallengeKeySelected ( key )
	{
		_SetDirectChallengeKey( key );
		_ApplySessionSettings();
		StartSearch();
	}

	function _OnChooseClanKeyBtn ()
	{

		if ( MyPersonaAPI.GetMyClanCount() == 0 )
		{

			UiToolkitAPI.ShowGenericPopupTwoOptions(
				'#DirectChallenge_no_steamgroups',
				'#DirectChallenge_no_steamgroups_desc',
				'',
				'#DirectChallenge_openurl',
				function ()
				{
					SteamOverlayAPI.OpenUrlInOverlayOrExternalBrowser( "https://" + SteamOverlayAPI.GetSteamCommunityURL() + "/search/groups" );
				 },
				'#UI_OK',
				function () { }
			);

			return;
		}
		
		var clanKey = _GetChallengeKeyType( m_challengeKey ) == 'g' ? m_challengeKey : '';

		var elClanSelector = UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'id-popup_directchallenge_steamgroups',
			'file://{resources}/layout/popups/popup_directchallenge_steamgroups.xml',
			'currentkey=' + clanKey
		)

		elClanSelector.AddClass( "ContextMenu_NoArrow" );
	}

	function _CreatePlayerTile ( elTile, xuid, delay = 0 )
	{
		                                                                   

		elTile.BLoadLayout( 'file://{resources}/layout/simple_player_tile.xml', false, false );

		                                                               
		$.Schedule( .1, function ( elTile, xuid )
		{
			if ( !elTile || !elTile.IsValid() )
				return;

			elTile.FindChildTraverse( 'JsAvatarImage' ).steamid = xuid;

			var strName = FriendsListAPI.GetFriendName( xuid );
			elTile.SetDialogVariable( 'player_name', strName );

			_AddOpenPlayerCardAction( elTile, xuid );

			Scheduler.Schedule( delay, function ()
			{
				if ( elTile )
					elTile.RemoveClass( 'hidden' );
				
			}, "directchallenge" );


		}.bind( this, elTile, xuid ) );
	}

	function _OnPlayerNameChangedUpdate ( xuid )
	{
		                                                              

		var strName = null;

		var strCodeXuid = $.GetContextPanel().GetAttributeString( 'code-xuid', '' );
		if ( strCodeXuid === xuid )
		{
			if ( !strName )                  
				strName = FriendsListAPI.GetFriendName( xuid );

			$.GetContextPanel().SetDialogVariable( 'code-source', strName );
		}

		var elMembersContainer = $( '#DirectChallengeQueueMembers' );
		if ( !elMembersContainer )
			return;
		
		var elUserTile = elMembersContainer.FindChildTraverse( xuid );
		if ( !elUserTile )
			return;
		
		if ( !strName )                  
			strName = FriendsListAPI.GetFriendName( xuid );

		elUserTile.SetDialogVariable( 'player_name', strName );
		                                                                            
	}


	function _GetPartyID ( partyXuid, arrMembers = [] )
	{

		                                             
		var partyId = '';
		var partySize = PartyBrowserAPI.GetPartyMembersCount( partyXuid );

		for ( var j = 0; j < partySize; j++ )
		{
			var memberXuid = PartyBrowserAPI.GetPartyMemberXuid( partyXuid, j );
			partyId += '_' + memberXuid;
			arrMembers.push( memberXuid );
		}

		return partyId;
	}

	function _OnPrivateQueuesUpdate ()
	{
		                                     

		var elMembersContainer = $.GetContextPanel().FindChildTraverse( 'DirectChallengeQueueMembers' );
		if ( !elMembersContainer )
			return;

		if ( $( "#id-directchallenge-explanation" ))
			$( "#id-directchallenge-explanation" ).SetHasClass( 'hidden', _IsSearching() );
		
		if ( $( "#id-directchallenge-status__queue-members" ))
			$( "#id-directchallenge-status__queue-members" ).SetHasClass( 'hidden', !_IsSearching() );

		                                            
		if ( !_IsSearching() )
		{
			Scheduler.Cancel( "directchallenge" );

			if ( $( '#id-directchallenge-status' ) )
				$( '#id-directchallenge-status' ).text = '';

			if ( elMembersContainer)
				elMembersContainer.RemoveAndDeleteChildren();
			
			return;
		}

		var NumberOfParties = PartyBrowserAPI.GetPrivateQueuesCount();
		var NumberOfPlayers = PartyBrowserAPI.GetPrivateQueuesPlayerCount();
		var NumberOfMorePartiesNotShown = PartyBrowserAPI.GetPrivateQueuesMoreParties();

		                      
		if ( $( '#id-directchallenge-status' ) )
		{
			$.GetContextPanel().SetDialogVariableInt( 'directchallenge_players', NumberOfPlayers );
			$.GetContextPanel().SetDialogVariableInt( 'directchallenge_moreparties', NumberOfMorePartiesNotShown );
			var strStatus = $.Localize( LobbyAPI.GetMatchmakingStatusString() );
			
			if ( NumberOfParties > 0 )
			{
				strStatus += "\t";
				strStatus += $.Localize(
					( NumberOfMorePartiesNotShown > 0 ) ? "#DirectChallenge_SearchingMembersAndMoreParties" : "#DirectChallenge_SearchingMembersLabel",
					$.GetContextPanel() );
			}
			$( '#id-directchallenge-status' ).text = strStatus;
		}

		                          
		elMembersContainer.Children().forEach( function(child)
		{
			                                                        
			child.marked_for_delete = true;
		} );

		var delay = 0;

  		                              
		for ( var i = NumberOfParties; i -- > 0 ; )
		{
			const DELAY_INCREMENT = 0.25;

			var arrMembers = [];

			var partyXuid = PartyBrowserAPI.GetPrivateQueuePartyXuidByIndex(  i );
			var partyId = _GetPartyID( partyXuid, arrMembers )        ;
  
			                  
			             
			 
				                                 
			 
			             
			 
				                                 
				                                 
			 
			             
			 
				                                 
				                                 
				                                 
			 
			             
			 
				                                 
				                                 
				                                 
				                                 
			 
  
			var elParty = elMembersContainer.FindChild( partyId );

			if ( !elParty )
			{
				elParty = $.CreatePanel( 'Panel', elMembersContainer, partyId, { class: 'directchallenge__party hidden' } );
				elParty.SetHasClass( 'multi', arrMembers.length > 1 );
				
				elMembersContainer.MoveChildBefore( elParty, elMembersContainer.Children()[0] );
				elParty.xuid = partyXuid;

				                                                             

				Scheduler.Schedule( delay, function ( elParty )
				{
					if ( elParty && elParty.IsValid())
						elParty.RemoveClass( 'hidden' );
					
				}.bind( this, elParty ), "directchallenge" );
			
				                                  
	  			                             
				arrMembers.forEach( function ( xuid )
				{
					var elTile = $.CreatePanel( 'Panel', elParty, xuid        , { class: "directchallenge__party__member" } );

					_CreatePlayerTile( elTile, xuid, delay );

					delay += DELAY_INCREMENT;
				} );

				                                                                                    
			}
			else
			{
				                                                                                                     
			}
			elParty.marked_for_delete = false;                                                               
		}

		                                                     
		elMembersContainer.Children().forEach( function(child)
		{
			if ( child.marked_for_delete )
			{
				                                                                             
				child.DeleteAsync( 0.0 );
			}
		} );
	}

	function _SetClientViewLobbySettingsTitle( isHost )
	{
		var elTitle = $.GetContextPanel().FindChildInLayoutFile( 'LobbyLeaderText' );
		
		if ( isHost )
		{
			elTitle.text = $.Localize( '#SFUI_MainMenu_PlayButton' );
			return;
		}

		var xuid = PartyListAPI.GetPartySystemSetting( "xuidHost" );
		var leaderName = FriendsListAPI.GetFriendName( xuid );
		

		elTitle.SetDialogVariable( 'name', leaderName );
		elTitle.text = $.Localize( '#play_lobbyleader_title', elTitle );
	};

	function _GetAvailableMapGroups( gameMode, isPlayingOnValveOfficial )
	{
		                                   
		var gameModeCfg = m_gameModeConfigs[ gameMode ];
		if ( gameModeCfg === undefined )
			return [];

		var mapgroup = isPlayingOnValveOfficial ? gameModeCfg.mapgroupsMP : gameModeCfg.mapgroupsSP;
		if ( mapgroup !== undefined && mapgroup !== null )
		{
			return Object.keys( mapgroup );
		}

		if ( ( gameMode === "cooperative" || gameMode === "coopmission" ) && GetMatchmakingQuestId() > 0 )
		{
			return [ LobbyAPI.GetSessionSettings().game.mapgroupname ];
		}

		return [];
	};

	function _GetMapGroupPanelID( )
	{
		var gameModeId = m_gameModeSetting + ( m_singleSkirmishMapGroup ? '@' + m_singleSkirmishMapGroup : '' );
		var panelID = 'gameModeButtonContainer_' + gameModeId + '_' + m_serverSetting + ( inDirectChallenge() ? '_directchallenge' : '' );
		return panelID;
	}

	function _OnActivateMapOrMapGroupButton( mapgroupButton )
	{
		var mapGroupNameClicked = mapgroupButton.GetAttributeString( "mapname", '' );
		if ( $.GetContextPanel().BHasClass( 'play-menu__lobbymapveto_activated' ) && mapGroupNameClicked !== 'mg_lobby_mapveto' )
		{	                                                                
			return;
		}

		$.DispatchEvent( 'PlaySoundEffect', 'submenu_leveloptions_select', 'MOUSE' );

		                                                                                                    
		var mapGroupName = mapGroupNameClicked;
		if ( mapGroupName )
		{
			var siblingSuffix = '_scrimmagemap';
			if ( mapGroupName.toLowerCase().endsWith( siblingSuffix ) )
				mapGroupName = mapGroupName.substring( 0, mapGroupName.length - siblingSuffix.length );
			else
				mapGroupName = mapGroupName + siblingSuffix;

			                                   
			var elParent = mapgroupButton.GetParent();
			if ( elParent )
				elParent = elParent.GetParent();
			if ( elParent && elParent.GetAttributeString( 'hassections', '') )
			{
				elParent.Children().forEach( function( section )
				{
					section.Children().forEach( function( tile )
					{
						var mapGroupNameSibling = tile.GetAttributeString( "mapname", '' );
						if ( mapGroupNameSibling.toLowerCase() === mapGroupName.toLowerCase() )
						{	                           
							tile.checked = false;
						}
					} );
				} );
			}
        }
        
        _MatchMapSelectionWithQuickSelect();

		if ( _CheckContainerHasAnyChildChecked( _GetMapListForServerTypeAndGameMode( m_activeMapGroupSelectionPanelID )) )
		{ 
			_ApplySessionSettings();
		}
	};

	function _ShowActiveMapSelectionTab( isEnabled )
	{
		var panelID = m_activeMapGroupSelectionPanelID;

		for ( var key in m_mapSelectionButtonContainers )
		{
			if ( key !== panelID )
			{
				m_mapSelectionButtonContainers[key].AddClass( "hidden" );
			}
			else
			{
				                               
				m_mapSelectionButtonContainers[key].RemoveClass( "hidden" );
				m_mapSelectionButtonContainers[key].visible = true;

				                                         
				m_mapSelectionButtonContainers[key].enabled = isEnabled;
			}
		}

		var isWorkshop = panelID === k_workshopPanelId;
		$( '#WorkshopSearchBar' ).visible = isWorkshop;
		$( '#GameModeSelectionRadios' ).visible = !isWorkshop;

		                                         
		$( '#WorkshopVisitButton' ).visible = isWorkshop && !m_bPerfectWorld;
		$( '#WorkshopVisitButton' ).enabled = SteamOverlayAPI.IsEnabled();
	};

	function _GetMapTileContainer ()
	{
		return $.GetContextPanel().FindChildInLayoutFile( _GetMapGroupPanelID( ) );
	}

                                                                          
    function _OnMapQuickSelect ( mgName )
    {
                                                  
        var arrMapsToSelect = _GetMapsFromQuickSelectMapGroup( mgName );
        var bScrolled = false;

		var prevSelection = _GetSelectedMapsForServerTypeAndGameMode( m_serverSetting, m_gameModeSetting, true );
		
		var elMapGroupContainer = _GetMapTileContainer();
        elMapGroupContainer.Children().forEach( function ( elMapBtn )
        {
            var bFound = false;

                                                              
            if ( mgName === "all" )
            {
                bFound = true;
            }
            else if ( mgName === "none" )
            {
                bFound = false;
			}
            else
            {
                arrMapsToSelect.forEach( function ( mapname )
                {
                    if ( elMapBtn.GetAttributeString( "mapname", "" ) == mapname )
                    {
                        bFound = true;
                    }
                } );
            }

            elMapBtn.checked = bFound;

                                       
            if ( bFound && !bScrolled )
            {
                elMapBtn.ScrollParentToMakePanelFit( 2, false );
                bScrolled = true;
            }
        } );

                                   
        var newSelection = _GetSelectedMapsForServerTypeAndGameMode( m_serverSetting, m_gameModeSetting, true );
        if ( prevSelection != newSelection )
        {
            $.DispatchEvent( 'PlaySoundEffect', 'submenu_leveloptions_select', 'MOUSE' );

                                         
            _MatchMapSelectionWithQuickSelect();

            if ( _CheckContainerHasAnyChildChecked( _GetMapListForServerTypeAndGameMode( m_activeMapGroupSelectionPanelID )) )
            { 
                _ApplySessionSettings();
            }
        }
    }


	                                                                
	function _ValidateMaps ( arrMapList )
	{
		var arrMapTileNames = [];

                                             
		var arrMapButtons = _GetMapListForServerTypeAndGameMode( m_activeMapGroupSelectionPanelID );
		arrMapButtons.forEach( elMapTile => arrMapTileNames.push( elMapTile.GetAttributeString( "mapname", "" )));

                                                                     
		var filteredMapList = arrMapList.filter( strMap => arrMapTileNames.includes( strMap ) );

		return filteredMapList;
	}

	function _GetMapGroupsWithAttribute( strAttribute, strValue )
	{
		var arrNewMapgroups = [];

		var elMapGroupContainer = _GetMapTileContainer();
		                                                                                                                                    

		elMapGroupContainer.Children().forEach( function ( elMapBtn )
		{
			var mgName = elMapBtn.GetAttributeString( "mapname", "" );

			if ( GameTypesAPI.GetMapGroupAttribute( mgName, strAttribute ) === strValue )
			{
				                                         
				arrNewMapgroups.push( mgName );
			}
		} );
		                                                                        

		return arrNewMapgroups;
	}

    function _GetMapsFromQuickSelectMapGroup ( mgName )
	{
        if ( mgName === ( "favorites" ) )
        {
            var mapsAsString = GameInterfaceAPI.GetSettingString( 'ui_playsettings_custom_preset' );
			if ( mapsAsString === '' )
				return [];
			else
			{
				var arrMapList = mapsAsString.split( ',' );
				var filteredMapList = _ValidateMaps( arrMapList );

				                      
				if ( arrMapList.length != filteredMapList.length )
					GameInterfaceAPI.SetSettingString( 'ui_playsettings_custom_preset', filteredMapList.length > 0 ? filteredMapList.join(',') : "" );
				
				return filteredMapList;
			}
		}
		else if ( mgName === "new" )
		{
			return _GetMapGroupsWithAttribute( 'showtagui', 'new' );
		}
		else if ( mgName === "hostage" )
		{
			return _GetMapGroupsWithAttribute( 'icontag', 'hostage' );
		}
		else if ( mgName === "activeduty" )
		{
			return _GetMapGroupsWithAttribute( 'grouptype', 'active' ).filter( x => x !== 'mg_lobby_mapveto' );
		}
		else if ( mgName === "premier" )
		{
			return [ 'mg_lobby_mapveto' ];
		}
        else
		{
			                                                                                
			                                      
			return [];
        }
    }

                                                                                     
    function _MatchMapSelectionWithQuickSelect ()
	{
                                               
		var elQuickSelectContainer = $.GetContextPanel().FindChildInLayoutFile( "JsQuickSelectParent" );
		if ( !elQuickSelectContainer || m_isWorkshop )
            return;

		elQuickSelectContainer.FindChildrenWithClassTraverse( 'preset-button' ).forEach( function ( elQuickBtn, index, aMapGroups )
        {
                                            
            var arrQuickSelectMaps = _GetMapsFromQuickSelectMapGroup( elQuickBtn.id );

            var bMatch = true;

                                                                                   
			var elMapGroupContainer = _GetMapTileContainer();

            for ( var i = 0; i < elMapGroupContainer.Children().length; i++ )
            {
                var elMapBtn = elMapGroupContainer.Children()[ i ];
                var mapName = elMapBtn.GetAttributeString( "mapname", "" );

                if ( elQuickBtn.id == "none" )
                {
                    if ( elMapBtn.checked )
                    {
                        bMatch = false;
                        break;
                    }
				}
				else if ( elQuickBtn.id == "all" )
                {
                    if ( !elMapBtn.checked )
                    {
                        bMatch = false;
                        break;
                    }
				}
				else
                {
                    if ( elMapBtn.checked != ( arrQuickSelectMaps.includes( mapName ) ) )
                    {
                        bMatch = false;
                        break;
                    }
                }
            }

            elQuickBtn.SetHasClass( "match", bMatch );
        } );
    }

	function _LazyCreateMapListPanel( )
	{
		var serverType = m_serverSetting;
		var gameMode = m_gameModeSetting;

		                                                                
		var strRequireTagNameToReuse = null;
		var strRequireTagValueToReuse = null;

		if ( ( gameMode === "cooperative" ) || ( gameMode === "coopmission" ) )
		{
			strRequireTagNameToReuse = 'map-selection-quest-id';
			strRequireTagValueToReuse = '' + GetMatchmakingQuestId();
		}

		var panelID = _GetMapGroupPanelID();
		if ( panelID in m_mapSelectionButtonContainers )
		{
			var bAllowReuseExistingContainer = true;
			var elExistingContainer = m_mapSelectionButtonContainers[ panelID ];
			if ( elExistingContainer && strRequireTagNameToReuse )
			{
				var strExistingTagValue = elExistingContainer.GetAttributeString( strRequireTagNameToReuse, '' );
				bAllowReuseExistingContainer = ( strExistingTagValue === strRequireTagValueToReuse );
			}

			                                                          
			var elFriendLeaderboards = elExistingContainer ? elExistingContainer.FindChildTraverse( "FriendLeaderboards" ) : null;
			if ( elFriendLeaderboards )
			{
				var strEmbeddedLeaderboardName = elFriendLeaderboards.GetAttributeString( "type", null );
				if ( strEmbeddedLeaderboardName )
				{
					LeaderboardsAPI.Refresh( strEmbeddedLeaderboardName );
				}
			}

			if ( bAllowReuseExistingContainer )
				return panelID;	                                                                
			else
				elExistingContainer.DeleteAsync( 0.0 );                                                         
		}
				
		var container = $.CreatePanel( "Panel", $( '#MapSelectionList' ), panelID, {
			class: 'map-selection-list map-selection-list--inner hidden'
		} );

		container.AddClass( 'map-selection-list--' + serverType +'-'+ gameMode );

		                                                                                                                 
		m_mapSelectionButtonContainers[ panelID ] = container;

		                                                                
		var strSnippetNameOverride;
		if ( inDirectChallenge() )
		{
			strSnippetNameOverride = "MapSelectionContainer_directchallenge";
		}
		else
		{
			strSnippetNameOverride = "MapSelectionContainer_" + serverType + "_" + gameMode;
		}
		
		if ( container.BHasLayoutSnippet( strSnippetNameOverride ) )
		{	                                               
			                                                                                                                                                              
			container.BLoadLayoutSnippet( strSnippetNameOverride );
			var elMapTile = container.FindChildTraverse( "MapTile" );
			if ( elMapTile )
				elMapTile.BLoadLayoutSnippet( "MapGroupSelection" );
			
			_LoadLeaderboardsLayoutForContainer( container );
		}
		else
		{	                                                                                 
			strSnippetNameOverride = null;
		}

		                                                                                               
		if ( strRequireTagNameToReuse )
		{
			container.SetAttributeString( strRequireTagNameToReuse, strRequireTagValueToReuse );
		}

		var isPlayingOnValveOfficial = _IsValveOfficialServer( serverType );
		var arrMapGroups = _GetAvailableMapGroups( gameMode, isPlayingOnValveOfficial );
		
		if ( gameMode === 'skirmish' && m_singleSkirmishMapGroup )
		{
			_UpdateOrCreateMapGroupTile( m_singleSkirmishMapGroup, container, null, panelID + m_singleSkirmishMapGroup );
		}
		else
		{
			arrMapGroups.forEach( function( item, index, aMapGroups )
			{
				if ( gameMode === 'skirmish' && m_arrSingleSkirmishMapGroups.includes( aMapGroups[ index ] ) )
				{
					return;
				}
				var elSectionContainer = null;

				elSectionContainer = container;
				if ( strSnippetNameOverride )
					elSectionContainer = container.FindChildTraverse( "MapTile" );
				
				if ( elSectionContainer )
					_UpdateOrCreateMapGroupTile( aMapGroups[ index ], elSectionContainer, null, panelID + aMapGroups[ index ] );
			} );
		}

		                                                                          
		container.OnPropertyTransitionEndEvent = function( panelName, propertyName )
		{
			if ( container.id === panelName && propertyName === 'opacity' &&
				!container.id.startsWith( "FriendLeaderboards" ) )
			{
				                                         
				if ( container.visible === true && container.BIsTransparent() )
				{
					container.visible = false;
					return true;
				}
			}
			return false;
		};

		$.RegisterEventHandler( 'PropertyTransitionEnd', container, container.OnPropertyTransitionEndEvent );

		return panelID;
	};

    function _PopulateQuickSelectBar ( isSearching , isHost  )
    {
                                                                  

		var elQuickSelectContainer = $.GetContextPanel().FindChildInLayoutFile( "jsQuickSelectionSetsContainer" );
		if ( !elQuickSelectContainer )
            return;

		if ( m_isWorkshop )
			return;

        _MatchMapSelectionWithQuickSelect( );
		_EnableDisableQuickSelectBtns( isSearching , isHost );
    }

	function _EnableDisableQuickSelectBtns ( isSearching, isHost )
	{
		var bEnable = !isSearching && isHost;

		var elQuickSelectContainer = $.GetContextPanel().FindChildInLayoutFile( "JsQuickSelectParent" );
		elQuickSelectContainer.FindChildrenWithClassTraverse( 'preset-button' ).forEach( element => element.enabled = bEnable );
	}

	function _SaveMapSelectionToCustomPreset ( bSilent = false )
	{
		                                
		if ( inDirectChallenge() )
			return;
		
		var selectedMaps = _GetSelectedMapsForServerTypeAndGameMode( m_serverSetting, m_gameModeSetting, true );
		if ( selectedMaps === "" )
		{
			if ( !bSilent )
				$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.buymenu_failure', 'MOUSE' );
			
			_NoMapSelectedPopup();

			return;
		}

        GameInterfaceAPI.SetSettingString( 'ui_playsettings_custom_preset', selectedMaps );

		if ( !bSilent )
		{
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.generic_button_press', 'MOUSE' );
			$.GetContextPanel().FindChildInLayoutFile( "jsQuickSelectionSave" ).TriggerClass( 'save');
		}

        _MatchMapSelectionWithQuickSelect();
    }

	function _GetPanelTypeForMapGroupTile( gameMode, singleSkirmishMapGroup )
	{
		var bIsCompetitive = gameMode === 'competitive';
		var bIsSkirmish = gameMode === 'skirmish' && !singleSkirmishMapGroup;
		var bIsWingman = gameMode === 'scrimcomp2v2';

		return ( ( ( bIsCompetitive || bIsSkirmish || bIsWingman ) && _IsValveOfficialServer( m_serverSetting ) ) ? "ToggleButton" : "RadioButton" );
	};

	function _UpdateOrCreateMapGroupTile( mapGroupName, container, elTilePanel, newTileID )
	{
		var mg = GetMGDetails( mapGroupName );
		if ( !mg ) 
			return;

		var p = elTilePanel;                                                            

		if ( !p )
		{
			var panelType = _GetPanelTypeForMapGroupTile( m_gameModeSetting, m_singleSkirmishMapGroup );
			var panelID = newTileID ? newTileID : ( container.id + mapGroupName );
			p = $.CreatePanel( panelType, container, panelID );
			p.BLoadLayoutSnippet( "MapGroupSelection" );
			if ( panelType === "RadioButton" )
			{
				                             
				var radioGroupID;
				if ( panelID.endsWith( mapGroupName ) )
					radioGroupID = panelID.substring( 0, panelID.length - mapGroupName.length );
				else
					radioGroupID = container.id;

				p.group = "radiogroup_" + radioGroupID;
			}
		}

		p.SetAttributeString( "mapname", mapGroupName );
		p.SetPanelEvent( 'onactivate', _OnActivateMapOrMapGroupButton.bind( this, p ) );

		p.SetHasClass( 'map-selection-btn-activedutymap', mg.grouptype === 'active' );
		p.FindChildInLayoutFile( 'ActiveGroupIcon' ).visible = mg.grouptype === 'active';
		p.FindChildInLayoutFile( 'MapGroupName' ).text = $.Localize( mg.nameID );

		var keysList = Object.keys( mg.maps );
		var mapIcon = null;
		var mapImage = null;

		if ( p.GetParent().id === 'MapTile' )
		{
			p.AddClass( 'map-selection-btn--full' );
		}

		                                           
		if ( keysList.length > 1 )
		{
			p.AddClass( 'map-selection-btn--large' );
			p.FindChildInLayoutFile( 'MapSelectionButton' ).AddClass( 'map-selection-btn-container--large' );
			p.FindChildInLayoutFile( 'MapGroupName' ).AddClass( 'fontSize-m' );
		}
		else
		{
			if ( m_gameModeSetting === 'survival' && _IsValveOfficialServer( m_serverSetting ) )
			{
				if ( MyPersonaAPI.GetLauncherType() === "perfectworld" )
				{
					p.FindChildInLayoutFile( 'MapGroupBetaTag' ).RemoveClass( 'hidden' );
				}
			}
			
			var iconPath = mapGroupName === 'random' ? 'file://{images}/icons/ui/random.svg' : 'file://{images}/' + mg.icon_image_path + '.svg';
			var iconSize = GetIconSize();
			var mapGroupIcon = p.FindChildInLayoutFile( 'MapSelectionButton' ).FindChildInLayoutFile( 'MapGroupCollectionIcon' );

			if ( mapGroupIcon )
			{
				mapGroupIcon.SetImage( iconPath );
			}
			else
			{
				mapGroupIcon = $.CreatePanel( 'Image', p.FindChildInLayoutFile( 'MapSelectionButton' ), 'MapGroupCollectionIcon', {
					defaultsrc: 'file://{images}/map_icons/map_icon_NONE.png',
					texturewidth: iconSize,
					textureheight: iconSize,
					src: iconPath,
					class: 'map-selection-btn__map-icon'
				} );
				p.FindChildInLayoutFile( 'MapSelectionButton' ).MoveChildBefore( mapGroupIcon, p.FindChildInLayoutFile( 'MapGroupCollectionMultiIcons' ) );
			}

			function GetIconSize()
			{
				if ( m_gameModeSetting === 'survival' )
					return '256'
				else if ( m_gameModeSetting === 'cooperative' )
					return '256'
				else if ( m_gameModeSetting === 'coopmission' )
					return '256'
					
				return '116';
			}
		}

		if ( mapGroupName === 'random' )
		{
			mapImage = p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ).FindChildInLayoutFile( 'MapSelectionScreenshot' );

			if ( !mapImage )
			{
				mapImage = $.CreatePanel( 'Panel', p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ), 'MapSelectionScreenshot' );
				mapImage.AddClass( 'map-selection-btn__screenshot' );
			}

			mapImage.style.backgroundImage = 'url("file://{images}/map_icons/screenshots/360p/random.png")';
			mapImage.style.backgroundPosition = '50% 0%';
			mapImage.style.backgroundSize = 'auto 100%';
		}
		
		_SetMapGroupModifierLabelElements( mapGroupName, p );

		                              
		var numImagesPerMultiIconRow = ( keysList.length > 6 ) ? 2 : 1;
		for ( var i = 0; i < keysList.length; i++ )
		{
			mapImage = p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ).FindChildInLayoutFile( 'MapSelectionScreenshot' + i );
			if ( !mapImage )
			{
				mapImage = $.CreatePanel( 'Panel', p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ), 'MapSelectionScreenshot' + i );
				mapImage.AddClass( 'map-selection-btn__screenshot' );
			}
			
			if ( m_gameModeSetting === 'survival' )
			{
				mapImage.style.backgroundImage = 'url("file://{resources}/videos/' + keysList[ i ] + '_preview.webm")';
			}
			else
			{
				mapImage.style.backgroundImage = 'url("file://{images}/map_icons/screenshots/360p/' + keysList[ i ] + '.png")';
			}
			mapImage.style.backgroundPosition = '50% 0%';
			mapImage.style.backgroundSize = 'auto 100%';

			                               
			if ( keysList.length > 1 )
			{
				                                   

				var mapIconsContainer = p.FindChildInLayoutFile( 'MapGroupCollectionMultiIcons' );
				if ( numImagesPerMultiIconRow > 1 )
				{
					var subContainerID = 'MultiIconsSubPanel' + Math.floor( i / numImagesPerMultiIconRow );
					var subPanel = mapIconsContainer.FindChildTraverse( subContainerID );
					if ( !subPanel )
					{
						subPanel = $.CreatePanel( 'Panel', mapIconsContainer, subContainerID );
						subPanel.AddClass( 'map-selection-btn__groupmap-icons-subcontainer' );
					}
					mapIconsContainer = subPanel;
				}

				var subMapIconImagePanelID = 'MapIcon' + i;
				mapIcon = mapIconsContainer.FindChildInLayoutFile( subMapIconImagePanelID );
				if ( !mapIcon )
				{
					mapIcon = $.CreatePanel( 'Image', mapIconsContainer, subMapIconImagePanelID, {
						defaultsrc: 'file://{images}/map_icons/map_icon_NONE.png',
						texturewidth: '72',
						textureheight: '72',
						src: 'file://{images}/map_icons/map_icon_' + keysList[ i ] + '.svg'
					} );
						
				}

				mapIcon.AddClass( 'map-selection-btn__map-icon' );
				mapIcon.AddClass( 'map-selection-btn__map-icon-small' );

				IconUtil.SetupFallbackMapIcon( mapIcon, 'file://{images}/map_icons/map_icon_' + keysList[ i ] );
			}
		}

		if ( numImagesPerMultiIconRow > 1 )
		{	                                                     
			p.FindChildInLayoutFile( 'MapGroupCollectionMultiIcons' ).AddClass( 'map-selection-btn__groupmap-icons-2x' );
		}

		          
		if ( mg.tooltipID )
		{
			p.SetPanelEvent( 'onmouseover', OnMouseOverMapTile.bind( undefined, p.id, mg.tooltipID, keysList ) );
			p.SetPanelEvent( 'onmouseout', OnMouseOutMapTile );
		}

		return p;
	};

	function OnMouseOverMapTile( id, tooltipText, mapsList )
	{
		tooltipText = $.Localize( tooltipText );

		var mapNamesList = [];

		if ( mapsList.length > 1 )
		{
			mapsList.forEach( function( element )
			{
				mapNamesList.push( $.Localize( 'SFUI_Map_' + element ) );
			} );

			var mapGroupsText = mapNamesList.join( ', ' );
			tooltipText = tooltipText + '<br><br>' + mapGroupsText;
		}

		UiToolkitAPI.ShowTextTooltip( id, tooltipText );
	};

	function OnMouseOutMapTile()
	{
		UiToolkitAPI.HideTextTooltip();
	};

	var m_timerMapGroupHandler = null;

	function _GetRotatingMapGroupStatus( gameMode, singleSkirmishMapGroup, mapgroupname )
	{
		m_timerMapGroupHandler = null;
		var strSchedule = CompetitiveMatchAPI.GetRotatingOfficialMapGroupCurrentState( gameMode, mapgroupname );
		var elTimer = m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ].FindChildInLayoutFile( 'PlayMenuMapRotationTimer' );

		if ( elTimer )
		{
			if ( strSchedule )
			{
				var strCurrentMapGroup = strSchedule.split( "+" )[ 0 ];
				var numSecondsRemaining = strSchedule.split( "+" )[ 1 ].split( "=" )[ 0 ];
				var strNextMapGroup = strSchedule.split( "=" )[ 1 ];
				var numWait = FormatText.SecondsToDDHHMMSSWithSymbolSeperator( numSecondsRemaining );

				if ( !numWait )
				{
					elTimer.SetHasClass( 'hidden' );
					return;
				}

				elTimer.RemoveClass( 'hidden' );
				elTimer.SetDialogVariable( 'map-rotate-timer', numWait );

				var mg = GetMGDetails( strNextMapGroup );
				elTimer.SetDialogVariable( 'next-mapname', $.Localize( mg.nameID ) );	

				                               
				                                                                                                 
				var mapGroupPanelID = _GetMapGroupPanelID() + strCurrentMapGroup;
				var mapGroupContainer = m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ].FindChildTraverse( 'MapTile' );

				var mapGroupPanel = mapGroupContainer.FindChildInLayoutFile( mapGroupPanelID );
				if ( !mapGroupPanel )
				{
					mapGroupContainer.RemoveAndDeleteChildren();
					var btnMapGroup = _UpdateOrCreateMapGroupTile( strCurrentMapGroup, mapGroupContainer, null, mapGroupPanelID );
					
					                                                                            
					btnMapGroup.checked = true;
					_UpdateSurvivalAutoFillSquadBtn( m_gameModeSetting );
				}

				m_timerMapGroupHandler = $.Schedule( 1, _GetRotatingMapGroupStatus.bind( undefined, gameMode, singleSkirmishMapGroup, mapgroupname ) );
				                                                                                                                                                                                                     
			}
			else
			{
				elTimer.SetHasClass( 'hidden' );
			}
		}
	};

	function _StartRotatingMapGroupTimer()
	{
		_CancelRotatingMapGroupSchedule();
		
		if ( m_gameModeSetting && m_gameModeSetting === "survival"
			&& m_mapSelectionButtonContainers && m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ]
			&& m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ].Children() )
		{
			var btnSelectedMapGroup = m_mapSelectionButtonContainers[ m_activeMapGroupSelectionPanelID ].Children().filter( entry => entry.GetAttributeString( 'mapname', '' ) !== '' );

			if ( btnSelectedMapGroup[ 0 ] )
			{ 
				var mapSelectedGroupName = btnSelectedMapGroup[ 0 ].GetAttributeString( 'mapname', '' );
				if ( mapSelectedGroupName )
				{
					_GetRotatingMapGroupStatus( m_gameModeSetting, m_singleSkirmishMapGroup, mapSelectedGroupName );
				}
			}
		}
	};

	function _CancelRotatingMapGroupSchedule()
	{
		if ( m_timerMapGroupHandler )
		{
			$.CancelScheduled( m_timerMapGroupHandler );
			                                                                        
			m_timerMapGroupHandler = null;
		}
	};

	function _SetMapGroupModifierLabelElements( mapName, elMapPanel )
	{
		var isUnrankedCompetitive = ( m_gameModeSetting === 'competitive' ) && _IsValveOfficialServer( m_serverSetting ) && ( GameTypesAPI.GetMapGroupAttribute( mapName, 'competitivemod' ) === 'unranked' );
		var isNew = !isUnrankedCompetitive  && ( GameTypesAPI.GetMapGroupAttribute( mapName, 'showtagui' ) === 'new' );

		elMapPanel.FindChildInLayoutFile( 'MapGroupNewTag' ).SetHasClass( 'hidden', !isNew || mapName === "mg_lobby_mapveto");
		                                                                                                                           
		elMapPanel.FindChildInLayoutFile( 'MapGroupNewTagYellowLarge' ).SetHasClass( 'hidden', true );
		elMapPanel.FindChildInLayoutFile( 'MapSelectionTopRowIcons' ).SetHasClass( 'tall', mapName === "mg_lobby_mapveto" );

		elMapPanel.FindChildInLayoutFile( 'MapGroupUnrankedTag' ).SetHasClass( 'hidden', !isUnrankedCompetitive );
	};

	function _ReloadLeaderboardLayoutGivenSettings ( container, lbName, strTitleOverride, strPointsTitle )
	{
		var elFriendLeaderboards = container.FindChildTraverse( "FriendLeaderboards" );
		                                                                                                                                                                                   
		elFriendLeaderboards.SetAttributeString( "type", lbName );
		if ( strPointsTitle )
			elFriendLeaderboards.SetAttributeString( "points-title", strPointsTitle );

		if ( strTitleOverride )
			elFriendLeaderboards.SetAttributeString( "titleoverride", strTitleOverride );

		elFriendLeaderboards.BLoadLayout('file://{resources}/layout/popups/popup_leaderboards.xml', true, false);
		elFriendLeaderboards.AddClass( 'leaderboard_embedded' );
		elFriendLeaderboards.AddClass( 'play_menu_survival' );
		elFriendLeaderboards.RemoveClass( 'Hidden' );
	}

	function _LoadLeaderboardsLayoutForContainer( container )
	{
		if ( ( m_gameModeSetting === "cooperative" ) || ( m_gameModeSetting === "coopmission" ) )
		{
			var questID = GetMatchmakingQuestId();
			if ( questID > 0 )
			{
				var lbName = "official_leaderboard_quest_" + questID;
				var elFriendLeaderboards = container.FindChildTraverse( "FriendLeaderboards" );
				if ( elFriendLeaderboards.GetAttributeString( "type", null ) !== lbName  )
				{
					var strTitle = '#CSGO_official_leaderboard_mission_embedded';
					                                                                         
					_ReloadLeaderboardLayoutGivenSettings( container, lbName, strTitle );
				}

				var elDescriptionLabel = container.FindChildTraverse( "MissionDesc" );
				elDescriptionLabel.text = MissionsAPI.GetQuestDefinitionField( questID, "loc_description" )
				MissionsAPI.ApplyQuestDialogVarsToPanelJS( questID, container );
				var arrGameElements = OperationUtil.GetQuestGameElements( questID );
				if ( arrGameElements.length > 0 )
				{
					var elIconContainer = container.FindChildTraverse( "GameElementIcons" );
					arrGameElements.forEach( function ( info, idx )
					{
						$.CreatePanel( 'Image', elIconContainer, 'GameElementIcon_' + idx, {
							texturewidth: 64,
							textureheight: 64,
							src: info.icon,
							class: 'coop-mission__icon'
						} );
					} );
				}
			}
		}
		else if ( m_gameModeSetting === "survival" )
		{
			                                                                          
		}
	}

	function _UpdateMapGroupButtons( isEnabled, isSearching, isHost )
	{
		var panelID = _LazyCreateMapListPanel();
		
		                                    
		if ( ( m_gameModeSetting === 'competitive' || m_gameModeSetting === 'scrimcomp2v2' ) && _IsPlayingOnValveOfficial() )
		{
			_UpdateWaitTime( _GetMapListForServerTypeAndGameMode(  panelID ) );
		}

		if ( !inDirectChallenge() )
			_SetEnabledStateForMapBtns( m_mapSelectionButtonContainers[ panelID ], isSearching, isHost );

		                    
		m_activeMapGroupSelectionPanelID = panelID;
		_ShowActiveMapSelectionTab( isEnabled );

        _PopulateQuickSelectBar( isSearching, isHost );
    };

	function _SelectMapButtonsFromSettings( settings )
	{
		                                                                 
		var mapsGroups = settings.game.mapgroupname.split( ',' );
		var aListMaps = _GetMapListForServerTypeAndGameMode( m_activeMapGroupSelectionPanelID );
		aListMaps.forEach( function( e )
		{
			                                                                      
			var mapName = e.GetAttributeString( "mapname", "invalid" );
			e.checked = mapsGroups.includes( mapName );
		} );
	};

	function _ShowHideStartSearchBtn( isSearching, isHost )
	{
		let bShow = !isSearching && isHost ? true : false;
		var btnStartSearch = $.GetContextPanel().FindChildInLayoutFile( 'StartMatchBtn' );

		                                                                    
		                                                                                        
		                                                 
		if ( bShow )
		{
			if ( btnStartSearch.BHasClass( 'pressed' ) )
			{
				btnStartSearch.RemoveClass( 'pressed' );
			}

			btnStartSearch.RemoveClass( 'hidden' );
		}
		                                                                                                     
		                                            
		else if ( !btnStartSearch.BHasClass( 'pressed' ) )
		{
			btnStartSearch.AddClass( 'hidden' );
		}

		  
		                                                     
		  
	  	                                                                                                                      
		let numStyleToShow = 0;
		if ( !isSearching && ( m_gameModeSetting === 'competitive' ) &&
			_IsPlayingOnValveOfficial() && ( PartyListAPI.GetCount() >= PartyListAPI.GetPartySessionUiThreshold() ) )
		{
			numStyleToShow = PartyListAPI.GetCount();
			if ( ( numStyleToShow > 5 ) || ( 0 == PartyListAPI.GetPartySessionUiThreshold() ) )
			{	                                                                                                           
				numStyleToShow = 5;
			}
		}
		numStyleToShow = 0;                                    
		for ( let j = 1; j <= 5; ++ j )
		{
	  		                                                                                                             
		}
	  	                                                                                                
	};

	function _ShowCancelSearchButton( isSearching, isHost )
	{
		var btnCancel= $.GetContextPanel().FindChildInLayoutFile( 'PartyCancelBtn' );
		                                                                 
		btnCancel.enabled = ( isSearching && isHost );
	};

	function _UpdatePrimeBtn( isSearching, isHost )
	{
		var elPrimePanel = $( '#PrimeStatusPanel' );
		var elGetPrimeBtn = $( '#id-play-menu-get-prime' );
		var elTooglePrimeBtn = $( '#id-play-menu-toggle-prime' );
		var elPrimeText = $('#PrimeStatusLabelContainer');
		var elTextNA = $('#PrimeStatusLabelNA');
		var isPrime = ( !m_challengeKey && m_serverPrimeSetting ) ? true : false;

		                                                                                  
		if ( !_IsPlayingOnValveOfficial() || !MyPersonaAPI.IsInventoryValid() )
		{
			elPrimePanel.visible = false;
			return;
		}

		var btnText = '';
		var tooltipText = '';
		var LocalPlayerHasPrime = PartyListAPI.GetFriendPrimeEligible( MyPersonaAPI.GetXuid() );

		elPrimePanel.SetHasClass( 'play-menu-prime-logo-bg', LocalPlayerHasPrime );
		elPrimePanel.visible = true;
		elGetPrimeBtn.visible = !LocalPlayerHasPrime;
		elTooglePrimeBtn.visible = LocalPlayerHasPrime;
		elPrimeText.visible = false;

		elTooglePrimeBtn.checked = isPrime ? true : false;

		if (!LocalPlayerHasPrime )
		{
			btnText = "#elevated_status_btn";

			var sPrice = StoreAPI.GetStoreItemSalePrice( InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( 1353, 0 ), 1, '' );
			elGetPrimeBtn.SetDialogVariable( "price", sPrice ? sPrice : '$0' );

			elGetPrimeBtn.SetPanelEvent( 'onactivate', function()
			{
				UiToolkitAPI.HideTextTooltip();
				UiToolkitAPI.ShowCustomLayoutPopup( 'prime_status', 'file://{resources}/layout/popups/popup_prime_status.xml' );
			} );
		}
		else
		{
			                                                
			                                                                               
			if( !SessionUtil.DoesGameModeHavePrimeQueue( m_gameModeSetting ) )
			{
				var elTextNA = $('#PrimeStatusLabelNA');
				elPrimeText.visible = true;

				elTooglePrimeBtn.visible = false;

				if ( SessionUtil.AreLobbyPlayersPrime() )
				{
					tooltipText = '#tooltip_prime_na';
					btnText = "#elevated_status_toggle_non_prime";
					elTextNA.BHasClass( 'disabled', false );
				}
				else
				{
					                                         
					var oPrimeMembers = _GetPrimePartyMembers();
					elTextNA.SetDialogVariableInt( 'prime_members', oPrimeMembers.prime );
					elTextNA.SetDialogVariableInt('total', oPrimeMembers.total );
					tooltipText = '#tooltip_prime-lobby_has_nonprime_player_na';
					btnText = "#SFUI_Elevated_Status_disabled_party_count";
					elTextNA.BHasClass( 'disabled', true );
				}

				elPrimeText.SetPanelEvent( 'onmouseover', function() { UiToolkitAPI.ShowTextTooltip( elTextNA.id, tooltipText ); } );
				elPrimeText.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );

				elTextNA.text = $.Localize( btnText, elTextNA );
			}
			else
			{
				elTooglePrimeBtn.visible = true;
				
				if ( SessionUtil.AreLobbyPlayersPrime() )
				{
					                                                                                       
					tooltipText = '#tooltip_prime_only_3'
					elTooglePrimeBtn.enabled = isHost && !isSearching && !inDirectChallenge();

					                                                                                                                   
					btnText = "#elevated_status_toggle_prime_only";
				}
				else{
					                                         
					var oPrimeMembers = _GetPrimePartyMembers();
					elTooglePrimeBtn.SetDialogVariableInt( 'prime_members', oPrimeMembers.prime );
					elTooglePrimeBtn.SetDialogVariableInt('total', oPrimeMembers.total );
					elTooglePrimeBtn.enabled = false;

					tooltipText = '#tooltip_prime-lobby_has_nonprime_player';
					btnText = "#SFUI_Elevated_Status_disabled_party_count";
				}

				elTooglePrimeBtn.SetPanelEvent( 'onmouseover', function() { UiToolkitAPI.ShowTextTooltip( elTooglePrimeBtn.id, tooltipText ); } );
				elTooglePrimeBtn.SetPanelEvent( 'onmouseout', function() { UiToolkitAPI.HideTextTooltip(); } );

				elTooglePrimeBtn.text = $.Localize( btnText, elTooglePrimeBtn );
			}
		}
	};

	function _GetPrimePartyMembers()
	{
		var count = PartyListAPI.GetCount();
		var primeMembers = 0;

		for( var i = 0; i < count; i++ )
		{
			var xuid = PartyListAPI.GetXuidByIndex( i );
			if( PartyListAPI.GetFriendPrimeEligible( xuid ) )
			{
				primeMembers++;
			}
		}

		return { prime: primeMembers, total: count };
	}

	function _IsPrimeChecked()
	{
		return $( '#id-play-menu-toggle-prime' ).checked;
	};

	function _UpdatePermissionBtnText( settings, isEnabled )
	{
		var elBtn = $( '#PermissionsSettings' );

		elBtn.text = "#permissions_open_party";
		elBtn.checked = ( settings.system.access === 'public' );

		                                           
		elBtn.enabled = isEnabled;
	};

	function GetMatchmakingQuestId()
	{
		var settings = LobbyAPI.GetSessionSettings();
		if ( settings && settings.game && settings.game.questid )
			return parseInt( settings.game.questid );
		else
			return 0;
	}

	function _UpdateLeaderboardBtn( gameMode, isOfficalMatchmaking )
	{
		var elLeaderboardButton = $( '#PlayMenulLeaderboards' );
		
		          
		                                                             
		 
			                                   
			
			                       
			 
				                                             
					   
					                                                          
					                                                                                
					                                                                 
					                                  
					                                             
					      
				  
			  

			                                                               
		 
		                                                                                                       
		 
			                                   
			                                                           
			 
				                                             
					   
					                                                          
					                                                             
					                                                                   
					                                  
					                                               
					          
				  
			    
		 
		    
		          
		{ 
			elLeaderboardButton.visible = false;
		}
	};

	function _UpdateSurvivalAutoFillSquadBtn( gameMode )
	{
		var elBtn = $( '#SurvivalAutoSquadToggle' );

		if ( !elBtn )
		{
			return;
		}

		if ( gameMode === 'survival' && _IsPlayingOnValveOfficial() && ( PartyListAPI.GetCount() <= 1 ) )
		{
			elBtn.visible = true;
			var bAutoFill = !( GameInterfaceAPI.GetSettingString( 'ui_playsettings_survival_solo' ) === '1' );
			elBtn.checked = bAutoFill;
			elBtn.enabled = !_IsSearching();

			function _OnActivate()
			{
				var bAutoFill = !( GameInterfaceAPI.GetSettingString( 'ui_playsettings_survival_solo' ) === '1' );
				GameInterfaceAPI.SetSettingString( 'ui_playsettings_survival_solo', bAutoFill ? '1' : '0' );
				_UpdateSurvivalAutoFillSquadBtn( 'survival' );
			};

			elBtn.SetPanelEvent( 'onactivate', _OnActivate );
		}
		else
		{
			elBtn.visible = false;
		}

		if ( gameMode === 'survival' )
		{
			var lbType = ( ( elBtn.visible && !elBtn.checked ) ? 'solo' : 'squads' );
			var lbName = "official_leaderboard_survival_" + lbType;
			var container = elBtn.GetParent().GetParent();
			var elFriendLeaderboards = container.FindChildTraverse( "FriendLeaderboards" );
			var sPreviousType = elFriendLeaderboards.GetAttributeString( "type", null );
			if ( sPreviousType !== lbName  )
			{
				                                                                                                        
				_ReloadLeaderboardLayoutGivenSettings( container, lbName, "#CSGO_official_leaderboard_survival_" + lbType, "#Cstrike_TitlesTXT_WINS" );
			}
		}
	};

	function _SetEnabledStateForMapBtns( elMapList, isSearching, isHost )
	{
		elMapList.SetHasClass( 'is-client', ( isSearching || !isHost ) );

		var childrenList = _GetMapListForServerTypeAndGameMode();

		var bEnable = !isSearching && isHost;

		childrenList.forEach(element => {
			if ( !element.id.startsWith( "FriendLeaderboards" ) )
			element.enabled = bEnable; 
		});
	};

	function _UpdateWaitTime( elMapList )
	{
		var childrenList = elMapList;

		for ( var i = 0; i < childrenList.length; i++ )
		{
			var elWaitTime = childrenList[ i ].FindChildTraverse( 'MapGroupWaitTime' );
			var mapName = childrenList[ i ].GetAttributeString( "mapname", "invalid" );

			if ( mapName === 'invalid' )
			{
				continue;
			}

			var seconds = LobbyAPI.GetMapWaitTimeInSeconds( m_gameModeSetting, mapName );
			var numWait = FormatText.SecondsToDDHHMMSSWithSymbolSeperator( seconds );

			if ( numWait )
			{
				elWaitTime.SetDialogVariable( "time", numWait );
				elWaitTime.FindChild( 'MapGroupWaitTimeLabel' ).text = $.Localize( '#matchmaking_expected_wait_time', elWaitTime );
				elWaitTime.RemoveClass( 'hidden' );
			}
			else
			{
				elWaitTime.AddClass( 'hidden' );
			}
		}
	};

	function _UpdatePlayDropDown()
	{
		if ( m_activeMapGroupSelectionPanelID === k_workshopPanelId )
		{
			$( '#PlayTopNavDropdown' ).SetSelected( 'PlayWorkshop' );
		}
		else
		{
			$( '#PlayTopNavDropdown' ).SetSelected( 'Play-' + m_serverSetting );
		}
	};

	function _IsValveOfficialServer( serverType )
	{
		return serverType === "official" ? true : false
	}

	function _IsPlayingOnValveOfficial()
	{
		return _IsValveOfficialServer( m_serverSetting );
	};

	function _IsSearching()
	{
		var searchingStatus = LobbyAPI.GetMatchmakingStatusString();
		return searchingStatus !== '' && searchingStatus !== undefined ? true : false;
	};

	                                                         
	function _GetSelectedMapsForServerTypeAndGameMode( serverType, gameMode, bDontToggleMaps = false )
	{
		var isPlayingOnValveOfficial = _IsValveOfficialServer( serverType );
		                                                                         
		                                                                        
		var aListMapPanels = _GetMapListForServerTypeAndGameMode();

		                                                                                                             
		if ( !_CheckContainerHasAnyChildChecked( aListMapPanels ) )
		{
			                                                                      
			var preferencesMapsForThisMode = GameInterfaceAPI.GetSettingString( 'ui_playsettings_maps_' + serverType + '_' + gameMode );

			                                          
			if ( !preferencesMapsForThisMode )
				preferencesMapsForThisMode = '';

			var savedMapIds = preferencesMapsForThisMode.split( ',' );
			savedMapIds.forEach( function( strMapNameIndividual )
			{
				var mapsWithThisName = aListMapPanels.filter( function( map )
				{
					var mapName = map.GetAttributeString( "mapname", "invalid" );
					return mapName === strMapNameIndividual;
				} );
				if ( mapsWithThisName.length > 0 )
                {
                    if ( !bDontToggleMaps )
						mapsWithThisName[ 0 ].checked = true;
				}
			} );

			if ( aListMapPanels.length > 0 && !_CheckContainerHasAnyChildChecked( aListMapPanels ) )
            {
                if ( !bDontToggleMaps )
					aListMapPanels[ 0 ].checked = true;
			}
		}

		                                                                   
		if ( serverType === 'official' && gameMode === 'survival' )
		{	                                                    
			return GameInterfaceAPI.GetSettingString( 'ui_playsettings_maps_' + serverType + '_' + gameMode );
		}

		var selectedMaps = aListMapPanels.filter( function( e )
		{
			                                                         
			return e.checked;
		} ).reduce( function( accumulator, e )
		{
			                                              
			var mapName = e.GetAttributeString( "mapname", "invalid" );
			return ( accumulator ) ? ( accumulator + "," + mapName ) : mapName;
		}, '' );

		return selectedMaps;
	};

	function _GetMapListForServerTypeAndGameMode( mapGroupOverride )
	{
		var mapGroupPanelID = !mapGroupOverride ? _LazyCreateMapListPanel( ) : mapGroupOverride;
		var elParent = m_mapSelectionButtonContainers[ mapGroupPanelID ];

		if ( m_gameModeSetting === 'competitive' && elParent.GetAttributeString( 'hassections', '') )
		{
			var aListMapPanels = [];
			elParent.Children().forEach( function( section )
			{
				section.Children().forEach( function( tile )
				{
					if ( tile.id != 'play-maps-section-header-container' )
					{
						aListMapPanels.push( tile );
					}
				} );
			} );

			return aListMapPanels;
		}
		else if ( _IsPlayingOnValveOfficial() && ( m_gameModeSetting === 'survival'
			|| m_gameModeSetting === 'cooperative' 
			|| m_gameModeSetting === 'coopmission' ) )
		{
			let elMapTile = elParent.FindChildTraverse( "MapTile" );
			if ( elMapTile )
				return elMapTile.Children();
			else
				return elParent.Children();
		}
		else
		{
			return elParent.Children();
		}
	};

	function _GetSelectedWorkshopMapButtons()
	{
		var mapGroupPanelID = _LazyCreateWorkshopTab();
		var mapContainer = m_mapSelectionButtonContainers[mapGroupPanelID];
		var children = mapContainer.Children();

		if ( children.length == 0 || !children[0].group )
		{
			                   
			return [];
		}

		                                                                                                             
		if ( !_CheckContainerHasAnyChildChecked( children ) )
		{
			var preferencesMapsForThisMode = GameInterfaceAPI.GetSettingString( 'ui_playsettings_maps_workshop' );

			                                          
			if ( !preferencesMapsForThisMode )
				preferencesMapsForThisMode = '';

			var savedMapIds = preferencesMapsForThisMode.split( ',' );
			savedMapIds.forEach( function ( strMapNameIndividual ) {
				var mapsWithThisName = children.filter( function ( map ) {
					var mapName = map.GetAttributeString( "mapname", "invalid" );
					return mapName === strMapNameIndividual;
				} );
				if ( mapsWithThisName.length > 0 )
				{
					mapsWithThisName[0].checked = true;
				}
			} );

			if ( !_CheckContainerHasAnyChildChecked( children ) && children.length > 0 )
			{
				children[0].checked = true;
			}
		}

		var selectedMaps = children.filter( function ( e ) {
			                                                         
			return e.checked;
		} );

		return Array.from(selectedMaps);
	};

	function _GetSelectedWorkshopMap()
	{
		var mapButtons = _GetSelectedWorkshopMapButtons();

		var selectedMaps = mapButtons.reduce( function ( accumulator, e ) {
			                                              
			var mapName = e.GetAttributeString( "mapname", "invalid" );
			return ( accumulator ) ? ( accumulator + "," + mapName ) : mapName;
		}, '' );

		return selectedMaps;
	};

	function _GetSingleSkirmishIdFromMapGroup ( mapGroup )
	{
		return mapGroup.replace( 'mg_skirmish_', '' );
	};

	function _GetSingleSkirmishMapGroupFromId ( skirmishId )
	{
		return 'mg_skirmish_' + skirmishId;
	};

	function _GetSingleSkirmishIdFromSingleSkirmishString ( entry )
	{
		return entry.replace( 'skirmish_', '' );
	};

	function _GetSingleSkirmishMapGroupFromSingleSkirmishString ( entry )
	{
		return _GetSingleSkirmishMapGroupFromId( _GetSingleSkirmishIdFromSingleSkirmishString( entry ) );
	};

	function _IsSingleSkirmishString ( entry )
	{
		return entry.startsWith( 'skirmish_' );
	};

	                                                                                                    
	                                                    
	                                                                                                    
	function _CheckContainerHasAnyChildChecked( aMapList )
	{
		if ( aMapList.length < 1 )
			return false;

		return aMapList.filter( function( map )
		{
			return map.checked;
		} ).length > 0;
	};

	                                                                                                    
	                                                    
	                                                                                                    
	function _ValidateSessionSettings()
	{
		if ( m_isWorkshop )
		{
			                                     
			m_serverSetting = "listen";
		}

		if ( !_IsGameModeAvailable( m_serverSetting, m_gameModeSetting ) )
		{
			                                                                
			m_gameModeSetting = GameInterfaceAPI.GetSettingString( "ui_playsettings_mode_" + m_serverSetting );
			m_singleSkirmishMapGroup = null;

			if ( _IsSingleSkirmishString( m_gameModeSetting ) )
			{
				m_singleSkirmishMapGroup = _GetSingleSkirmishMapGroupFromSingleSkirmishString( m_gameModeSetting );
				m_gameModeSetting = 'skirmish';
			}
		
			if ( !_IsGameModeAvailable( m_serverSetting, m_gameModeSetting ) )
			{
				                                                                                                                                            
				  
				                                                          
				                                                                             
				  
				                                   
				  
				                                                                      
				var modes = [
					"deathmatch", "casual",
					"survival", "skirmish",
					"scrimcomp2v2", "competitive",
					];
				
				for ( var i = 0; i < modes.length; i++ )
				{
					if ( _IsGameModeAvailable( m_serverSetting, modes[ i ] ) )
					{
						m_gameModeSetting = modes[ i ];
						m_singleSkirmishMapGroup = null;
						break;
					}
				}
			}
		}

		                                                      
		if ( !m_gameModeFlags[ m_serverSetting + m_gameModeSetting ] )
			_LoadGameModeFlagsFromSettings();
		
		                                                     
		if ( GameModeFlags.DoesModeUseFlags( m_gameModeSetting ) )
		{
			if ( !GameModeFlags.AreFlagsValid( m_gameModeSetting, m_gameModeFlags[ m_serverSetting + m_gameModeSetting ] ) )
			{
				_setAndSaveGameModeFlags( 0 );
				                                                                                                                     

			}
		}
	};

	function _LoadGameModeFlagsFromSettings ()
	{
		m_gameModeFlags[ m_serverSetting + m_gameModeSetting ] = parseInt( GameInterfaceAPI.GetSettingString( 'ui_playsettings_flags_' + m_serverSetting + '_' + m_gameModeSetting ) );
	}

	                                                                                                    
	                                   
	                                                                                                    
	function _ApplySessionSettings()
	{
		if ( m_gameModeSetting === 'scrimcomp2v2' )
		{	                                                                                     
			MyPersonaAPI.HintLoadPipRanks( 'wingman' );
		}
		else if ( m_gameModeSetting === 'survival' )
		{	                                                                                     
			MyPersonaAPI.HintLoadPipRanks( 'dangerzone' );
		}

		if ( !LobbyAPI.BIsHost() )
		{
			return;
		}

		                                                     
		_ValidateSessionSettings();

		                                                                                 
		var serverType = m_serverSetting;
		var gameMode = m_gameModeSetting;

		var gameModeFlags = m_gameModeFlags[ m_serverSetting + m_gameModeSetting ] ? m_gameModeFlags[ m_serverSetting + m_gameModeSetting ] : 0;
		var primePreference = m_serverPrimeSetting;

		var selectedMaps;

		if ( m_isWorkshop )
			selectedMaps = _GetSelectedWorkshopMap();
		else if ( inDirectChallenge() )
		{
			selectedMaps = 'mg_lobby_mapveto';	                         
			gameModeFlags = 16;					                   
			primePreference = 0;				                                           
		}
		else if ( m_singleSkirmishMapGroup )
		{
			selectedMaps = m_singleSkirmishMapGroup;
		}
		else
		{
			selectedMaps = _GetSelectedMapsForServerTypeAndGameMode( serverType, gameMode );
		}	

		var settings = {
			update: {
				Options: {
					action: "custommatch",
					server: serverType,
					challengekey: _GetDirectChallengeKey(),
				},
				Game: {
					                                                                  
					mode: gameMode,
					type: GetGameType( gameMode ),
					mapgroupname: selectedMaps,
					gamemodeflags: gameModeFlags,
					prime: primePreference,
				}
			}
		};

		if ( !inDirectChallenge() )
		{                                                                     
			settings.delete = {
				Options: {
					challengekey: 1
				}
			}
		}

		                                                                                                                                      
		                                                                                                                                      
		                                                                                                                                
		                                                                                                                                      
		                                                                                       
		if ( selectedMaps.startsWith( "random_" ) )
		{
			var arrMapGroups = _GetAvailableMapGroups( gameMode, false );
			var idx = 1 + Math.floor( ( Math.random() * ( arrMapGroups.length - 1 ) ) );
			settings.update.Game.map = arrMapGroups[ idx ].substring( 3 );
		}

		                       
		                                                  
		if ( m_isWorkshop )
		{
			GameInterfaceAPI.SetSettingString( 'ui_playsettings_maps_workshop', selectedMaps );
		}
		else
		{
			var singleSkirmishSuffix = '';
			if ( m_singleSkirmishMapGroup )
			{
				singleSkirmishSuffix = '_' + _GetSingleSkirmishIdFromMapGroup( m_singleSkirmishMapGroup );
			}
			GameInterfaceAPI.SetSettingString('ui_playsettings_mode_' + serverType, m_gameModeSetting + singleSkirmishSuffix );

			if ( !inDirectChallenge() )
			{	                                                                                                                  
				GameInterfaceAPI.SetSettingString('ui_playsettings_maps_' + serverType + '_' + m_gameModeSetting + singleSkirmishSuffix, selectedMaps);
			}
		}

		                                                                  
		                                                                                          
		LobbyAPI.UpdateSessionSettings( settings );
	};

	function ApplyPrimeSetting()
	{
		                                       
		   
			var newvalue = m_serverPrimeSetting ? 0 : 1;
			var settings = { update: { Game: {}} };
			settings.update.Game.prime = newvalue;                                         
			                                                 
			LobbyAPI.UpdateSessionSettings( settings );
			GameInterfaceAPI.SetSettingString( 'ui_playsettings_prime', '' + newvalue );
		   
	}

	                                                                                                    
	                                
	                                                                                                    
	function _SessionSettingsUpdate( sessionState ) 
	{
		                                                                
		if ( sessionState === "ready" )
		{
			_Init();                                                                  
		}
		                                                      
		else if ( sessionState === "updated" )
		{
			var settings = LobbyAPI.GetSessionSettings();

			_SyncDialogsFromSessionSettings( settings );
		}
		else if ( sessionState === "closed" )
		{
			                                         
			          
			$.DispatchEvent( 'HideContentPanel' );
		}
	};

	function _ReadyForDisplay()
	{
		_StartRotatingMapGroupTimer();
	};

	function _UnreadyForDisplay()
	{
		_CancelRotatingMapGroupSchedule();
	};

	function _OnHideMainMenu()
	{
		$( '#MapSelectionList' ).FindChildrenWithClassTraverse( "map-selection-btn__carousel" ).forEach( function( entry )
		{
			entry.SetAutoScrollEnabled( false );
		} );
	};

	function _OnShowMainMenu()
	{	
		$( '#MapSelectionList' ).FindChildrenWithClassTraverse( "map-selection-btn__carousel" ).forEach( function( entry )
		{
			entry.SetAutoScrollEnabled( true );
		} );
	};

	function _GetPlayType()
	{
		var elDropDownEntry = $( '#PlayTopNavDropdown' ).GetSelected();
		var playType = elDropDownEntry.GetAttributeString( 'data-type', '(not_found)' );
		return playType;
	};

	function _InitializeWorkshopTags ( panel, mapInfo )
	{
		var mapTags = mapInfo.tags ? mapInfo.tags.split( "," ) : [];

		                          
		var rawModes = [];
		var modes = [];
		var tags = [];

		for ( var i = 0; i < mapTags.length; ++i )
		{
			                               
			                                                  
			var modeTag = mapTags[i].toLowerCase().split( ' ' ).join( '' ).split( '-' ).join( '' );
			if ( modeTag in k_workshopModes )
			{
				var gameTypes = k_workshopModes[modeTag].split(',');
				for( var iType = 0; iType < gameTypes.length; ++iType )
				{
					if( !rawModes.includes( gameTypes[iType] ) )
						rawModes.push( gameTypes[iType] );
				}

				modes.push( $.Localize( '#CSGO_Workshop_Mode_' + modeTag ) );
			}
			else
			{
				tags.push( $.HTMLEscape( mapTags[i] ) );
			}
		}

		                   
		var tooltip = mapInfo.desc ? $.HTMLEscape( mapInfo.desc, true ) : '';

		if ( modes.length > 0 )
		{
			if ( tooltip )
				tooltip += '<br><br>';

			tooltip += $.Localize( "#CSGO_Workshop_Modes" );
			tooltip += ' ';
			tooltip += modes.join(', ');
		}

		if ( tags.length > 0 )
		{
			if ( tooltip )
				tooltip += '<br><br>';

			tooltip += $.Localize( "#CSGO_Workshop_Tags" );
			tooltip += ' ';
			tooltip += tags.join( ', ' );
		}

		panel.SetAttributeString( 'data-tooltip', tooltip );                               
		panel.SetAttributeString( 'data-workshop-modes', rawModes.join( ',' ) );
	}

	function _ShowWorkshopMapInfoTooltip ( panel )
	{
		var text = panel.GetAttributeString( 'data-tooltip', '' );

		if ( text )
			UiToolkitAPI.ShowTextTooltip( panel.id, text );
	};

	function _HideWorkshopMapInfoTooltip ()
	{
		UiToolkitAPI.HideTextTooltip();
	};


	function _LazyCreateWorkshopTab()
	{
		var panelId = k_workshopPanelId;

		if ( panelId in m_mapSelectionButtonContainers )
			return panelId;

		                      
		var container = $.CreatePanel( "Panel", $( '#MapSelectionList' ), panelId, {
			class: 'map-selection-list map-selection-list--inner hidden'
		} );

		container.AddClass( 'map-selection-list--workshop' );

		                                                                                 
		m_mapSelectionButtonContainers[ panelId ] = container;

		var numMaps = WorkshopAPI.GetNumSubscribedMaps();
		for ( var idxMap = 0; idxMap < numMaps; ++idxMap )
		{
			var strMapId = WorkshopAPI.GetSubscribedMapID( idxMap );
			var mapInfo = WorkshopAPI.GetWorkshopMapInfo( strMapId );
			if ( !mapInfo || !mapInfo.mapgroup )
				continue;

			var p = $.CreatePanel( 'RadioButton', container, panelId + '_' + idxMap );
			p.BLoadLayoutSnippet( 'MapGroupSelection' );
			p.group = 'radiogroup_' + panelId;

			if ( !( mapInfo.imageUrl ) )
				mapInfo.imageUrl = 'file://{images}/map_icons/screenshots/360p/random.png';

			p.SetAttributeString( 'mapname', mapInfo.mapgroup );
			p.SetPanelEvent( 'onactivate', _OnActivateMapOrMapGroupButton.bind( this, p ) );
			p.FindChildInLayoutFile( 'ActiveGroupIcon' ).visible = false;
			p.FindChildInLayoutFile( 'MapGroupName' ).text = mapInfo.name;

			var mapImage = $.CreatePanel( 'Panel', p.FindChildInLayoutFile( 'MapGroupImagesCarousel' ), 'MapSelectionScreenshot0' );
			mapImage.AddClass( 'map-selection-btn__screenshot' );
			mapImage.style.backgroundImage = 'url("' + mapInfo.imageUrl + '")';
			mapImage.style.backgroundPosition = '50% 0%';
			mapImage.style.backgroundSize = 'auto 100%';

			_InitializeWorkshopTags( p, mapInfo );

			p.SetPanelEvent( 'onmouseover', _ShowWorkshopMapInfoTooltip.bind( null, p ) );
			p.SetPanelEvent( 'onmouseout', _HideWorkshopMapInfoTooltip.bind( null ) );
		}

		if ( numMaps == 0 )
		{
			var p = $.CreatePanel( 'Panel', container, undefined );
			p.BLoadLayoutSnippet( 'NoWorkshopMaps' );
		}

		                                        
		_UpdateWorkshopMapFilter();

		return panelId;
	};

	function _SwitchToWorkshopTab( isEnabled )
	{
		var panelId = _LazyCreateWorkshopTab();
		m_activeMapGroupSelectionPanelID = panelId;
		_ShowActiveMapSelectionTab( isEnabled );
	};


	function _UpdateGameModeFlagsBtn ( )
	{
		var elBtn = $.GetContextPanel().FindChildTraverse( 'GameModeFlagsBtn' );
		var elTT = $.GetContextPanel().FindChildTraverse( 'id-tt_gamemodeflags' );

		if ( !GameModeFlags.DoesModeUseFlags( m_gameModeSetting ) || m_isWorkshop )
		{
			elTT.visible = false;
			return;
		}

		elTT.visible = true;

		               
		$.GetContextPanel().SetDialogVariable( 'gamemodeflag_setting', $.Localize( "#play_setting_gamemodeflags_" + m_gameModeSetting + '_' + m_gameModeFlags[ m_serverSetting + m_gameModeSetting ] ) );

		                        
		elBtn.enabled = !inDirectChallenge() && !_IsSearching() && LobbyAPI.BIsHost();

		                  
		elTT.tooltip = $.Localize( 'play_settings_' + m_gameModeSetting + '_tooltip')

		               
		var flags = m_gameModeFlags[ m_serverSetting + m_gameModeSetting ];
		                                                                                                              
		
		                                                              
	}

	function _setAndSaveGameModeFlags ( value )
	{
		                                             
		m_gameModeFlags[ m_serverSetting + m_gameModeSetting ] = value;

		_UpdateGameModeFlagsBtn();

		if ( !inDirectChallenge() )
			GameInterfaceAPI.SetSettingString( 'ui_playsettings_flags_' + m_serverSetting + '_' + m_gameModeSetting, m_gameModeFlags[ m_serverSetting + m_gameModeSetting ].toString() );
	}

	function _OnGameModeFlagsBtnClicked ( resumeMatchmakingHandle = '' )
	{
		function _Callback ( value, resumeMatchmakingHandle = '' )
		{
			_setAndSaveGameModeFlags( parseInt(value) );
			_ApplySessionSettings();

			if ( resumeMatchmakingHandle )
			{
				UiToolkitAPI.InvokeJSCallback( parseInt(resumeMatchmakingHandle) );
				UiToolkitAPI.UnregisterJSCallback( parseInt(resumeMatchmakingHandle) );
			}
		}

		var callback = UiToolkitAPI.RegisterJSCallback( _Callback );

		UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_play_gamemodeflags.xml',
			'&callback=' + callback +
			'&searchfn=' + resumeMatchmakingHandle +
			'&textToken=' + '#play_settings_' + m_gameModeSetting + '_dialog' +
			GameModeFlags.GetOptionsString( m_gameModeSetting ) +
			'&currentvalue=' + m_gameModeFlags[ m_serverSetting + m_gameModeSetting ],
		);
	}

	function _PlayTopNavDropdownChanged()
	{
		var playType = _GetPlayType();

                                                                                      
		_TurnOffDirectChallenge();

		if ( playType === 'listen' || playType === 'training' || playType === 'workshop' )
		{
			                                       
		}
		else
		{
			var restrictions = LicenseUtil.GetCurrentLicenseRestrictions();
			if ( restrictions !== false )
			{
				LicenseUtil.ShowLicenseRestrictions( restrictions );
				                                                                       
				_UpdatePlayDropDown();
				return false;
			}
		}

		if ( playType === 'official' || playType === 'listen' )
		{
			m_isWorkshop = false;
			m_serverSetting = playType;
			_ApplySessionSettings();
			return;
		}
		else if ( playType === 'training' )
		{
			UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle( 'Training',
				'#play_training_confirm',
				'',
				'#OK',
				function()
				{
					LobbyAPI.LaunchTrainingMap();
				},
				'#Cancel_Button',
				function()
				{
				},
				'dim'
			);
		}
		else if ( playType === 'workshop' )
		{
			_SetPlayDropdownToWorkshop();
			return;
		}
		else if ( playType === 'community' )
		{
			if ( '0' === GameInterfaceAPI.GetSettingString( 'player_nevershow_communityservermessage' ) )
			{
				UiToolkitAPI.ShowCustomLayoutPopup( 'server_browser_popup', 'file://{resources}/layout/popups/popup_serverbrowser.xml' );
			}
			else
			{
				if ( m_bPerfectWorld )
				{
					SteamOverlayAPI.OpenURL( 'https://csgo.wanmei.com/communityserver' );
				}
				else
				{
					GameInterfaceAPI.ConsoleCommand( "gamemenucommand openserverbrowser" );
				}
			}
		}

		_UpdateGameModeFlagsBtn();

		                                                   
		_UpdatePlayDropDown();
	};

	function _UpdateBotDifficultyButton()
	{
		var playType = _GetPlayType();

		var elDropDown = $( '#BotDifficultyDropdown' );

		var bShowBotDifficultyButton = ( playType === 'listen' || playType === 'workshop' );
		elDropDown.SetHasClass( "hidden", !bShowBotDifficultyButton );

		                         
		var botDiff = GameInterfaceAPI.GetSettingString( 'player_botdifflast_s' );
		GameTypesAPI.SetCustomBotDifficulty( botDiff );
		elDropDown.SetSelected( botDiff );
	};

	function _BotDifficultyChanged()
	{
		var elDropDownEntry = $( '#BotDifficultyDropdown' ).GetSelected();
		var botDiff = elDropDownEntry.id;

		GameTypesAPI.SetCustomBotDifficulty( botDiff );

		                                  
		GameInterfaceAPI.SetSettingString( 'player_botdifflast_s', botDiff )
	};

	function _DisplayWorkshopModePopup()
	{
		                         
		var elSelectedMaps = _GetSelectedWorkshopMapButtons();
		var modes = [];

		for ( var iMap = 0; iMap < elSelectedMaps.length; ++iMap )
		{
			var mapModes = elSelectedMaps[ iMap ].GetAttributeString( 'data-workshop-modes', '' ).split( ',' );

			                                                          
			if ( iMap == 0 )
				modes = mapModes;
			else
				modes = modes.filter( function( mode ) { return mapModes.includes( mode ); } );
		}

		var strModes = modes.join( ',' );
		UiToolkitAPI.ShowCustomLayoutPopupParameters( 'workshop_map_mode', 'file://{resources}/layout/popups/popup_workshop_mode_select.xml', 'workshop-modes=' + $.UrlEncode( strModes ) );
	};

	function _UpdateWorkshopMapFilter()
	{
		var filter = $.HTMLEscape( $( '#WorkshopSearchTextEntry' ).text, true ).toLowerCase();
		var container = m_mapSelectionButtonContainers[ k_workshopPanelId ];

		if ( !container )
			return;                       

		var children = container.Children();

		for ( var i = 0; i < children.length; ++i )
		{
			var panel = children[ i ];

			                                                                        
			var mapname = panel.GetAttributeString( 'mapname', '' );
			if ( mapname === '' )
				continue;

			                               
			if ( filter === '' ) 
			{
				panel.visible = true;
				continue;
			}

			                                                                         
			if ( mapname.toLowerCase().includes( filter ) )
			{
				panel.visible = true;
				continue;
			}

			                                                                
			var modes = panel.GetAttributeString( 'data-workshop-modes', '' );
			if ( modes.toLowerCase().includes( filter ) )
			{
				panel.visible = true;
				continue;
			}

			                                                                                           
			                                             
			var tooltip = panel.GetAttributeString( 'data-tooltip', '' );
			if ( tooltip.toLowerCase().includes( filter ) )
			{
				panel.visible = true;
				continue;
			}

			                                                                                  
			                                                             
			var mapname = panel.FindChildTraverse( 'MapGroupName' );
			if ( mapname && mapname.text && mapname.text.toLowerCase().includes( filter ) )
			{
				panel.visible = true;
				continue;
			}

			panel.visible = false;
		}
	};

	function _SetPlayDropdownToWorkshop()
	{
		                                           
		m_serverSetting = 'listen';
		m_isWorkshop = true;
		if ( _GetSelectedWorkshopMap() )
		{
			_ApplySessionSettings();
		}
		else
		{
			                                                                                             
			_SwitchToWorkshopTab( true );
		}

		$.GetContextPanel().SwitchClass( "gamemode", 'workshop' );
		$.GetContextPanel().SwitchClass( "serversetting", 'workshop' );

	};

	function _WorkshopSubscriptionsChanged()
	{
		var currentMap = '';
		var panel = m_mapSelectionButtonContainers[k_workshopPanelId];
		if ( panel )
		{
			currentMap = _GetSelectedWorkshopMap();
			panel.DeleteAsync( 0.0 );

			                  
			delete m_mapSelectionButtonContainers[k_workshopPanelId];
		}

		if ( m_activeMapGroupSelectionPanelID != k_workshopPanelId )
		{
			                                                                       
			return;
		}

		if ( !LobbyAPI.IsSessionActive() )
		{
			                                                                                                                    
			                                           

			                                                                                                            
			                                                              
			m_activeMapGroupSelectionPanelID = null;
			return;
		}

		                                                
		_SyncDialogsFromSessionSettings( LobbyAPI.GetSessionSettings() );

		                                                                                                                                      
		if ( LobbyAPI.BIsHost() )
		{
			_ApplySessionSettings();

			                                                                                                                          
			_SetPlayDropdownToWorkshop();
		}
	}

	function _InventoryUpdated()
	{
		_UpdatePrimeBtn( _IsSearching(), LobbyAPI.BIsHost());
	}


	return {
		Init						: _Init,
		ClansInfoUpdated			: _ClansInfoUpdated,
		SessionSettingsUpdate		: _SessionSettingsUpdate,
		ReadyForDisplay				: _ReadyForDisplay,
		UnreadyForDisplay 			: _UnreadyForDisplay,
		OnHideMainMenu				: _OnHideMainMenu,
		OnShowMainMenu				: _OnShowMainMenu,
		PlayTopNavDropdownChanged	: _PlayTopNavDropdownChanged,
		BotDifficultyChanged		: _BotDifficultyChanged,
		WorkshopSubscriptionsChanged: _WorkshopSubscriptionsChanged,
		InventoryUpdated			: _InventoryUpdated,
		SaveMapSelectionToCustomPreset: _SaveMapSelectionToCustomPreset,
		OnMapQuickSelect			: _OnMapQuickSelect,
		OnGameModeFlagsBtnClicked	: _OnGameModeFlagsBtnClicked,
		OnDirectChallengeBtn		: _OnDirectChallengeBtn,
		OnDirectChallengeRandom		: _OnDirectChallengeRandom,
		OnDirectChallengeCopy		: _OnDirectChallengeCopy,
		OnDirectChallengeEdit		: _OnDirectChallengeEdit,
		OnClanChallengeKeySelected	: _OnClanChallengeKeySelected,
		OnChooseClanKeyBtn			: _OnChooseClanKeyBtn,
		OnPlayerNameChangedUpdate	: _OnPlayerNameChangedUpdate,
		OnPrivateQueuesUpdate		: _OnPrivateQueuesUpdate,
	};

} )();

                                                                                                    
                                           
                                                                                                    
( function()
{
	PlayMenu.Init();
	$.RegisterEventHandler( "ReadyForDisplay", $.GetContextPanel(), PlayMenu.ReadyForDisplay );
	$.RegisterEventHandler( "UnreadyForDisplay", $.GetContextPanel(), PlayMenu.UnreadyForDisplay );
	$.RegisterForUnhandledEvent( "PanoramaComponent_Lobby_MatchmakingSessionUpdate", PlayMenu.SessionSettingsUpdate );
	$.RegisterForUnhandledEvent( "CSGOHideMainMenu", PlayMenu.OnHideMainMenu );
	$.RegisterForUnhandledEvent( "CSGOHidePauseMenu", PlayMenu.OnHideMainMenu );
	$.RegisterForUnhandledEvent( "CSGOShowMainMenu", PlayMenu.OnShowMainMenu );
	$.RegisterForUnhandledEvent( "CSGOShowPauseMenu", PlayMenu.OnShowMainMenu );
	$.RegisterForUnhandledEvent( "CSGOWorkshopSubscriptionsChanged", PlayMenu.WorkshopSubscriptionsChanged );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_ClansInfoUpdated', PlayMenu.ClansInfoUpdated );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', PlayMenu.InventoryUpdated );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_FriendsList_NameChanged', PlayMenu.OnPlayerNameChangedUpdate );

	                   
	$.RegisterForUnhandledEvent( 'DirectChallenge_GenRandomKey', PlayMenu.OnDirectChallengeRandom );
	$.RegisterForUnhandledEvent( 'DirectChallenge_EditKey', PlayMenu.OnDirectChallengeEdit );
	$.RegisterForUnhandledEvent( 'DirectChallenge_CopyKey', PlayMenu.OnDirectChallengeCopy );
	$.RegisterForUnhandledEvent( 'DirectChallenge_ChooseClanKey', PlayMenu.OnChooseClanKeyBtn );
	$.RegisterForUnhandledEvent( 'DirectChallenge_ClanChallengeKeySelected', PlayMenu.OnClanChallengeKeySelected );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_PartyBrowser_PrivateQueuesUpdate', PlayMenu.OnPrivateQueuesUpdate );



} )();
