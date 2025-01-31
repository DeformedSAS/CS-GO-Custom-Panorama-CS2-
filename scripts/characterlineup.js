'use strict';



var CharacterLineUp = ( function()
{
	const MAX_CHARACTERS = 10;

	function _Init ( elCLU, oSettings )
	{
		if ( !elCLU || !elCLU.Data() )
			return;

		elCLU.Data().m_characterShowDelay = oSettings[ 'characterShowDelay' ];
		elCLU.Data().m_displayCommendButton = oSettings[ 'displayCommendButton' ];
		elCLU.Data().m_overrideCharacterSpacing = oSettings[ 'overrideCharacterSpacing' ];

		elCLU.Data().m_elModelContainer = elCLU.FindChildTraverse( 'id-charlineup__characters' );
		elCLU.Data().m_arrPlayerMasterList = [];

		elCLU.Data().m_bInitialized = true;

		elCLU.Data().m_elModelContainer.RemoveAndDeleteChildren();

		_UpdatePanels( elCLU );

	}

	function _UpdatePanels ( elCLU )
	{
		elCLU.Data().m_arrPlayerMasterList.forEach( function( xuid, index )
		{
			var elPlayer = elCLU.FindChildTraverse( "id-charlineup__character-" + xuid );

			_UpdatePanel( elCLU, elPlayer, index );

		} );
	}

	function _UpdatePanel ( elCLU, elPlayer, index )
	{
		if ( elCLU.Data().m_overrideCharacterSpacing !== true )
		{
			if ( elCLU.Data().m_arrPlayerMasterList.length == 0 )
			{
				elPlayer.style.width = '15%';
			}
			else
			{
				var nChars = elCLU.Data().m_arrPlayerMasterList.length;

				var desiredWidth = ( 100 / nChars ) + 100;
				var width = Math.min( desiredWidth, 50 );

				var margin = ( 100 - ( nChars * width ) ) / nChars / 2;

				                                                             
				elPlayer.style.width = width + '%';

				                                                     
				var pos = index * ( 100 / nChars ) + margin;
				elPlayer.style.position = pos + '% 0% 0%';

				                                                            
			}
		}
	}

	function _CreatePlayerModelPanel ( elCLU, xuid )
	{

		var elPlayer = $.CreatePanel( "Panel", elCLU.Data().m_elModelContainer, "id-charlineup__character-" + xuid );
		elPlayer.BLoadLayoutSnippet( "snippet_characters_player" );

		                                        
		var positionIndex = elCLU.Data().m_elModelContainer.Children().length;
		elPlayer.AddClass( "charlineup__character--pos-" + positionIndex );

		return elPlayer;
	}

	function _SetCharacter (
		elCLU,
		label,
		oPlayer,
			  
			             
			         
			         
			               
			              
			         
			  
		oOptions )
	{

		var elPlayer = elCLU.FindChildTraverse( "id-charlineup__character-" + label );
		if ( !elPlayer )
		{
			elPlayer = _CreatePlayerModelPanel( elCLU, label );
		}

		       
		elPlayer.SetDialogVariable( "player_name", oPlayer[ 'name' ] );

		var teamColor = oPlayer[ 'teamcolor' ];
		var teamName = oPlayer[ 'teamnumber' ] == "2" ? "TERRORIST" : "CT";
		var xuid = oPlayer[ 'xuid' ];
		var isBot = oPlayer[ 'isbot' ];

		var elPlayerName = elPlayer.FindChildTraverse( "id-charlineup__player__name" );
		if ( elPlayerName )
		{
			if ( teamColor !== "" )
			{
				elPlayerName.style.color = teamColor;
			}
		}

		         
		var elAvatarImage = elPlayer.FindChildTraverse( "id-charlineup__player__avatar" );
		if ( elAvatarImage )
		{
			if ( !isBot )
			{
				elAvatarImage.steamid = xuid;
			}
			else
			{
				elAvatarImage.SetDefaultImage( "file://{images}/icons/scoreboard/avatar-" + teamName + ".png" );
			}

			if ( teamColor !== "" )
			{
				elAvatarImage.style.border = "1px solid " + teamColor;
			}
		}

		var myTeamName = MockAdapter.GetPlayerTeamName( MockAdapter.GetLocalPlayerXuid() );

		          
		  
		if ( ( xuid != MockAdapter.GetLocalPlayerXuid() ) && !GameStateAPI.IsFakePlayer( xuid ) && ( myTeamName == teamName ) && ( elCLU.Data().m_displayCommendButton ) )
		{
			var onActivate = function( _xuid )
			{
				UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_commend_player.xml', 'xuid=' + _xuid );
				$.DispatchEvent( 'ContextMenuEvent', '' );
			}

			var elCommendButton = elPlayer.FindChildTraverse( "id-charlineup__player__commend" );
			if ( elCommendButton )
			{
				elCommendButton.RemoveClass( "hidden" );
				elCommendButton.SetPanelEvent( 'onactivate', onActivate.bind( undefined, xuid ) );
			}
		}

		                                  

		if ( !( 'team' in oOptions ) || oOptions[ 'team' ] == "" )
		{
			var shortTeam = ( teamName == "CT" ) ? 'ct' : 't';

			oOptions[ 'team' ] = shortTeam;
		}

		                                                                    
		if ( oPlayer[ 'items' ] )
		{
			for ( var idxItem = 0; idxItem < oPlayer[ 'items' ].length; ++idxItem )
			{
				var ullItemID = oPlayer[ 'items' ][ idxItem ].itemid;
				if ( !ullItemID ) continue;
				var strItemSlot = InventoryAPI.GetSlot( ullItemID );
			
				if ( strItemSlot === 'customplayer' )
				{	                              
					oOptions[ 'charItemId' ] = ullItemID;
				}
				else if ( strItemSlot === 'clothing' )
				{	                      
					oOptions[ 'glovesItemId' ] = ullItemID;
				}
				else
				{	                                                          
					oOptions[ 'weaponItemId' ] = ullItemID;
					break;                                                   
				}
			}
		}

		if ( !( 'cameraPreset' in oOptions ) || oOptions[ 'cameraPreset' ] == "" )
		{
			oOptions[ 'cameraPreset' ] = 10;
		}

		if ( !( 'manifest' in oOptions ) || oOptions[ 'manifest' ] == "" )
		{
			oOptions[ 'manifest' ] = "resource/ui/econ/ItemModelPanelCharWeaponInspect.res";
		}

		if ( !( 'panelPosition' in oOptions ) || oOptions[ 'panelPosition' ] == "" )
		{
			oOptions[ 'panelPosition' ] = "0";
		}

		var elPlayerModelPreviewPanel = elPlayer.FindChildTraverse( "id-charlineup__model-preview-panel" );

		oOptions[ 'panel' ] = elPlayerModelPreviewPanel;

		elPlayer.Data().m_oModelSettings = oOptions;

		elPlayer.style.zIndex = Number( oOptions[ 'panelPosition' ] );

		return elPlayer;
	}

	function _ShowCharacter ( elCLU, xuid )
	{
		                                                              
		if ( !elCLU.IsValid() )
			return;

		                         
		var elPlayer = elCLU.FindChildTraverse( "id-charlineup__character-" + xuid );

		var options = elPlayer.Data().m_oModelSettings;
		CharacterAnims.PlayAnimsOnPanel( options );

		elPlayer.AddClass( 'reveal' );
	}

	function _DisplayAll ( elCLU )
	{
		var time = 0;

		time += _ShowPlayers( elCLU );

		  		                                      

		return time;
	}

	function _AddPlayer (
		elCLU,
		label,
		oPlayer,
			  
			             
			         
			         
			               
			              
			         
			  
		oOptions = {
			display_immediately: true,
			manifest: "",
			cameraPreset: "",
			panelPosition: "",
			flashlightColor: "",
      flashlightAmount: "",
      ambientLightColor: "",
		} )
	{
		var arrPlayerMasterList = elCLU.Data().m_arrPlayerMasterList;

		if ( !elCLU.Data().m_bInitialized )
			return;

		if ( arrPlayerMasterList.includes( label ) )
			return;

		if ( arrPlayerMasterList.length >= MAX_CHARACTERS )
			return;

		arrPlayerMasterList.push( label );

		var elPlayer = _SetCharacter( elCLU, label, oPlayer, oOptions );

		                                            
		  	                                                                                                                                       

		if ( oOptions[ 'display_immediately' ] )
		{
			_ShowCharacter( elCLU, label );
		}

		_UpdatePanels( elCLU );

		return elPlayer;
	}

	function _ShowPlayers ( elCLU )
	{
		var timeline = 0;

		elCLU.Data().m_arrPlayerMasterList.forEach( function( label )
		{

			$.Schedule( timeline, _ShowCharacter.bind( undefined, elCLU, label ) );

			timeline += elCLU.Data().m_characterShowDelay;
		} );

		return timeline;
	}

	function _RemovePlayer ( elCLU, label )
	{
		var elPlayer = elCLU.FindChildTraverse( "id-charlineup__character-" + label );

		if ( elPlayer )
		{
			elPlayer.DeleteAsync( .0 );
			arrPlayerMasterList.splice( arrPlayerMasterList.indexOf( label ), 1 );
		}
	}

	                                                                 
	function _Filter ( elCLU, filterFn )
	{
		var arrPlayerMasterList = elCLU.Data().m_arrPlayerMasterList;
		arrPlayerMasterList.forEach( label =>
		{
			if ( !filterFn( label ) )
			{
				var elPlayer = elCLU.FindChildTraverse( "id-charlineup__character-" + label );

				if ( elPlayer )
				{
					elPlayer.DeleteAsync( .0 );
					arrPlayerMasterList.splice( arrPlayerMasterList.indexOf( label ), 1 );
				}

			}
		} );

		_UpdatePanels( elCLU );

	}

	function _GetPlayerPanel ( elCLU, label )
	{
		return elCLU.FindChildTraverse( "id-charlineup__character-" + label );
	}


	                      
	return {
		Init: _Init,
		AddPlayer: _AddPlayer,
		DisplayAll: _DisplayAll,
		Filter: _Filter,
		GetPlayerPanel: _GetPlayerPanel,
		RemovePlayer: _RemovePlayer,
	};
} )();


                                                                                                    
                                           
                                                                                                    
( function()
{

} )();
