'use strict'; 

var MapDraft = ( function (){

	var _m_cp = $.GetContextPanel();
	var _m_nPhase = 0;
	var _m_hDenyInputToGame = null;
	var _m_isThisPhasePick = false;
	var _m_phaseTitleText = _m_cp.FindChildInLayoutFile( 'id-map-draft-phase-info' );
	var _m_rowsContainer = _m_cp.FindChildInLayoutFile( 'id-map-draft-phase-rows' );
	var _m_rowPhaseName = 'id-map-draft-phase-buttons-container';

	                                   
	                                   
	var _m_nT = 2;
	var _m_nCt = 3;

	var _m_msLastSoundTimestamp = ( new Date() ).getTime();
	function _PlaySoundEffect( strSoundEffect, msThrottleRequired = 0 )
	{
		var msTimestampNow = ( new Date() ).getTime();
		if ( msThrottleRequired && ( msThrottleRequired > 0 ) )
		{
			if ( msTimestampNow - _m_msLastSoundTimestamp < msThrottleRequired )
				return;                                                                           
		}

		$.DispatchEvent( 'PlaySoundEffect', strSoundEffect, 'MOUSE' );
		_m_msLastSoundTimestamp = msTimestampNow;
	}

	
	$.RegisterForUnhandledEvent( 'PanoramaComponent_IngameDraft_DraftUpdate', _Update );
	$.RegisterForUnhandledEvent( 'UnloadLoadingScreenAndReinit', _Update );
	$.RegisterForUnhandledEvent( 'PlayerTeamChanged', _PopulatePlayerList );

	function _Update()
	{
		let sGameUiState = GameStateAPI.GetCSGOGameUIStateName();
		                                                                  
		                                                                 
		                                                                             
		
		let bThisPanelIsVisible = true;
		if( sGameUiState === 'CSGO_GAME_UI_STATE_LOADINGSCREEN' || MatchDraftAPI.GetDraft() !== 'ingame' || MatchDraftAPI.GetIngamePhase() < 1 )
		{
			bThisPanelIsVisible = false;
		}
		
		_m_cp.visible = bThisPanelIsVisible;
		_m_cp.SetHasClass( 'map-draft--show', bThisPanelIsVisible );

		let bMouseCaptureActive = _m_hDenyInputToGame ? true : false;
		if ( bMouseCaptureActive != bThisPanelIsVisible )
		{
			if ( bThisPanelIsVisible )
			{
				_m_hDenyInputToGame = UiToolkitAPI.AddDenyInputFlagsToGame( _m_cp, "MapDraft", "ShareMouse" );
				_PopulatePlayerList();
			}
			else
			{
				UiToolkitAPI.ReleaseDenyInputFlagsToGame( _m_hDenyInputToGame );
				_m_hDenyInputToGame = null;
			}
		}

		if ( !bThisPanelIsVisible )
		{
			_m_rowsContainer.RemoveAndDeleteChildren();
			return;
		}

		                
		_m_cp.visible = true;
		_m_cp.SetHasClass( 'map-draft--show', true );
		
		  
		                                                
		                                                                             
		                                                                    
		  
		if ( MatchDraftAPI.GetIngamePhase() != _m_nPhase )
		{	                                       
			_PlaySoundEffect( 'tab_mainmenu_watch' );
		}
		else
		{	                                                                                     
			                                                         
			var ingameTeamToActNow = MatchDraftAPI.GetIngameTeamToActNow();
			if ( ingameTeamToActNow && ( ingameTeamToActNow == GameStateAPI.GetPlayerTeamNumber( MyPersonaAPI.GetXuid() ) ) )
			{
				_PlaySoundEffect( 'UIPanorama.mainmenu_rollover', 400 );
			}
		}

		                  
		_m_nPhase = MatchDraftAPI.GetIngamePhase();
		                                  
		if ( _m_nPhase > 6 )
		{	                                       
			_m_nPhase = 6;
		}

		                                             
		_HideFinishedPhaseRows();

		_MakeVoteButtons( _UpdateButtonsRow() );
		_UpdateActionText();
		_UpdatePhaseProgressBar();
	}

	var _UpdatePhaseProgressBar = function()
	{
		var aChildren = _m_cp.FindChildInLayoutFile('id-map-draft-phasebar-container').Children();
		aChildren.forEach( phase => {
			var nPhaseBarIndex =  parseInt( phase.GetAttributeString( 'data-phase', '' ));
			phase.SetHasClass( 'map-draft-phasebar--ban', !_m_isThisPhasePick && nPhaseBarIndex === _m_nPhase );
			phase.SetHasClass( 'map-draft-phasebar--pick', _m_isThisPhasePick && nPhaseBarIndex === _m_nPhase );
			phase.SetHasClass( 'map-draft-phasebar--pre', nPhaseBarIndex > _m_nPhase );
			phase.SetHasClass( 'map-draft-phasebar--post',  nPhaseBarIndex < _m_nPhase );

			phase.FindChildInLayoutFile( 'id-map-draft-phase-name' ).text= $.Localize ( 'matchdraft_phase_'+ nPhaseBarIndex );

			if( nPhaseBarIndex === _m_nPhase )
			{
				var nTimeRemaining = MatchDraftAPI.GetIngamePhaseSecondsRemaining();
				nTimeRemaining = nTimeRemaining ? nTimeRemaining : 0;
				phase.FindChildInLayoutFile( 'id-map-draft-phase-timer' ).timeleft = nTimeRemaining;
			}
		});
	}

	var _UpdateButtonsRow = function()
	{
		                              
		var elContainer = _m_rowsContainer.FindChildInLayoutFile( _m_rowPhaseName + _m_nPhase );

		if( !elContainer )
		{
			elContainer = $.CreatePanel( 'Panel', _m_rowsContainer, _m_rowPhaseName + _m_nPhase );
			elContainer.AddClass( 'map-draft-phase-buttons-container' );
			elContainer.AddClass( 'map-draft-phase-buttons-container--show' );
			elContainer.Data().phase = _m_nPhase;
		}

		elContainer.SetHasClass( 'map-draft-phase-buttons-container--show', true );
		elContainer.SetHasClass( 'map-draft-phase-buttons-container--hide', false );
		elContainer.hittest = true;
		elContainer.hittestchildren = true;

		return elContainer;
	}

	var _HideFinishedPhaseRows = function()
	{
		var aRows = _m_rowsContainer.Children();
		aRows.forEach( function( row ){
			if( row.Data().phase !== _m_nPhase )
			{
				row.RemoveClass( 'map-draft-phase-buttons-container--show' );
				row.AddClass( 'map-draft-phase-buttons-container--hide' );
				row.hittest = false;
				row.hittestchildren = false;
			}
		});
	}

	var _MakeVoteButtons = function( elContainer )
	{
		if( _m_nPhase === 1 )
		{
			                               
			_m_isThisPhasePick = true;

			                                                
			                                                                                      
			var nYourTeam =  GameStateAPI.GetPlayerTeamNumber( MyPersonaAPI.GetXuid() );
			var nOtherTeam = nYourTeam === _m_nT ? _m_nCt : _m_nT;

			_MakeButton ( elContainer, {
				id: 'id-phase-1-btn-ban-first',
				image: 'url("file://{images}/mapdraft/ban_first.png")',
				selectorimg: "file://{images}/mapdraft/green_check.png",
				name: "#matchdraft_vote_ban_first",
				statustext: '#matchdraft_vote_status_pick',
				ispick: _m_isThisPhasePick,
				voteid: nYourTeam.toString()
			});

			_MakeButton ( elContainer, {
				id: 'id-phase-1-btn-pick-side',
				image: 'url("file://{images}/mapdraft/pick_team.png")',
				selectorimg: "file://{images}/mapdraft/green_check.png",
				name: "#matchdraft_vote_pick_team",
				statustext: '#matchdraft_vote_status_pick',
				ispick: _m_isThisPhasePick,
				voteid: nOtherTeam.toString()
			});
		}
		else if( _m_nPhase === 5  )
		{
			                     
			_m_isThisPhasePick = true;

			_MakeButton ( elContainer, {
				id: 'id-phase-5-btn-start-ct',
				image: 'url("file://{images}/mapdraft/pick_ct.png")',
				selectorimg: "file://{images}/mapdraft/green_check.png",
				name: "#CSGO_Inventory_Team_CT",
				statustext: '#matchdraft_vote_status_pick',
				ispick: _m_isThisPhasePick,
				voteid: _m_nCt.toString()
			});

			_MakeLargeMap( elContainer );

			_MakeButton ( elContainer, {
				id: 'id-phase-5-btn-start-t',
				image: 'url("file://{images}/mapdraft/pick_t.png")',
				selectorimg: "file://{images}/mapdraft/green_check.png",
				name: "#CSGO_Inventory_Team_T",
				statustext: '#matchdraft_vote_status_pick',
				ispick: _m_isThisPhasePick,
				voteid: _m_nT.toString()
			});
		}
		else if (_m_nPhase === 6 )
		{
			_MakeLargeMap( elContainer, 'map-draft-phase-pick-map-image--large' );
		}
		else if( _m_nPhase < 5 )
		{
			            
			_m_isThisPhasePick = false;
			var aVoteIds = MatchDraftAPI.GetIngameMapIdsList().split(',');

			for( var i = 0; i < aVoteIds.length; i++ )
			{
				var mapName = DeepStatsAPI.MapIDToString( parseInt( aVoteIds[i] ));

				                                                                        
				if ( _m_nPhase !== 4 ||
					( _m_nPhase === 4 && MatchDraftAPI.GetIngameTeamToActNow() !== GameStateAPI.GetPlayerTeamNumber( MyPersonaAPI.GetXuid()) ) ||
					( _m_nPhase === 4 && MatchDraftAPI.GetIngameTeamToActNow() === GameStateAPI.GetPlayerTeamNumber( MyPersonaAPI.GetXuid()) &&
					MatchDraftAPI.GetIngameMapIdState(aVoteIds[i]) !== 'veto' )
				)
				{
					_MakeButton ( elContainer, {
						id: 'id-phase-'+_m_nPhase+'-btn-'+aVoteIds[i],
						image: 'url("file://{images}/map_icons/screenshots/360p/'+mapName+'.png")',
						selectorimg: "file://{images}/mapdraft/red_x.png",
						name: '#SFUI_Map_' + mapName,
						statustext: '#matchdraft_vote_status_ban',
						ispick: _m_isThisPhasePick,
						mapstatus: MatchDraftAPI.GetIngameMapIdState( aVoteIds[i] ),
						voteid: aVoteIds[i]
					});
				}
			}
		}
	}

	var _MakeButton = function( elContainer, oBtnData )
	{
		var elButton = elContainer.FindChildInLayoutFile( oBtnData.id );

		if( !elButton)
		{
			elButton = $.CreatePanel( 'Button', elContainer, oBtnData.id );
			elButton.BLoadLayoutSnippet( 'ButtonMapTile' );
			var bgImage = elButton.FindChildInLayoutFile('draft-phase-button-image');
			bgImage.style.backgroundImage = oBtnData.image;
			bgImage.style.backgroundPosition = '50% 0%';
			bgImage.style.backgroundSize = 'auto 100%';

			elButton.FindChildInLayoutFile('draft-phase-button-selectorimg').SetImage( oBtnData.selectorimg );
			elButton.SetDialogVariable( 'mapname', $.Localize( oBtnData.name ) ) ;
			
			var elStatusText = elButton.FindChildInLayoutFile('draft-phase-button-statustext');	
			elStatusText.text = $.Localize( oBtnData.statustext );

			elButton.SetPanelEvent( 'onactivate', _OnActivateVoteTile.bind( undefined, elContainer, oBtnData ) );
			
			elButton.SetPanelEvent( 'onmouseover', function(){
				if( elButton.enabled )
				{
					_PlaySoundEffect( 'UIPanorama.mainmenu_rollover' );
				}
			} );
			
			elButton.Data().voteid = oBtnData.voteid;
		}

		elButton.SetHasClass('map-draft-phase-button__status--positive', oBtnData.ispick );
		elButton.enabled = true;

		                                                      
		if( MatchDraftAPI.GetIngameTeamToActNow() !== GameStateAPI.GetPlayerTeamNumber( MyPersonaAPI.GetXuid() ) ||
			oBtnData.hasOwnProperty( 'mapstatus' ) && oBtnData.mapstatus === 'veto' )
		{
			elButton.SetHasClass('map-draft-phase-button--vetoed', oBtnData.mapstatus === 'veto');
			elButton.enabled = false;
			return;
		}

		                                   
		var aVotedXuids = MatchDraftAPI.GetIngameXuidsForVote( oBtnData.voteid ).split(',');
		elButton.SetHasClass( 'map-draft-phase-button--selected', aVotedXuids.indexOf( MyPersonaAPI.GetXuid() ) !== -1 );

		                                 
		if( MatchDraftAPI.GetIngameXuidsForVote( oBtnData.voteid ) )
		{
			var aVoteIds = MatchDraftAPI.GetIngameWinningVotes().split(',');
			elButton.SetHasClass( 'map-draft-phase-button--winning-vote', aVoteIds.indexOf( oBtnData.voteid ) !== -1 );
		}
		else
		{
			elButton.SetHasClass( 'map-draft-phase-button--winning-vote', false );
		}

		                               
		var elAvatarsContainer = elButton.FindChildInLayoutFile('id-map-draft-phase-avatars-container');
		elAvatarsContainer.RemoveAndDeleteChildren();

		for( var i = 0; i < aVotedXuids.length; i++ )
		{
			_MakeAvatar( aVotedXuids[i], elAvatarsContainer );
		}
	}

	var _OnActivateVoteTile = function( elContainer, oBtnData )
	{
		var aCurrentVotes = _GetCurrentVotes();
		                                                 

		                                                                               
		var matchingVoteSlot = aCurrentVotes.indexOf( parseInt( oBtnData.voteid ) );
		if( matchingVoteSlot !== -1 )
		{
			                                                                                          
			MatchDraftAPI.ActionIngameCastMyVote( _m_nPhase, matchingVoteSlot, 0 );
			_PlaySoundEffect( 'buymenu_select' );
			return;
		}

		                                            
		var aBtns = elContainer.Children().filter( btn => btn.Data().voteid );

		                                                                                             
		if( aBtns.length < 3 )
		{
			                                  
			   	                                                         
			   	 
			   		                                                                        
			   	 
			      
			MatchDraftAPI.ActionIngameCastMyVote( _m_nPhase, 0, oBtnData.voteid );
			_PlaySoundEffect( 'buymenu_purchase' );
			return;
		}

		                                   
		var freeSlot = _GetFirstFreeVoteSlot( aCurrentVotes );
		if( freeSlot !== null )
		{
			                                                                                               
			MatchDraftAPI.ActionIngameCastMyVote( _m_nPhase, freeSlot, oBtnData.voteid );
			_PlaySoundEffect( 'buymenu_purchase' );
		}
		else
		{
			                             
			aBtns.forEach( function( btn ){
				if( btn.BHasClass( 'map-draft-phase-button--selected' ) ){
					btn.RemoveClass( 'map-draft-phase-button--pulse' );
					btn.AddClass( 'map-draft-phase-button--pulse' );
				}
			});
			_PlaySoundEffect( 'buymenu_failure' );
		}
	}

	var _GetCurrentVotes = function()
	{
		var aCurrentVotes = [];
		
		                                                       
		for ( var i = 0; i < _GetNumVoteSlots(); i++ )
		{
			                                                                                                                  
			var voteId = MatchDraftAPI.GetIngameMyVoteInSlot(i);
			voteId = voteId ? voteId : 'empty'
			aCurrentVotes.push( voteId );
			                             
		}

		return aCurrentVotes;
	}

	var _GetFirstFreeVoteSlot = function( aCurrentVotes )
	{
		for ( var i = 0; i < aCurrentVotes.length; i++ )
		{
			                                                                 
			if( aCurrentVotes[i] === 'empty' )
			{
				return i;
			}
		}

		return null;
	}

	var _GetNumVoteSlots = function()
	{
		if( _m_nPhase === 1 || _m_nPhase === 5 )
		{
			return 1;
		}

		if( _m_nPhase === 2 )
		{
			return 2;
		}

		if( _m_nPhase === 3 )
		{
			return 3;
		}

		if( _m_nPhase === 4 )
		{
			return 1;
		}
	}

	var _UpdateActionText = function()
	{
		var isWaiting = MatchDraftAPI.GetIngameTeamToActNow() !== GameStateAPI.GetPlayerTeamNumber( MyPersonaAPI.GetXuid());
		
		_m_cp.FindChildInLayoutFile( 'id-map-draft-phase-info').SetHasClass( 'map-draft-phase-info--hidden', isWaiting );
		_m_cp.FindChildInLayoutFile( 'id-map-draft-phase-waiting').SetHasClass( 'map-draft-phase-info--hidden', !isWaiting );

		if( isWaiting )
		{
			_m_cp.FindChildInLayoutFile( 'id-map-draft-phase-wait' ).text = $.Localize( '#matchdraft_phase_action_wait_' + _m_nPhase );
			return;
		}
		
		                                                                                          
		var elContainer = _m_rowsContainer.FindChildInLayoutFile( _m_rowPhaseName + _m_nPhase );
		var nPickedMaps = elContainer.Children().filter( btn => btn.BHasClass( 'map-draft-phase-button--selected' ));
		_m_cp.SetDialogVariableInt( 'maps', nPickedMaps.length );
		_m_phaseTitleText.text = $.Localize( '#matchdraft_phase_action_' + _m_nPhase, _m_cp );
	}

	var _MakeLargeMap = function( elContainer, style )
	{
		var aMapIds = MatchDraftAPI.GetIngameMapIdsList().split(',');
		var mapPickId = aMapIds.filter( id => MatchDraftAPI.GetIngameMapIdState( id ) === 'pick' )[0];
		var mapName = DeepStatsAPI.MapIDToString( parseInt( mapPickId ));
		var elMapImage = elContainer.FindChildInLayoutFile( 'id-map-draft-phase-pick-map-image' );

		if( !elMapImage )
		{
			elMapImage = $.CreatePanel( 'Panel', elContainer, 'id-map-draft-phase-pick-map-image' );
			elMapImage.BLoadLayoutSnippet( 'FinalMapPick' );
		}

		elMapImage.SetDialogVariable( 'mapname', $.Localize( '#SFUI_Map_' + mapName ) ) ;

		elMapImage.style.backgroundImage = 'url("file://{images}/map_icons/screenshots/360p/'+mapName+'.png")';
		elMapImage.style.backgroundPosition = '50% 0%';
		elMapImage.style.backgroundSize = 'auto 100%';
		elMapImage.style.backgroundImgOpacity = '.5';

		if( style )
		{
			elMapImage.AddClass( 'map-draft-phase-pick-map-image--large' );
			var nYourTeam = GameStateAPI.GetPlayerTeamNumber( MyPersonaAPI.GetXuid() );
			var nOtherTeam = nYourTeam === _m_nT ? _m_nCt : _m_nT;

			                                                            
			                                                                                
			var nStartingTeam = ( MatchDraftAPI.GetIngameTeamWithFirstChoice() === MatchDraftAPI.GetIngameTeamStartingCT() )
				? nOtherTeam : nYourTeam;

			                                         
			
			var teamLogo = nStartingTeam === _m_nT ? 't_logo.svg' : 'ct_logo.svg';
			var startingTeam = nStartingTeam === _m_nT ? '#CSGO_Inventory_Team_T' : '#CSGO_Inventory_Team_CT';

			elContainer.FindChildInLayoutFile( 'id-map-draft-starting-team' ).visible = true;
			elContainer.FindChildInLayoutFile('id-map-draft-starting-team-icon').SetImage( 
				"file://{images}/icons/" + teamLogo );

			elContainer.SetDialogVariable( 'teamname', $.Localize( startingTeam ));
		}
	}

	function _PopulatePlayerList()
	{
		var yourXuid = MyPersonaAPI.GetXuid();
		                                                                  
		
		                             

		                       
		var oPlayerList = GameStateAPI.GetPlayerDataJSO();

		                                                            
		var teamNames = ['TERRORIST', 'CT'];
		var iYourXuidTeamIdx = 1;
		for ( var iTeam = 0; iTeam < teamNames.length; ++iTeam )
		{
			var teamName = teamNames[iTeam];
			var players = {};
			
			if ( oPlayerList !== undefined && oPlayerList[teamName] )
			{
				players = oPlayerList[teamName];
			}

			if ( iTeam === 0 && Object.values(players).indexOf( yourXuid ) != -1 )
			{	                                                                                                   
				iYourXuidTeamIdx = 0;
			}

			                                                                   
			var teamPanelId = ( iYourXuidTeamIdx === iTeam ) ? 'id-map-draft-phase-your-team' : 'id-map-draft-phase-other-team';
			var elTeammates = _m_cp.FindChildInLayoutFile( teamPanelId ).FindChild( 'id-map-draft-phase-avatars' );
			elTeammates.RemoveAndDeleteChildren();

			for ( var j in players )
			{
				var xuid = players[j];
				
				if( !GameStateAPI.IsFakePlayer( xuid ) )
				{
					_MakeAvatar( xuid, elTeammates, true );
				}
			}
		}
	}

	var _CleanUpAvatars = function( xuids, elTeammates )
	{
		                                           
		                                                                                    
		var listOfTeammatesPanels = elTeammates.Children();
		listOfTeammatesPanels.forEach( function( element ) {
			if ( xuids.indexOf( element.id ) === -1 ||
				!GameStateAPI.IsPlayerConnected( element.id )) {
				element.AddClass('hidden');
			}
		});

		elTeammates.RemoveAndDeleteChildren();
	}

	var _MakeAvatar = function( xuid, elTeammates, bisTeamLister = false )
	{
		if( xuid === 0 )
		return;
		
		if( xuid )
		{
			var elAvatar = elTeammates.FindChildInLayoutFile( xuid );
			var panelType = bisTeamLister ? 'Button' : 'Panel';

			if( !elAvatar || elAvatar.BHasClass( 'hidden' ))
			{
				elAvatar = $.CreatePanel( panelType, elTeammates, xuid );
				elAvatar.BLoadLayoutSnippet( 'SmallAvatar' );

				if(bisTeamLister )
				{
					_AddOpenPlayerCardAction( elAvatar, xuid );
				}

				                                                                               
				    
				   	                               
				   	 
				   		                                         
				   		                                                            
				   		 
				   			                         
				   			                                            
				   			            
				   		 
				   	 

				   	             
				    

				                                                                                                      
			}

			elAvatar.FindChildTraverse('JsAvatarImage').steamid = xuid;
			var teamColor = GameStateAPI.GetPlayerColor( xuid );
			var elTeamColor = elAvatar.FindChildInLayoutFile( 'JsAvatarTeamColor' );
			                                   
			if ( !teamColor )
			{
				elTeamColor.visible = false;
			}
			else
			{
				elTeamColor.visible = true;
				elTeamColor.style.washColor = teamColor;
			}

			elAvatar.SetDialogVariable( 'teammate_name', FriendsListAPI.GetFriendName( xuid ));
		}
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


	return {
		Update : _Update,
		PopulatePlayerList: _PopulatePlayerList
	}
})();

( function ()
{
	MapDraft.Update();
})();

                                                              
                                           

                            
                                                            
                                      
                                                                                                                                                 
                                                                                                   
                                                                                                                                  

                                                                                                                           
                                                                                                                                  

                                                                                                                                                                                                                                                           
                                                                                                                                                   
                                                                                                                                          
                                                                                                                                                                                                                                                    
                                                                                                                                                        
                                                                                                                                                  



                           
    
                                                  
                                                
                                                 
                                           
                                                
                                             
     
