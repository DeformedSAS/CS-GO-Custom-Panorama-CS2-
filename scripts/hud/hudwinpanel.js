'use strict';

var HudWinPanel = ( function()
{

	var _m_RisData;                                  
	var _m_elCanvas;                                  
	var _m_elPlotContainer;                                                                          
							                                                             
	var _m_canvasHeightInPixels;
	var _m_canvasWidthInPixels;
	var _m_teamPerspective;
	var _m_localXuid;
	var _m_timeslice;

	var _m_bInit = false;
	var _m_xRange;
	var _m_prevChance;                       
	var _m_delay = 0;                                              
	var _m_ListeningForGameEvents = false;
	var _m_bCanvasIsReady = false;

	                                    
	var _m_arrTimelineEvents = {};
	var _m_arrPersonalDamageEvents = {};

	var _m_winningTeam;

	var _m_haveMVP = false;

	const TOTAL_TIME_REVEAL = 5;                             

	const BEAM_ONLY_ON_DAMAGE = false;


	function _Init ()
	{
		if ( _m_bInit )
			return;
		
		$.RegisterForUnhandledEvent( 'HudWinPanel_ShowRoundImpactScoreReport', _ShowRoundImpactScoreReport );
		$.RegisterForUnhandledEvent( 'HudWinPanel_MVP', _OnReceiveMVP );
		$.RegisterForUnhandledEvent( 'Player_Hurt', _OnReceivePlayerHurt );
		$.RegisterForUnhandledEvent( 'Player_Death', _OnReceivePlayerDeath );

		_m_bInit = true;
	}

	function _OnReceivePlayerHurt ( attackerXuid, victimXuid, damage )
	{
		if ( !_m_ListeningForGameEvents )
			return;
		
		                                                                                                          
		if ( !_m_bCanvasIsReady )
		{
			                                            

			$.Schedule( 0.5, function( attackerXuid, victimXuid, damage )
			{
				_OnReceivePlayerHurt( attackerXuid, victimXuid, damage );
				return;

			}.bind( this, attackerXuid, victimXuid, damage ) );
		}
		
			                                                              
		if ( _m_localXuid != attackerXuid && _m_localXuid != victimXuid )
			return;

		var wasDamageGiven = _m_localXuid == attackerXuid;
				
		var healthRemoved = wasDamageGiven ? damage : 0;
		var numHits = wasDamageGiven ? 1 : 0;
		var returnedHealthRemoved = wasDamageGiven ? 0 : damage;
		var returnHits = wasDamageGiven ? 0 : 1;

		_UpdateDamage( wasDamageGiven ? victimXuid : attackerXuid, healthRemoved, numHits, returnedHealthRemoved, returnHits );
	}
		
		
	function _OnReceivePlayerDeath ( xuid )
	{
		if ( !_m_ListeningForGameEvents )
		return;
	
		                                                                                                          
		if ( !_m_bCanvasIsReady )
		{
			                                             

			$.Schedule( 0.5, function( xuid )
			{
				_OnReceivePlayerDeath( xuid );
				return;

			}.bind( this, xuid ) );
		}

		var elEvent = $.GetContextPanel().FindChildTraverse( 'Event-' + xuid );
		if ( !elEvent )
			return;
		
		var elDeath = elEvent.FindChildTraverse( 'Death' );
		if ( !elDeath )
			return;
		
		elDeath.visible = true;		
	}


	function _OnReceiveMVP ( xuid )
	{
	  	                                                

		if ( !_m_ListeningForGameEvents )
		return;

		                                                                                                          
		if ( !_m_bCanvasIsReady )
		{
			                                     

			$.Schedule( 0.5, function( xuid, reason, score )
			{
				_OnReceiveMVP( xuid );
				return;

			}.bind( this, xuid ));
		}
		
		_m_haveMVP = true;
		
		                 
		var elMVPPanel = $.GetContextPanel().FindChildTraverse( 'RISMVPPanel' );
		var elAvatar = elMVPPanel.FindChildTraverse( 'RISMVPAvatar' );

		var isBot = GameStateAPI.IsFakePlayer( xuid );
		var bCT = GameStateAPI.GetPlayerTeamNumber( xuid ) == 3;

		elMVPPanel.FindChildTraverse( 'MVP-BG' ).SetHasClass( 'color-ct', bCT );
		elMVPPanel.FindChildTraverse( 'MVP-BG' ).SetHasClass( 'color-t', !bCT );

		elAvatar.visible = !isBot;

		if ( !isBot )
		{
			                 
			elAvatar.steamid = xuid;	

			                
			Avatar.SetFlair( elMVPPanel, xuid );			
		}
		else
		{
			var elAvatarContainer = elMVPPanel.FindChildTraverse( 'AvatarContainer' );

			elAvatarContainer.style.backgroundImage = bCT ?
			'url("file://{images}/hud/teamcounter/teamcounter_alivebgCT.png")' :
				'url("file://{images}/hud/teamcounter/teamcounter_alivebgT.png")';
			
			elAvatarContainer.style.backgroundSize = '100% 100%';	
		}
	}

	function _ShowMVP ()
	{
		var elMVPPanel = $.GetContextPanel().FindChildTraverse( 'RISMVPPanel' );

		if ( !_m_haveMVP )
			return;
		
		elMVPPanel.visible = true;
		elMVPPanel.RemoveClass( 'prereveal' );
}

	function _TransformPointIntoCanvasSpace( point )
	{
		var denom = _m_xRange;
		var x = _m_canvasWidthInPixels / denom * point[ 0 ];
		var y = _m_canvasHeightInPixels - ( _m_canvasHeightInPixels / 100 * point[ 1 ] );

		return [ x, y ];
	}

	function _FlipY ( plotPoint )
	{
		return ( [ plotPoint[ 0 ], _m_canvasHeightInPixels - plotPoint[ 1 ] ] );
	}

	function _flattenArrayOfTuples ( arrOfTuples )
	{
		var retVal = [];

		arrOfTuples.forEach( t => retVal.push( t[ 0 ] ) && retVal.push( t[ 1 ] ) );

		return retVal;

	}

	function _ConvertToLocalOdds ( terroristOdds )
	{
		if ( _m_teamPerspective == 2 )
			return terroristOdds;
		else
			return ( 100 - terroristOdds );
	}

	function _ShowRoundImpactScoreReport ( msg )
	{
		if ( !msg )
			return;
		
		                    
		_Reset();

		_m_ListeningForGameEvents = true;

		                                                              
		if ( !_m_elCanvas.IsSizeValid() )
		{
			                                                   

			$.Schedule( 0.5, _ShowRoundImpactScoreReport.bind( this, msg ) );
			return;
		}

		_m_bCanvasIsReady = true;

		                
		$.GetContextPanel().SetDialogVariable( 'player_name', GameStateAPI.GetPlayerName( _m_localXuid ) );
		                                             
		                                                                                       

		                               
		_m_canvasHeightInPixels = _m_elCanvas.actuallayoutheight / _m_elCanvas.actualuiscale_y;
		_m_canvasWidthInPixels = _m_elCanvas.actuallayoutwidth / _m_elCanvas.actualuiscale_x;

		_m_RisData = msg;
		
		var oInitialConditions = _m_RisData[ 'init_conditions' ];
		                               
		var nStartingOdds = oInitialConditions[ 'terrorist_odds' ];

		var arrEvents = Object.values( _m_RisData[ 'all_ris_event_data' ] );

		_m_arrTimelineEvents = _ExtractTimelineEvents( arrEvents );
		_m_arrPersonalDamageEvents = _ExtractLivingEnemies( arrEvents );

		_m_winningTeam = '';

		if ( _m_arrTimelineEvents.length > 0 )
		{
			var FinalTOdds = _m_arrTimelineEvents[ _m_arrTimelineEvents.length - 1 ][ 'terrorist_odds' ];
			_m_winningTeam = FinalTOdds == 100 ? 2 : FinalTOdds == 0 ? 3 : '';
		}

		_m_xRange = _m_arrTimelineEvents.length + _m_arrPersonalDamageEvents.length + 1.5;
		_m_timeslice = TOTAL_TIME_REVEAL / _m_xRange;

		var x = 0;
		var y = _ConvertToLocalOdds( nStartingOdds );

		var startPoint = [ x, y ];
		var startPlotPoint = _TransformPointIntoCanvasSpace( startPoint );

		var points = [];
		points.push( startPoint );

		var plotPoints = [];
		plotPoints.push( startPlotPoint );

		_PlotStartingOdds( nStartingOdds, startPlotPoint );
	
		_ProcessTimelineEvents( _m_arrTimelineEvents, points, plotPoints, nStartingOdds );

		var finalPoint = points[ points.length - 1 ];
		_ProcessDamageEvents( _m_arrPersonalDamageEvents, finalPoint[0] );

		                      
		var bCT = _m_teamPerspective == 3;
		var drawColor = bCT ? '#B5D4EEaa' : '#EAD18Aaa';
		_m_elCanvas.DrawSoftLinePointsJS( plotPoints.length, _flattenArrayOfTuples( plotPoints ), 4, 1.0, drawColor );
		_m_elCanvas.TriggerClass( 'show-canvas' );

		                       
		var graphWidth = ( _m_arrTimelineEvents.length ) / _m_xRange * 100;

		var elGraphGuides = $.GetContextPanel().FindChildTraverse( 'GraphGuides' );
		elGraphGuides.style.width = graphWidth + "%";

		var elLivingBG = $.GetContextPanel().FindChildTraverse( 'LivingBG' );
		elLivingBG.style.width = 100 - graphWidth + "%";

		                 
		
		Scheduler.Schedule( _m_delay + _m_timeslice, function()
		{
			_ShowWinnerPlaque();

		} );

		Scheduler.Schedule( _m_delay + (2 * _m_timeslice), function()
		{
			_ShowMVP();
		});
		

		_Colorize();

		                                                      

		var freezetime = Number( GameInterfaceAPI.GetSettingString( 'mp_freezetime' ) );
		var roundRestartDelay = Number( GameInterfaceAPI.GetSettingString( 'mp_round_restart_delay' ) );
		var shutdownDelay = roundRestartDelay + freezetime - 1;

		Scheduler.Schedule( shutdownDelay, function()
		{
			_m_ListeningForGameEvents = false;
			_m_bCanvasIsReady = false;
		} );
	}

	function _ExtractTimelineEvents ( arrEvents )
	{
		var arrResults = [];

  		                    

		arrEvents.forEach( function( oEvent, index )
		{
			var oVictimData = oEvent[ 'victim_data' ];
			var isLivingPlayer = oVictimData && !oVictimData[ 'is_dead' ];

			if ( !isLivingPlayer )
				arrResults.push( oEvent );
		} );
			
		return arrResults;
	}

	function _ExtractTPersonalDamageEvents ( arrEvents )
	{
		var arrResults = [];

		arrEvents.forEach( function( oEvent, index )
		{
			var oVictimData = oEvent[ 'victim_data' ];

			var isLivingPlayer = oVictimData && !oVictimData[ 'is_dead' ];

			                                                     
			var oDamage = _FindDamageDataForPlayer( oEvent, _m_localXuid );

			if ( isLivingPlayer && oDamage )
				arrResults.push( oEvent );
		} );
			
		return arrResults;
	}	

	function _ExtractLivingEnemies ( arrEvents )
	{
		var arrResults = [];

		arrEvents.forEach( function( oEvent, index )
		{
			var oVictimData = oEvent[ 'victim_data' ];

			var isLivingPlayer = oVictimData && !oVictimData[ 'is_dead' ];

			var localTeam = GameStateAPI.GetAssociatedTeamNumber( _m_localXuid );

			var isEnemy = oVictimData && oVictimData[ 'team_number' ] != localTeam && ( localTeam == 2 || localTeam == 3 );

			if ( isLivingPlayer && isEnemy )
				arrResults.push( oEvent );
		} );
			
		return arrResults;
	}		

	function _ProcessTimelineEvents ( arrEvents, points, plotPoints, nStartingOdds )
	{
		var loopingSfxHandle = null;

		                                             
		arrEvents.forEach( function( oEvent, index )
		{
			var x = index + 1;
			var y = _ConvertToLocalOdds( oEvent[ 'terrorist_odds' ] );

			var point = [ x, y ];
			var plotPoint = _TransformPointIntoCanvasSpace( point );

			points.push( point );
			plotPoints.push( plotPoint );

			_m_delay = index * _m_timeslice;

			var delta = 0;

			                    
			if ( index == 0 )
				delta = oEvent[ 'terrorist_odds' ] - nStartingOdds;
			else
				delta = oEvent[ 'terrorist_odds' ] - arrEvents[ index - 1][ 'terrorist_odds' ];

			var sfx = delta < 0 ? "UIPanorama.round_report_line_down" : "UIPanorama.round_report_line_up";
			
			var delay = index * _m_timeslice;

			Scheduler.Schedule( delay, function( oEvent, plotPoint, sfx )
			{
				_AddDamageToDamagePanel( oEvent, plotPoint );
				_DecoratePoint( oEvent, plotPoint );

				if ( loopingSfxHandle )
					$.StopSoundEvent( loopingSfxHandle, 0.1 );
			
				loopingSfxHandle = $.PlaySoundEvent( sfx );

			}.bind( this, oEvent, plotPoint, sfx ) );

		} );

		                                                      
		Scheduler.Schedule( _m_arrTimelineEvents.length * _m_timeslice, function()
		{
			if ( loopingSfxHandle )
				$.StopSoundEvent( loopingSfxHandle, 0.1 );
		} );
	}

	function _ProcessDamageEvents ( arrEvents, startX )
	{

		                                             
		arrEvents.forEach( function( oEvent, index )
		{
			var x = startX + index + 1;
			var y = 50;

			var point = [ x, y ];
			var plotPoint = _TransformPointIntoCanvasSpace( point );

			var delay = ( _m_arrTimelineEvents.length + index ) * _m_timeslice;

			Scheduler.Schedule( delay, function( oEvent, plotPoint )
			{
				_AddDamageToDamagePanel( oEvent, plotPoint );
				_DecoratePoint( oEvent, plotPoint );

			}.bind( this, oEvent, plotPoint ) );

		} );
	}	

	function _ShowWinnerPlaque ()
	{
		if ( _m_winningTeam == '' )
			return;
		
		var bCT = _m_winningTeam == 3;
		
		var winningTeamName = GameStateAPI.GetTeamClanName( bCT ? "CT" : "TERRORIST");

		                 
		var elWinnerPlaque = $.GetContextPanel().FindChildTraverse( 'WinnerPanel' );
		elWinnerPlaque.SetDialogVariable( 'ris_team', winningTeamName );

		              
		var elWinningLogo = elWinnerPlaque.FindChildTraverse( 'RISWinningTeamLogo' );
		elWinningLogo.SetImage( bCT ? "file://{images}/icons/ui/ct_logo_1c.svg" : "file://{images}/icons/ui/t_logo_1c.svg" );

		                   
		var elWinningBG = elWinnerPlaque.FindChildTraverse( 'WinnerPlaqueBG' );
		elWinningBG.SetHasClass( 'color-ct', bCT );
		elWinningBG.SetHasClass( 'color-t', !bCT );

		var localTeamNumber = GameStateAPI.GetAssociatedTeamNumber( _m_localXuid );

		var WinningTeamNumber = bCT ? 3 : 2;
		var sfx = localTeamNumber == WinningTeamNumber ? "UIPanorama.round_report_round_won" : "UIPanorama.round_report_round_lost"

		elWinnerPlaque.RemoveClass( 'prereveal' );
		$.PlaySoundEvent( sfx );

	}

	function _Colorize ()
	{
		var bCT = _m_winningTeam == 3;
		$.GetContextPanel().FindChildrenWithClassTraverse( 'team-colorize' ).forEach( el =>
			{
				el.SetHasClass( 'color-ct', bCT );
				el.SetHasClass( 'color-t', !bCT );
			} );
	}

	function _FindDamageDataForPlayer ( oEvent, xuid )
	{
		var oDamageData = oEvent[ 'all_damage_data' ];

  		                     

		                                                       
		var returnObj = {};

		var arrDamages = Object.values( oDamageData );
		
		for ( var i = 0; i < arrDamages.length; i++ )
		{
			if ( arrDamages[ i ][ 'target_xuid' ] == xuid )
				Object.assign(returnObj, returnObj, arrDamages[i]);
		}
		
		return returnObj;
	}


	function _UpdateDamage ( xuid, healthRemoved, numHits, returnHealthRemoved, returnHits )
	{
		var elDamage = $.GetContextPanel().FindChildTraverse( 'Damage-' + xuid );
		if ( !elDamage )
			return;
		
	  	                                                                                       
		
		elDamage.healthRemoved += healthRemoved;
		elDamage.healthRemoved = Math.min( elDamage.healthRemoved, 100 );

		elDamage.numHits += numHits;
		elDamage.returnHealthRemoved += returnHealthRemoved;
		elDamage.returnHealthRemoved = Math.min( elDamage.returnHealthRemoved, 100 );

		elDamage.returnHits += returnHits;

		if ( ( elDamage.returnHealthRemoved > 0 ) || (  elDamage.healthRemoved > 0 ) )
		{
			var elDGiven = elDamage.FindChildTraverse( 'DamageGiven' );
			var elDTaken = elDamage.FindChildTraverse( 'DamageTaken' );
	
			elDGiven.SetDialogVariable( 'health_removed', elDamage.healthRemoved );
			elDGiven.SetDialogVariable( 'num_hits', elDamage.numHits );
			elDTaken.SetDialogVariable( 'health_removed', elDamage.returnHealthRemoved );
			elDTaken.SetDialogVariable( 'num_hits', elDamage.returnHits );

			elDGiven.visible = elDamage.healthRemoved > 0;
			elDTaken.visible = elDamage.returnHealthRemoved > 0;		

			if ( BEAM_ONLY_ON_DAMAGE )
			{
				var elTeamColorBar = $.GetContextPanel().FindChildTraverse( 'bar-' + xuid );
				if ( elTeamColorBar )
				{
					elTeamColorBar.RemoveClass( 'prereveal' );
				}
			}

			const dmgDelay = 0.1;

			Scheduler.Schedule( dmgDelay, function( elDamage )
			{
				if ( elDamage && elDamage.IsValid() )
					elDamage.RemoveClass( 'prereveal' );
				
			}.bind( this, elDamage ));
		}
	}

	function _AddDamageToDamagePanel ( oEvent, plotPoint )
	{
		var elDamageContainer = $.GetContextPanel().FindChildTraverse( 'DamageContainer' );
		
		var oDamage = _FindDamageDataForPlayer( oEvent, _m_localXuid );
		
		var victimData = oEvent[ 'victim_data' ];
		var objectiveData = oEvent[ 'objective_data' ];

		if ( objectiveData )
			return;

		var elDamage = $.CreatePanel( 'Panel', elDamageContainer, 'Damage-' + victimData[ 'xuid'] );
		elDamage.BLoadLayoutSnippet( 'snippet-damage' );

		elDamage.healthRemoved = 0;
		elDamage.numHits = 0;
		elDamage.returnHealthRemoved = 0;
		elDamage.returnHits = 0;
		elDamage.style.x = plotPoint[ 0 ] + "px";

		              
		if ( BEAM_ONLY_ON_DAMAGE )
		{
			var elTeamColorBar = $.CreatePanel( 'Panel', _m_elPlotContainer, 'bar-' + victimData[ 'xuid' ] );
			elTeamColorBar.AddClass( 'ris-graph__bar' );
			elTeamColorBar.AddClass( 'prereveal' );
			elTeamColorBar.SetHasClass( 'color-ct', bCT );
			elTeamColorBar.SetHasClass( 'color-t', !bCT );	
			elTeamColorBar.style.x = plotPoint[ 0 ] + "px";
			elTeamColorBar.style.height = _FlipY( plotPoint )[ 1 ] + 70 + "px";
		}
		
		                                                                                                      
		if ( oDamage )
		{
			var healthRemoved = oDamage[ 'health_removed' ] ? oDamage[ 'health_removed' ] : 0;
			var nHits = oDamage[ 'num_hits' ] ? oDamage[ 'num_hits' ] : 0;
			var returnedHealthRemoved = oDamage[ 'return_health_removed' ] ? oDamage[ 'return_health_removed' ] : 0;
			var nReturnHits = oDamage[ 'num_return_hits' ] ? oDamage[ 'num_return_hits' ] : 0;

			_UpdateDamage( victimData[ 'xuid'], healthRemoved, nHits, returnedHealthRemoved, nReturnHits );
		}
	}

	function _PlotStartingOdds ( nStartingOdds, startPlotPoint )
	{
		var elStartPlot = $.CreatePanel( "Panel", _m_elPlotContainer, 'Start' );
		elStartPlot.BLoadLayoutSnippet( 'snippet-starting-odds' );
		
		elStartPlot.style.y = startPlotPoint[ 1 ] + "px";

		$.GetContextPanel().SetDialogVariable( 'starting_chance', _ConvertToLocalOdds( nStartingOdds ) + '%' );		

		_m_prevChance = nStartingOdds;
	}
	
	function _DecoratePoint ( oEvent, plotPoint )
	{
		var victimData = oEvent[ 'victim_data' ];
		var objectiveData = oEvent[ 'objective_data' ];

		                                                                      
		var key = objectiveData ? objectiveData[ 'type' ] : victimData ? victimData[ 'xuid' ] : '';

		var elEventPlot = $.CreatePanel( "Panel", _m_elPlotContainer, 'Event-' + key );
		elEventPlot.BLoadLayoutSnippet( 'snippet-event' );

		var elEventIcon = elEventPlot.FindChildTraverse( 'EventIcon' );
		var elEventBG = elEventPlot.FindChildTraverse( 'EventBG' );
		var elEventChance = elEventPlot.FindChildTraverse( 'EventChance' );
		var elEventMain = elEventPlot.FindChildTraverse( 'EventMain' );
		var elDeath = elEventPlot.FindChildTraverse( 'Death' );

		var chance = _ConvertToLocalOdds( oEvent[ 'terrorist_odds' ] );

		elDeath.visible = false;

		if ( victimData )
		{
			var xuid = victimData[ 'xuid' ];
			var isBot = victimData[ 'is_bot' ];
			var teamNumber = victimData[ 'team_number' ];
			var color = victimData[ 'color' ];
			var isDead = victimData[ 'is_dead' ];

			elEventChance.visible = isDead;
			elDeath.visible = isDead;
				
			             
			elEventIcon.SetImage( "file://{images}/icons/ui/elimination.svg" );
			elEventIcon.visible = false;

			               
			var elAvatarImage = elEventPlot.FindChildTraverse( 'Avatar' );
			elAvatarImage.steamid = xuid;

			var bCT = teamNumber == 3;

			elAvatarImage.style.backgroundImage = bCT ?
				'url("file://{images}/hud/teamcounter/teamcounter_alivebgCT.png")' :
				'url("file://{images}/hud/teamcounter/teamcounter_alivebgT.png")';
			elAvatarImage.style.backgroundSize = '100% 100%';
			
					              
			if ( !BEAM_ONLY_ON_DAMAGE )
			{

					var elTeamColorBar = $.CreatePanel( 'Panel', _m_elPlotContainer, 'bar-' + victimData[ 'xuid' ] );
					elTeamColorBar.AddClass( 'ris-graph__bar' );
					elTeamColorBar.SetHasClass( 'color-ct', bCT );
					elTeamColorBar.SetHasClass( 'color-t', !bCT );
					elTeamColorBar.style.x = plotPoint[ 0 ] + "px";
					elTeamColorBar.style.height = _FlipY( plotPoint )[ 1 ] + 70 + "px";
			}

			               
			var rgbColor = TeamColor.GetTeamColor( Number( color ) );
			elEventMain.FindChildTraverse( 'JsAvatarTeamColor' ).style.washColor = 'rgb(' + rgbColor + ')';
			
			elEventMain.FindChildTraverse( 'JsAvatarTeamColor' ).visible = !isBot;
	
  			                                                                
		}
		else if ( objectiveData )
		{
			var elAvatarImage = elEventPlot.FindChildTraverse( 'Avatar' );
			elAvatarImage.visible = false;

			             
			var src;
			switch ( objectiveData[ 'type' ]  )
			{
				case 0:                  
					src = "file://{images}/icons/ui/bomb_c4.svg";
					bCT = false;
					break;
				
				case 1:                   
					src = "file://{images}/icons/ui/bomb.svg";
					bCT = false;
					break;
				
				case 2:                   
					src = "file://{images}/icons/equipment/defuser.svg";
					bCT = true;
					break;
				
				case 3:               
					src = "file://{images}/icons/ui/time_exp.svg";
					bCT = true;
					break;				
			}

			elEventIcon.SetImage( src );
			elEventIcon.AddClass( 'event__icon--objective' );

			                 
			elEventBG.SetHasClass( 'color-ct', bCT );
			elEventBG.SetHasClass( 'color-t', !bCT );
		}

		var delta = chance - _m_prevChance;

		var deltaSymbol = delta < 0 ? "▼" : delta > 0 ? "▲" : "";

		               
		if ( chance == 100 )
		{
			elEventPlot.SetDialogVariable( 'chance', $.Localize( 'ris_win' ) );
			elEventChance.FindChildTraverse( 'EventChanceNumber' ).style.color = '#00ff00';
		}
		else if ( chance == 0 )
		{
			elEventPlot.SetDialogVariable( 'chance', $.Localize( 'ris_loss' ) );
			elEventChance.FindChildTraverse( 'EventChanceNumber' ).style.color = '#ff0000';
		}
		else
		{
			elEventPlot.SetDialogVariable( 'chance', deltaSymbol + chance + '%' );
			elEventChance.FindChildTraverse( 'EventChanceNumber').style.color = _RemapToRedGreenRGB( chance - _m_prevChance, -20, 20 );			
		}

		                 
		elEventPlot.style.x = plotPoint[ 0 ] + "px";
		elEventPlot.style.y = plotPoint[ 1 ] + "px";

		          
		if ( elEventMain && elEventMain.IsValid() )
			elEventMain.RemoveClass( 'prereveal' );
		
		if( elEventChance && elEventChance.IsValid())
			elEventChance.RemoveClass( 'prereveal' );
		
		if ( elDeath && elDeath.IsValid() )
			elDeath.RemoveClass( 'prereveal' );
		
		var sfx = delta > 0 ? "UIPanorama.round_report_odds_up" : delta < 0 ? "UIPanorama.round_report_odds_dn" : "UIPanorama.round_report_odds_none";

		$.PlaySoundEvent( sfx );
			
		_m_prevChance = chance;
	}

	function _RemapToRedGreenRGB ( val, min, max )
	{
		var frac = Math.min( 1, Math.max( 0, ( val - min ) / ( max - min )));
		return 'rgb(' + ( 1 - frac ) * 255 + "," + frac * 255 + "," + '0' + ")";
		
		var rgb = 'rgb(200,200,200)'
		if ( val >= 20 )
			rgb = 'rgb(0,255,0)';
		else if ( val > 0 )
			rgb = 'rgb(100,255,0)';
		else if ( val < -20 )
			rgb = 'rgb(255,0,0)';
		else if ( val < 0 )
			rgb = 'rgb(255,100,0)';	
		
		return rgb;
	}

	function _Reset ()
	{
		var localTeamNumber = GameStateAPI.GetAssociatedTeamNumber( _m_localXuid );

		                                                            
		var bUseInEye = GameStateAPI.IsDemoOrHltv() || ( localTeamNumber != 2 && localTeamNumber != 3 );
		_m_localXuid = bUseInEye ? GameStateAPI.GetHudPlayerXuid() : GameStateAPI.GetLocalPlayerXuid();
		
		_m_teamPerspective = ( localTeamNumber == 2 || localTeamNumber == 3 ) ? localTeamNumber : 2;
		var bCT = _m_teamPerspective == 3;

	  	                                                                                                                   

		                   
		_m_elCanvas = $.GetContextPanel().FindChildTraverse( 'RisCanvas' );
		_m_elPlotContainer = $.GetContextPanel().FindChildTraverse( 'RisPlotContainer' );
		
		Scheduler.Cancel();

		                         
		_m_arrTimelineEvents = {};
		_m_arrPersonalDamageEvents = {};

		_m_delay = 0;
		_m_haveMVP = false;
		
		_m_elPlotContainer.RemoveAndDeleteChildren();

		var elDamageContainer = $.GetContextPanel().FindChildTraverse( 'DamageContainer' );
		elDamageContainer.RemoveAndDeleteChildren();			
		
		_m_elCanvas.ClearJS( 'rgba(0,0,0,0)' );
	
		$.GetContextPanel().SetDialogVariable( 'team', GameStateAPI.GetTeamClanName( bCT ? 'CT' : 'TERRORIST' ) );
		
		                   
		var elTeamLogo = $.GetContextPanel().FindChildTraverse( 'RisTeamLogo' );
		if ( elTeamLogo )
		{
			elTeamLogo.SetImage( bCT ? "file://{images}/icons/ui/ct_logo_1c.svg" : "file://{images}/icons/ui/t_logo_1c.svg" );
		}

		var elWinnerPlaque = $.GetContextPanel().FindChildTraverse( 'WinnerPanel' );
		elWinnerPlaque.AddClass( 'prereveal' );

		var elMVPPanel = $.GetContextPanel().FindChildTraverse( 'RISMVPPanel' );
		elMVPPanel.visible = false;

		var elAvatar = elMVPPanel.FindChildTraverse( 'RISMVPAvatar' );
		elAvatar.AddClass( 'prereveal' );

		_Colorize();
	}

		
	                      
	return {

		Init: _Init,
	};

} )();

                                                                                                    
                                           
                                                                                                    
( function()
{
	HudWinPanel.Init();

} )();
