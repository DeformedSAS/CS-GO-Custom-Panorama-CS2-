'use strict'; 

var TeamSelectMenu = ( function (){

	var m_errorTimerHandle = false;
	var m_highlightedTeam = 0;

	function _Init() 
	{
		_SetUpTeamSelectBtns();
	}

	function _ShowPanel()
	{
		if ( GameStateAPI.IsDemoOrHltv() )
			return;

		var elBackgroundImage = $.GetContextPanel().FindChildInLayoutFile( 'BackgroundMapImage' );
		var mapName = MockAdapter.GetMapBSPName();

		elBackgroundImage.SetImage( 'file://{images}/map_icons/screenshots/1080p/' + mapName +'.png' );
		_GetAnimInfo();
		
		_PopulatePlayerList();
		_ShowCancelButton();

		if( m_errorTimerHandle !== false )
		{
			$.CancelScheduled( m_errorTimerHandle );
			m_errorTimerHandle = false;
		}

		var elWarningPanel = $('#TeamJoinError');
		elWarningPanel.AddClass( 'hidden' );
		
		m_highlightedTeam = 0;
	}

	function _ShowPanelTest ( mockdata )
	{
		MockAdapter.SetMockData( mockdata );

		_ShowPanel();
	}
	function _HighlightPanel( elModelPanel )
	{
		elModelPanel.GetParent().SetHasClass( 'highlight', true );

		elModelPanel.ResetActivityModifiers();
		if ( elModelPanel.id === 'TeamCharT' )
		{
			elModelPanel.ApplyActivityModifier( 'terrorist' );
		}
		else
		{
			elModelPanel.ApplyActivityModifier( 'ct' );
		}
		elModelPanel.PlayActivity( 'ACT_CSGO_UIPLAYER_CONFIRM', true );
	}

	function _UnhighlightPanel( elModelPanel )
	{
		if ( !elModelPanel || !elModelPanel.IsValid() )
			return;
			
		elModelPanel.GetParent().SetHasClass( 'highlight', false );

		if ( elModelPanel.id === 'TeamCharT' )
		{
			elModelPanel.ApplyActivityModifier( 'terrorist' );
		}
		else
		{
			elModelPanel.ApplyActivityModifier( 'ct' );
		}
		elModelPanel.ApplyActivityModifier( 'Pistol' );
		elModelPanel.PlayActivity( 'ACT_CSGO_UIPLAYER_IDLE', true );
	}

	function _SelectTeam( team )
	{
		var currentTeamNumber = MockAdapter.GetPlayerTeamNumber( MyPersonaAPI.GetXuid());

		if( team !== "0" && currentTeamNumber.toString() === team )
		{
			                                                        
			_HidePanel();
			return;
		}
		
		_SetTeam( team );
	}

	function _SelectHighlightedTeam()
	{
		_SelectTeam( m_highlightedTeam );
	}

	function _HighlightTTeam()
	{
		var elBtnTeamT = $( '#BtnSelectTeam-TERRORIST' );
		elBtnTeamT.SetHasClass( 'team-select-icon-title-highlight', true );

		var elTModel = $( '#TeamCharT' );

		_HighlightPanel( elTModel );
		m_highlightedTeam = '2';
		elBtnTeamT.SetFocus();
	}

	function _UnhighlightTTeam ()
	{
		var elBtnTeamT = $( '#BtnSelectTeam-TERRORIST' );
		elBtnTeamT.SetHasClass( 'team-select-icon-title-highlight', false );

		var elTModel = $( '#TeamCharT' );
		_UnhighlightPanel( elTModel );
	}

	function _HighlightCTTeam()
	{
		var elBtnTeamCT = $( '#BtnSelectTeam-CT' );
		elBtnTeamCT.SetHasClass( 'team-select-icon-title-highlight', true );
		var elCtModel = $( '#TeamCharCT' );

		_HighlightPanel( elCtModel );
		m_highlightedTeam = '3';
		elBtnTeamCT.SetFocus();
	}

	function _UnhighlightCTTeam ()
	{
		var elBtnTeamCT = $( '#BtnSelectTeam-CT' );
		elBtnTeamCT.SetHasClass( 'team-select-icon-title-highlight', false );

		var elCtModel = $( '#TeamCharCT' );

		_UnhighlightPanel( elCtModel );
	}

	function _SetUpTeamSelectBtns()
	{
		var onActivate = function ( team )
		{
			_SelectTeam( team );
		}

		var elBtnTeamT = $( '#BtnSelectTeam-TERRORIST' );
		elBtnTeamT.SetPanelEvent( 'onmouseover', _HighlightTTeam );
		elBtnTeamT.SetPanelEvent( 'onmouseout', _UnhighlightTTeam );
		elBtnTeamT.SetPanelEvent( 'onactivate', onActivate.bind( undefined, '2' ) );

		var elBtnTeamCT = $( '#BtnSelectTeam-CT' );
		elBtnTeamCT.SetPanelEvent( 'onmouseover', _HighlightCTTeam );
		elBtnTeamCT.SetPanelEvent( 'onmouseout', _UnhighlightCTTeam );
		elBtnTeamCT.SetPanelEvent( 'onactivate', onActivate.bind( undefined, '3' ) );

		var elBtnSpectate = $( '#TeamSelectSpectate' );
		elBtnSpectate.SetPanelEvent( 'onactivate', onActivate.bind( undefined, '1' ) );

		var elBtnSpectate = $( '#TeamSelectAuto' );
		elBtnSpectate.SetPanelEvent( 'onactivate', onActivate.bind( undefined, '0' ) );
		
		_UnhighlightCTTeam();
		_UnhighlightTTeam();
		
	}

	var _SetTeam= function ( team )
	{
		  
		            
		           
		                   
		  
		
		GameInterfaceAPI.ConsoleCommand( 'jointeam '+team+' 1' );
	}

	var _SetTeamCT = function()
	{
		_SetTeam( 3 );
	}

	var _SetTeamT = function()
	{
		_SetTeam( 2 );
	}

	var _GetAnimInfo = function ()
	{
		_ResetModel( 'TERRORIST' );
		_ResetModel( 'CT' );
	}

	const CAMERA_PRESET_T = 1;
	const CAMERA_PRESET_CT = 2;

	function _ResetModel ( team )
	{
		var elChar;

		if ( team == "CT" )
		{
			elChar = $.GetContextPanel().FindChildInLayoutFile( 'TeamCharCT' );
			if ( !elChar )
				return;

			_SetCharacterAnim( elChar,
				{
					team: 'ct',
					cameraPreset: CAMERA_PRESET_CT,
				}
			);
		}
		else if ( team == "TERRORIST" )
		{
			elChar = $.GetContextPanel().FindChildInLayoutFile( 'TeamCharT' );
			if ( !elChar )
			return;

			_SetCharacterAnim( elChar,
				{
					team: 't',
					cameraPreset: CAMERA_PRESET_T,
				}
			);
		}

		elChar.GetParent().TriggerClass( 'highlit-player' );

		              
	}

	var _SetCharacterAnim = function( playerPanel, paramsettings )
	{
		                                                      
		var teamstring = CharacterAnims.NormalizeTeamName( paramsettings.team, true );
		var settings = ItemInfo.GetOrUpdateVanityCharacterSettings( LoadoutAPI.GetItemID( teamstring, 'customplayer' ) );
		settings.panel = playerPanel;
		settings.cameraPreset = paramsettings.cameraPreset;
		settings.weaponItemId = LoadoutAPI.GetItemID( teamstring, "secondary0" );
		if ( settings.charItemId === LoadoutAPI.GetDefaultItem( teamstring, 'customplayer' ) )
		{
			settings.modelOverride = ( teamstring == 'ct' )
				? MockAdapter.GetPlayerItemCT( $.GetContextPanel() )
				: MockAdapter.GetPlayerItemTerrorist( $.GetContextPanel() );
			settings.charItemId = undefined;
		}

		CharacterAnims.PlayAnimsOnPanel( settings );
	}

	var _PopulatePlayerList = function( )
	{
	    if ( GameStateAPI.IsDemoOrHltv() )
	    {
	        return false;
	    }
		
	                                 

		                       
		var oPlayerList = MockAdapter.GetPlayerDataJSO();

		                                                            
		var teamNames = ['TERRORIST', 'CT'];
		for ( var iTeam = 0; iTeam < teamNames.length; ++iTeam )
		{

		    var teamName = teamNames[iTeam];

		    var players = {};
		    if ( oPlayerList !== undefined && oPlayerList[teamName] )
            {
		        players = oPlayerList[teamName];
            }

		    var xuidsOnTeam = [];
		    var countBots = 0;

		    for ( var j in players )
		    {
		        var xuid = players[j];
		        _UpdatePlayer( xuid, teamName );
		        xuidsOnTeam.push( xuid );

		        if( MockAdapter.IsFakePlayer(xuid ))
		            countBots++;
		    }

			                                           
			                                                                                    
			var elList =  $( '#List-'+ teamName );
			var elTeammates = elList.FindChild('Teammates');
			elTeammates.RemoveClass('hidden');
			
			var listOfTeammatesPanels = elTeammates.Children();
			listOfTeammatesPanels.forEach( function( element ) {
				if ( xuidsOnTeam.indexOf( element.id ) === -1 ||
					!MockAdapter.IsPlayerConnected( element.id ) || 
					teamName !== MockAdapter.GetPlayerTeamName( element.id )) {

					element.AddClass('hidden');
				}
			});

			_UpdateBotPlayerCount( countBots, xuidsOnTeam.length - countBots, teamName );
		}

		return false;
	}

	var _UpdatePlayer = function( xuid, teamName )
	{
		if( xuid === 0 )
			return;
		
		var elList = $( '#List-'+ teamName );
		var elTeammatesPanels = elList.FindChild('Teammates');
		var elTeammate = elTeammatesPanels.FindChildInLayoutFile( xuid );

		if( !elTeammate )
		{
			elTeammate = $.CreatePanel( 'Panel', elTeammatesPanels, xuid );
			elTeammate.BLoadLayoutSnippet( 'Teammate' );

			var elName = elTeammate.FindChildInLayoutFile( 'TeamSelectTeammateName' );

			var clanTag = MockAdapter.GetPlayerClanTag(xuid);
			var playerName = MockAdapter.GetPlayerNameWithNoHTMLEscapes(xuid);
			elName.text = clanTag + " " + playerName;               
	
			var elAvatar = $.CreatePanel( 'Panel', elTeammate, xuid, { hittest:'true' } );
			elAvatar.SetAttributeString( 'xuid', xuid );
			elAvatar.BLoadLayout('file://{resources}/layout/avatar.xml', false, false );
			elAvatar.BLoadLayoutSnippet( 'AvatarParty' );

			var elAvatarImage = elAvatar.FindChildInLayoutFile('JsAvatarImage');
			elAvatarImage.SetDefaultImage( 'file://{images}/icons/scoreboard/avatar-' + teamName + '.png' );
			elAvatarImage.AddClass( 'no-hover' );
	
			                                                                           
			Avatar.Init( elAvatar, xuid.toString(), "PlayerCard" );
			elTeammate.RemoveClass('hidden');

			elTeammate.RegisterForReadyEvents( true );
			elTeammate.OnPropertyTransitionEndEvent = function ( panelName, propertyName )
			{
				if( propertyName === 'opacity')
				{
					                                         
					if( elTeammate.visible === true && elTeammate.BIsTransparent() )
					{
						elTeammate.DeleteAsync(.0);
						                                              
						return true;
					}
				}

				return false;
			}

			$.RegisterEventHandler( 'PropertyTransitionEnd', elTeammate, elTeammate.OnPropertyTransitionEndEvent );

			function OnMouseOver( team, charItemId, weaponItemId )
			{
				TeamSelectMenu.SetPlayerModel( team, charItemId, weaponItemId  );
			};

			function OnMouseOut( team )
			{
				TeamSelectMenu.ResetModel( team );
			};

			                                     
			var bSameTeam = teamName != MockAdapter.GetPlayerTeamName( MockAdapter.GetLocalPlayerXuid() );
			var weaponItemId = bSameTeam ? MockAdapter.GetPlayerActiveWeaponItemId( xuid ) : InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( teamName == "CT" ? 42 : 59, 0 );

			elTeammate.SetPanelEvent( 'onmouseover', OnMouseOver.bind( undefined,
				teamName,
				MockAdapter.GetPlayerCharacterItemID( xuid ),
				weaponItemId) );
			
			elTeammate.SetPanelEvent( 'onmouseout', OnMouseOut.bind( undefined, teamName));

		}
		else
		{
			Avatar.Init( elTeammate.FindChild( xuid ), xuid, "PlayerCard" );
			                                                                           
		}
	}

	function _SetPlayerModel( team, charItemId, weaponItemId )
	{

		var elChar = team == 'CT' ? $.GetContextPanel().FindChildInLayoutFile( 'TeamCharCT' ) : $.GetContextPanel().FindChildInLayoutFile( 'TeamCharT' );

		var cameraPreset = team == 'CT' ? CAMERA_PRESET_CT : CAMERA_PRESET_T;

		               
		var settings =
		{
			panel:elChar,
			team: team,
			charItemId: charItemId,
			weaponItemId: weaponItemId,
			cameraPreset: cameraPreset,
		}

		CharacterAnims.PlayAnimsOnPanel( settings );

		var elParent = elChar.GetParent();
		elParent.TriggerClass( 'highlit-player' );
	}

	var _UpdateBotPlayerCount = function( countBots, countPlayers, team )
	{
		var labelCount = $('#BtnSelectTeam-' + team ).FindChildInLayoutFile('PlayerBotCount');

		if( countBots === 1 )
			labelCount.SetDialogVariable( "botlabel", $.Localize( '#team_select_bot' ) );
		else
			labelCount.SetDialogVariable( "botlabel", $.Localize( '#team_select_bots' ) );

		if( countPlayers === 1 )
			labelCount.SetDialogVariable( "playerlabel", $.Localize( '#team_select_player' ) );
		else
			labelCount.SetDialogVariable( "playerlabel", $.Localize( '#team_select_players' ) );

		labelCount.SetDialogVariableInt( "bots", countBots );
		labelCount.SetDialogVariableInt( "players", countPlayers );
		labelCount.text = $.Localize( '#team_select_bot_player_count', labelCount );
	}

	var _ShowCancelButton = function()
	{
		var bUnassigned = $.GetContextPanel().GetTeamNumber() == 0;
		$('#TeamSelectCancel').visible = !bUnassigned;
	}

	var _ShowError = function( locString )
	{
		var elLabel = $('#TeamJoinErrorLabel');
		var elWarningPanel = $('#TeamJoinError');

		elLabel.text = $.Localize(locString);
		elWarningPanel.RemoveClass('hidden');
		
		m_errorTimerHandle = $.Schedule(5.0, function () {
			if ( elWarningPanel.IsValid() )
			{
				elWarningPanel.AddClass('hidden');
			}
			m_errorTimerHandle = false;
		});
	}

	var _HidePanel = function()
	{
		$.DispatchEvent( 'CSGOShowTeamSelectMenu', false );
	}

	return {
		Init 					: _Init,
		PopulatePlayerList		: _PopulatePlayerList,
		ShowCancelButton		: _ShowCancelButton,
		SetTeamCT				: _SetTeamCT,
		SetTeamT				: _SetTeamT,
		ShowPanel				: _ShowPanel,
		ShowPanel_Test			: _ShowPanelTest,
		HidePanel				: _HidePanel,
		ShowError				: _ShowError,
		HighlightTTeam			: _HighlightTTeam,
		HighlightCTTeam			: _HighlightCTTeam,
		SelectHighlightedTeam	: _SelectHighlightedTeam,
		SetPlayerModel 			: _SetPlayerModel,
		ResetModels				: _GetAnimInfo,
		ResetModel				: _ResetModel,
	 }
})();

                                                                                                    
                                           
                                                                                                    
(function()
{
	TeamSelectMenu.Init();
	                             
	$.RegisterForUnhandledEvent( 'CSGOShowTeamSelectMenu', TeamSelectMenu.ShowPanel );
	$.RegisterForUnhandledEvent( 'CSGOShowTeamSelectMenu_Test', TeamSelectMenu.ShowPanel_Test );

	                                                     
	                                                                                             
	$.RegisterForUnhandledEvent( 'PlayerTeamChanged', TeamSelectMenu.PopulatePlayerList );

	$.RegisterForUnhandledEvent( 'ServerForcingTeamJoin', TeamSelectMenu.ShowCancelButton );
	$.RegisterForUnhandledEvent( 'TeamJoinFailed', TeamSelectMenu.ShowError );
	
	var _m_cP = $( '#TeamSelectMenu' );

	                                                                        
	if ( !_m_cP )
		_m_cP = $( "#PanelToTest" );
	
	$.RegisterKeyBind( _m_cP, 'key_escape', TeamSelectMenu.HidePanel );
	$.RegisterKeyBind( _m_cP, 'key_2', TeamSelectMenu.SetTeamCT );
	$.RegisterKeyBind( _m_cP, 'key_1', TeamSelectMenu.SetTeamT );
	$.RegisterKeyBind( _m_cP, 'key_down', TeamSelectMenu.HighlightTTeam );
	$.RegisterKeyBind( _m_cP, 'key_up', TeamSelectMenu.HighlightCTTeam );
	$.RegisterKeyBind( _m_cP, 'key_space', TeamSelectMenu.SelectHighlightedTeam );
	
})();
