'use strict';

var EOM_Win = ( function () {


	var _m_pauseBeforeEnd = 4.0;
	var _m_cP = $.GetContextPanel();

                                                     

	var _m_arrTopPlayerXuid = [];
	var _m_localPlayerScoreboardPosition;

	var _m_oMatchEndData = undefined;
	var _m_oScoreData = undefined;

	function _GetFreeForAllPlayerPosition_Response( pos )
	{
		_m_localPlayerScoreboardPosition = pos;
	}

	function _SetVictoryStatement()
	{
		_m_oScoreData = MockAdapter.GetScoreDataJSO();

		if ( !_m_oScoreData ||
			!_m_oScoreData[ "teamdata" ] ||
			!_m_oScoreData[ "teamdata" ][ "CT" ] ||
			!_m_oScoreData[ "teamdata" ][ "TERRORIST" ] )
			return false;

		$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.gameover_show', 'MOUSE' );

		         
		var winningTeamNumber = _m_oMatchEndData[ "winning_team_number" ];
		var result = "eom-result-tie2";
		_m_cP.SetDialogVariable( "teamname", "" );

		if ( winningTeamNumber )
		{
			var localPlayerTeamNumber = MockAdapter.GetPlayerTeamNumber( MockAdapter.GetLocalPlayerXuid() );

			var mode = EOM_Characters.GetModeForEndOfMatchPurposes();
			var bForceShowWinningTeam = EOM_Characters.ShowWinningTeam( mode );

			if ( GameStateAPI.IsDemoOrHltv() || ( localPlayerTeamNumber != 2 && localPlayerTeamNumber != 3 ) || bForceShowWinningTeam )
			{
				result = "eom-result-win2";
				var upperTeamName = CharacterAnims.NormalizeTeamName( winningTeamNumber ).toUpperCase();
				_m_cP.SetDialogVariable( "teamname", MockAdapter.GetTeamClanName( upperTeamName ) );
			}
			else
			{
				var localPlayerTeamName = MockAdapter.GetPlayerTeamName( MockAdapter.GetLocalPlayerXuid() );
				var localPlayerClanName = MockAdapter.GetTeamClanName( localPlayerTeamName );

				result = winningTeamNumber == localPlayerTeamNumber ? "eom-result-win2" : "eom-result-loss2";
				_m_cP.SetDialogVariable( "teamname", localPlayerClanName );
			}
		}

		_m_cP.SetDialogVariable( "win-result", $.Localize( result ) );
		
		_AnimStart();

		return true;
	}

	function _SetCoinModel( winningTeam, team )
	{
		var elModel = _m_cP.FindChildTraverse( 'WinCoinModel' );
		elModel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
			'models/inventory_items/scoreboard_logos/logo_' + team + '.mdl',
			false
		);
	}

	function _SetWinTeamText( team )
	{
		var elLabel = _m_cP.FindChildTraverse( 'WinTeamName' );
		var clanName = MockAdapter.GetTeamClanName( team.toUpperCase() );
		elLabel.text = clanName;
	}

	function _AnimStart ()
	{
		var elCoinModel = $.GetContextPanel().FindChildTraverse( 'WinCoinModel' );
		var elTeamLabel = $.GetContextPanel().FindChildTraverse( 'WinTeamName' );
		var elWinnerLabel = $.GetContextPanel().FindChildTraverse( 'WinTeamBackgroundText' );

	  	                                        
	  	                                    
	  	                                       
		elWinnerLabel.TriggerClass( 'move' );
		elTeamLabel.TriggerClass( 'move' );
	}

	function _SetPlayerWinners()
	{
		var elPlayers = _m_cP.FindChildTraverse( 'WinPlayers' );
		elPlayers.RemoveClass( 'hidden' );

		elPlayers.RemoveAndDeleteChildren();

		for ( var i = 0; i < _m_arrTopPlayerXuid.length; i++ )
		{
			var elPlayer = $.CreatePanel( 'Panel', elPlayers, 'Player + entry' );
			elPlayer.BLoadLayoutSnippet( "PlayerWinner" );

			var elAvatar = elPlayer.FindChildTraverse( 'WinPlayersAvatar' );
			elAvatar.BLoadLayoutSnippet( 'AvatarPlayerCard' );

			elPlayer.FindChildTraverse( 'WinPlacement' ).text = $.Localize( "#scoreboard_arsenal_" + i );
			elPlayer.SetDialogVariable( 'winner_name', MockAdapter.GetPlayerName( _m_arrTopPlayerXuid[ i ] ));

			var bIsBot = MockAdapter.IsFakePlayer( _m_arrTopPlayerXuid[ i ] );
			var xuidForAvatarLookup = bIsBot ? '0' : _m_arrTopPlayerXuid[ i ];

			Avatar.Init( elAvatar, xuidForAvatarLookup, 'playercard' );

			if ( bIsBot )
			{
				var team = GameStateAPI.GetPlayerTeamName( _m_arrTopPlayerXuid[ i ] );
				elAvatar.FindChildTraverse( 'JsAvatarImage' ).SetDefaultImage( 'file://{images}/icons/scoreboard/avatar-' + team + '.png' );
				elAvatar.FindChildTraverse( 'JsAvatarImage' ).RemoveClass( 'hidden' );
			}
			

			if ( i > 0 )
			{
				elPlayer.AddClass( 'eom-win__player--small' );
			}
		}
	}

	function _DisplayMe() 
	{
		_m_oMatchEndData = MockAdapter.GetMatchEndWinDataJSO();
		_m_oScoreData = MockAdapter.GetScoreDataJSO();
		
		if ( !_m_oMatchEndData )
		{
			return false;
		}

		var bFreeForAll = ( _m_oMatchEndData[ 'winning_player' ] != 0 );

		if ( bFreeForAll )
		{
			                                                 
			                                                                                                  

			                                                
		  	                                                             
			
			return false;
		}
		else             
		{
			return _SetVictoryStatement();
		}

		return true;
	}

	                                                         
	                                                                      
	  
	  

	function _Start() 
	{
		                              

		if ( MockAdapter.GetMockData() && !MockAdapter.GetMockData().includes( 'WIN' ) )
		{
			_End();
			return;
		}

		if ( _DisplayMe( ) )
		{
			EndOfMatch.SwitchToPanel( 'eom-win' );
			EndOfMatch.StartDisplayTimer( _m_pauseBeforeEnd );
			
			$.Schedule( _m_pauseBeforeEnd, _End );
		}
		else
		{
			_End();
			return;
		}
	}

	function _End() 
	{
		                            

		EndOfMatch.ShowNextPanel();
	}

	function _Shutdown()
	{
	}

	                      
	return	{
        name: 'eom-win',
		Start									: _Start,
		Shutdown: _Shutdown,
	};
})();


                                                                                                    
                                           
                                                                                                    
(function () {

	if ( EndOfMatch )
		EndOfMatch.RegisterPanelObject( EOM_Win );


})();
