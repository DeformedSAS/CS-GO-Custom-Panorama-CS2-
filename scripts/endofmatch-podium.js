'use strict';


                                              
var arrValidStats = [
	  	         			
	"kills",
	"assists",
	  	         			
	"adr",
	  	     				
	  	     				
	"5k",
	  	                	
	"hsp",
	  	        			
	  	        			
	  	             		
	"cashearned",
	"livetime",
	"objective",
	"utilitydamage",
	"enemiesflashed",
]

var EOM_Podium = ( function () {


	var _m_pauseBeforeEnd = 3.0;
	var _m_cP = $( '#eom-podium' );

                                                     

	var _m_arrTopPlayerXuid = [];
	var _m_localPlayerScoreboardPosition;

	var _m_oBestStats = {};	              
	var _m_oPlayerBestStatsCount = {};                                      
	var _m_oMatchEndData = {};
	
	var _m_jobStart = undefined;
	
	var _m_Events = [];	                                                                             

	var _m_currentEventIndex = -1;                                                  
	var m_elActiveEvent = "";                                                  

	var _m_hDenyInputToGame = undefined;		                                                                         


	function _GetFreeForAllTopThreePlayers_Response( first, second, third )
	{
		_m_arrTopPlayerXuid[ 0 ] = first;
		_m_arrTopPlayerXuid[ 1 ] = second;
		_m_arrTopPlayerXuid[ 2 ] = third;
	}	

	function _GetFreeForAllPlayerPosition_Response( pos )
	{
		_m_localPlayerScoreboardPosition = pos;
	}	


	function _AddPlayerToPodium( _xuid, _position )
	{
		if ( _xuid === undefined )
			return;
		
		       
		var playerName = GameStateAPI.GetPlayerName( _xuid );

		var elPodiumPlayers = _m_cP.FindChildTraverse( "id-eom-podium__podium__players" );

		var elPlayer = elPodiumPlayers.FindChildTraverse( "id-player--" + _position );

		                                                                         
		if ( !elPlayer )
		{
			for ( var i = 1; i <= _position; i++ )
			{
				if ( !elPodiumPlayers.FindChildTraverse( "id-player--" + i ) )
				{
					elPlayer = $.CreatePanel( "Panel", elPodiumPlayers, "id-player--" + i );
					elPlayer.BLoadLayoutSnippet( "snippet_podium_player" );	

					                                                                                               
					elPlayer.FindChildTraverse( "id-eom-podium__podium__player__name-and-avatar" ).AddClass( "hidden" );

				}	
			}
		}

		var elPlayerNamePlaque = elPlayer.FindChildTraverse( "id-eom-podium__podium__player__plaque" );
		var elPlayerNameTag = elPlayer.FindChildTraverse( "id-eom-podium__podium__player__name-and-avatar" );

		                                                         
		elPlayerNameTag.RemoveClass( "hidden" );

		var PlaqueBg = elPlayerNamePlaque.FindChildTraverse( "id-eom-podium__podium__player__plaque__bg" );

		                 
		if ( GameStateAPI.GetLocalPlayerXuid() == _xuid )
		{
			PlaqueBg.AddClass( 'plaque--local' );
		}	
			
		                         
		elPlayerNameTag.FindChildTraverse( "id-eom-podium__podium__player__name" ).text = playerName;

		if ( !GameStateAPI.IsFakePlayer( _xuid ) )
		{
			elPlayerNameTag.FindChildTraverse( "id-eom-podium__podium__player__avatar" ).steamid = _xuid;
		}	
		else
		{
			var team = GameStateAPI.GetPlayerTeamName( _xuid );

			elPlayerNameTag.FindChildTraverse( "id-eom-podium__podium__player__avatar" ).AddClass( "eom-podium__podium__player__avatar--" + team );
		}	

		if ( !GameStateAPI.IsFakePlayer( _xuid ) )
		{
			elPlayerNameTag.SetPanelEvent( 'onactivate', function()
			{

				var elPlayerCardContextMenu = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
					'',
					'',
					'file://{resources}/layout/context_menus/context_menu_playercard.xml',
					'xuid=' + _xuid,
					_OnPlayerCardDismiss.bind( undefined )
				)

				elPlayerCardContextMenu.AddClass( "ContextMenu_NoArrow" );
				_m_hDenyInputToGame = UiToolkitAPI.AddDenyInputFlagsToGame(elPlayerCardContextMenu, "ScoreboardPlayercard", "CaptureMouse" );


			} );

			function _OnPlayerCardDismiss ()
			{
				UiToolkitAPI.ReleaseDenyInputFlagsToGame( _m_hDenyInputToGame );
			}
		}

		       

		var rank = 8;                                          

		if ( rank > 0 )
		{
			var elRankImage = elPlayer.FindChildTraverse( 'id-eom-podium__podium__player__rank' );

			var imagepath = "file://{images}/icons/xp/level" + rank + ".png";

			elRankImage.SetImage( imagepath );
		}

		             
		var skillGroup = 8;                                                     

		if ( skillGroup > 0 )
		{
			var elRankImage = elPlayer.FindChildTraverse( 'id-eom-podium__podium__player__skillgroup' );

			var imagepath = "file://{images}/icons/skillgroups/skillgroup" + skillGroup + ".png";

			elRankImage.SetImage( imagepath );
		}

		               
		var teamColor = GameStateAPI.GetPlayerColor( _xuid );
		if ( teamColor !== "" )
		{
			PlaqueBg.style.washColor = teamColor;
		}


		var oStatsPerPlayer = {};

		var MAX_STATS_PER_PLAYER = 5;

		        
		Object.keys( _m_oBestStats ).forEach( stat => 
		{
			if ( _m_oBestStats[ stat ].m_leaderXuid == _xuid )
			{
				            
				if ( !( _xuid in oStatsPerPlayer ) || oStatsPerPlayer[ _xuid ] < MAX_STATS_PER_PLAYER )
				{
					var elPanel = _m_oBestStats[ stat ].m_elPanel;
					elPanel.SetParent( elPlayer.FindChildTraverse( "id-eom-podium__podium__player__stats" ) );

					if ( !( _xuid in oStatsPerPlayer ) )
					{
						oStatsPerPlayer[ _xuid ] = 1;
					}
					else
					{
						oStatsPerPlayer[ _xuid ]++;
					}
				}	
			}
		} );


		        

		var elPlayerModel = $.CreatePanel( "ItemPreviewPanel", _m_cP.FindChildTraverse( "id-eom-podium__podium__player-models") , "id-eom-podium__podium__player__model")
		elPlayerModel.AddClass( "eom-podium__podium__player_model" );

		                                                                
		var manifest = "resource/ui/econ/ItemModelPanelCharWeaponInspect.res";
		elPlayerModel.SetScene( manifest, 'models/player/custom_player/legacy/ctm_sas.mdl', false );
		
		var shortTeam = ( GameStateAPI.GetPlayerTeamName( _xuid ) == "CT" ) ? 'ct' : 't';
		var id = GameStateAPI.GetPlayerActiveWeaponItemId( _xuid );
		if ( id == 0 || ItemInfo.GetSlotSubPosition( id ) == 'c4' )
		{
			id = LoadoutAPI.GetItemID( shortTeam, 'melee' )
		}	

		elPlayerModel.EnableRendering( true );

		var settings = {
			panel: elPlayerModel,
			team: shortTeam,
			model: 'models/' + GameStateAPI.GetPlayerModel( _xuid ),
			itemId: id,
			loadoutSlot: ItemInfo.GetSlotSubPosition( id ),
			playIntroAnim: false,
			selectedWeapon: ItemInfo.GetItemDefinitionName ( id )
		};
	
		CharacterAnims.PlayAnimsOnPanel( settings );

		                                           
		elPlayerModel.SetCameraPreset( 4 + _position, false );


		          
		  

		if ( ( _xuid != GameStateAPI.GetLocalPlayerXuid() )                                              )
		{
			var onActivate = function( _xuid )
			{
				UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_commend_player.xml', 'xuid=' + _xuid );
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}

			var elCommendButton = elPlayer.FindChildTraverse( "id-eom-podium__podium__player__commend--text" );

			elCommendButton.RemoveClass( "hidden" );
			elCommendButton.SetPanelEvent( 'onactivate', onActivate.bind( undefined, _xuid ) );
		}	
	}


	var beststat_t = ( function( value, panel, leader )
	{

		var _m_value = value;
		var _m_elPanel = panel;
		var _m_leaderXuid = leader;

		return {

			m_value 		: _m_value,
			m_elPanel 		: _m_elPanel,
			m_leaderXuid 	: _m_leaderXuid,

		}
	} );

	function _CalculateTeamBestStats()
	{

		                                         
		                                            
		  
		var _InitBestStatsLeaderPanel = function( stat )
		{
			                                                   
			if ( !( stat in _m_oBestStats ) )
			{
				var elHiddenStats = _m_cP.FindChildTraverse( 'id-eom-podium-podium__hiddenstats' );
				var elLabel = $.CreatePanel( "Label", elHiddenStats, stat );
				elLabel.text = $.Localize( "statleader_" + stat );

				_m_oBestStats[ stat ] = beststat_t( 0, elLabel, "" );
			}
		}
		
		var oPlayerList = GameStateAPI.GetPlayerDataJSO();

		if ( Object.keys( oPlayerList ).length === 0 )
		{
			return;
		}

		var myTeamName = GameStateAPI.GetPlayerTeamName( GameStateAPI.GetLocalPlayerXuid() );

		for ( var teamName in oPlayerList )
		{
			if ( teamName !== myTeamName )
				continue;

			for ( var j in oPlayerList[ teamName ] )
			{
				var xuid = oPlayerList[ teamName ][ j ];

				                                                      
				_m_oPlayerBestStatsCount[ xuid ] = 0;
	
				        
				var oPlayerBestStats = MatchStatsAPI.GetPlayerStatsJSO( xuid );

				Object.keys( oPlayerBestStats ).forEach( stat => 
				{
					                             
					if ( arrValidStats.indexOf( stat ) === -1 )
						return;

					_InitBestStatsLeaderPanel( stat );
				
					if ( oPlayerBestStats[ stat ] > _m_oBestStats[ stat ].m_value ) 
					{
						                                                      
						_m_oBestStats[ stat ].m_value = oPlayerBestStats[ stat ];
						_m_oBestStats[ stat ].m_leaderXuid = xuid;

						_m_oPlayerBestStatsCount[ xuid ]++;
					}
				} );
			}
		}
	}	

	function _PopulateTeamPodium()
	{

		                                       
		  
		  

		                               
		_m_oPlayerBestStatsCount[ GameStateAPI.GetLocalPlayerXuid() ] = 99999;

		var arrSortedTeam = [];

		for ( var xuid in _m_oPlayerBestStatsCount )
			arrSortedTeam.push( [ xuid, _m_oPlayerBestStatsCount[ xuid ] ] );

		arrSortedTeam.sort( function( a, b ) { return b[ 1 ] - a[ 1 ]; } )

		                                                                           
		  
		if ( arrSortedTeam[ 4 ] )
			_AddPlayerToPodium( arrSortedTeam[ 4 ][ 0 ], 5 );
		
		if ( arrSortedTeam[ 3 ] )
			_AddPlayerToPodium( arrSortedTeam[ 3 ][ 0 ], 1 );
		
		if ( arrSortedTeam[ 2 ] )
			_AddPlayerToPodium( arrSortedTeam[ 2 ][ 0 ], 4 );
		
		if ( arrSortedTeam[ 1 ] )
			_AddPlayerToPodium( arrSortedTeam[ 1 ][ 0 ], 2 );
		
		if ( arrSortedTeam[ 0 ] )
			_AddPlayerToPodium( arrSortedTeam[ 0 ][ 0 ], 3 );
		
	}


	function _Initialize() 
	{

		if ( _m_jobStart )
		{
			$.CancelScheduled( _m_jobStart );
			_m_jobStart = undefined;
		}
		
		_m_cP.RemoveAndDeleteChildren();

		_m_cP.BLoadLayoutSnippet("snippet_podium-root", true, false);
			
		                                                    
		_m_cP.FindChildrenWithClassTraverse("eom-event").forEach( function ( elPanel ) {
	
			                   
			var panelXML = "file://{resources}/layout/" + elPanel.GetAttributeString( "data-xml", "" );
			elPanel.RemoveAndDeleteChildren();
			elPanel.BLoadLayout( panelXML, true, false );
			elPanel.AddClass( "hidden" );

		} );
		
	}



	function _DisplayMe() 
	{

		if ( GameStateAPI.IsDemoOrHltv() )
		{
			_End();
			return false;
		}

		_Initialize();

		_m_oMatchEndData = GameStateAPI.GetMatchEndWinDataJSO();

		if ( !_m_oMatchEndData )
		{
			_End();
			return false;
		}

		var bFreeForAll = ( _m_oMatchEndData[ 'winning_player' ] != 0 );

		if ( bFreeForAll )
		{
			                                                
			$.DispatchEvent( 'Scoreboard_GetFreeForAllTopThreePlayers' );

			                                     

			if ( _m_arrTopPlayerXuid[ 2 ] )
				_AddPlayerToPodium( _m_arrTopPlayerXuid[ 2 ][ 0 ], 4 );
			
			if ( _m_arrTopPlayerXuid[ 1 ] )
				_AddPlayerToPodium( _m_arrTopPlayerXuid[ 1 ][ 0 ], 2 );
			
			if ( _m_arrTopPlayerXuid[ 0 ] )	
				_AddPlayerToPodium( _m_arrTopPlayerXuid[ 0 ][ 0 ], 3 );
			
		}
		else             
		{

			_CalculateTeamBestStats();

			_PopulateTeamPodium();

		}

		return true;

	}


	function _ShowNextEvent() 
	{

		_m_currentEventIndex++;

		if ( _m_currentEventIndex < _m_Events.length )
		{		
			_m_Events[ _m_currentEventIndex ].Start();
		}
		else
		{
			$.Schedule( _m_pauseBeforeEnd, _End );
		}	
	}


                                                         
                                                                      
  
  

	function _Start()
	{
			
		if ( _DisplayMe() )
		{
			EndOfMatch.SwitchToPanel( 'eom-podium' );

			$.Schedule( 3.0, _ShowNextEvent );	

		}
		else
		{
			_End();
		}	
	}

	function _End() 
	{
		$.DispatchEvent( 'EndOfMatch_ShowNext' );
	}

	function _Shutdown()
	{
	}


	                      
	return {
        name: 'eom-podium',

		Start									: _Start,
		GetFreeForAllTopThreePlayers_Response	: _GetFreeForAllTopThreePlayers_Response,
		GetFreeForAllPlayerPosition_Response	: _GetFreeForAllPlayerPosition_Response,

		ShowNextEvent								: _ShowNextEvent,
		
		m_Events: _m_Events,
		Shutdown: _Shutdown,
		
	};


})();


                                                                                                    
                                           
                                                                                                    
(function () {

	EndOfMatch.RegisterPanelObject( EOM_Podium );

	$.RegisterForUnhandledEvent( "EndOfMatch_GetFreeForAllTopThreePlayers_Response", EOM_Podium.GetFreeForAllTopThreePlayers_Response );

	$.RegisterForUnhandledEvent( "EndOfMatch_GetFreeForAllPlayerPosition_Response", EOM_Podium.GetFreeForAllPlayerPosition_Response );

	$.RegisterForUnhandledEvent( "EOM_Podium_ShowNextEvent", EOM_Podium.ShowNextEvent );
	

})();
