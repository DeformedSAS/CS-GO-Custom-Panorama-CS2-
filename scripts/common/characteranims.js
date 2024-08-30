'use strict';

var CharacterAnims = ( function()
{


	function _AddModifiersFromWeaponItemId ( itemId, arrModifiers )
	{
		  		                                             
		  		                                 

		  		                                                                   
		  		                                            

		var weaponName = ItemInfo.GetItemDefinitionName( itemId );
		arrModifiers.push( weaponName );

		var weaponType = InventoryAPI.GetWeaponTypeString( itemId );
		arrModifiers.push( weaponType );
	}

	function _NormalizeTeamName ( team, bShort = false )
	{
		team = String(team).toLowerCase();
		
		switch ( team )
		{
			case '2':
			case 't':
			case 'terrorist':
			case 'team_t':
				
				return bShort? 't' : 'terrorist';
			
			case '3':
			case 'ct':
			case 'counter-terrorist':
			case 'team_ct':
				return 'ct';
			
			default:
				return '';
			
		}
	}

	function _TeamForEquip ( team )
	{
		team = team.toLowerCase();
		
		switch ( team )
		{
			case '2':
			case 't':
			case 'terrorist':
			case 'team_t':
				
				return 't';
			
			case '3':
			case 'ct':
			case 'counter-terrorist':
			case 'team_ct':
				return 'ct';
			
			default:
				return '';
			
		}
	}
	

	var _PlayAnimsOnPanel = function ( importedSettings, bDontStompModel = false, makeDeepCopy = true )
	{
		  
		                                                       
		                                                   
		  

		                                                                                        
		                                                                                
		                         
		
		if ( importedSettings === null ) 
		{
			return;
		}

		var settings = makeDeepCopy ? ItemInfo.DeepCopyVanityCharacterSettings( importedSettings ) : importedSettings;

		if ( !settings.team || settings.team == "" )
			settings.team = 'ct';
		
		settings.team = _NormalizeTeamName( settings.team );

		if ( settings.modelOverride ) {
			settings.model = settings.modelOverride;
			          
			                            
			 
	  				                                                                        
			 
			          
		} else {
			                                                      
			settings.model = ItemInfo.GetModelPlayer( settings.charItemId );
			                                                               
			if ( !settings.model )
			{
				if ( settings.team == 'ct' )
					settings.model = "models/player/custom_player/legacy/ctm_sas.mdl";
				else
					settings.model = "models/player/custom_player/legacy/tm_phoenix.mdl";
			}
		}

		var wid = settings.weaponItemId;
		
		var playerPanel = settings.panel;
		_CancelScheduledAnim( playerPanel );
		_ResetLastRandomAnimHandle( playerPanel );
		
		playerPanel.ResetAnimation( false );
		playerPanel.SetSceneAngles( 0, 0, 0, false );

		if ( settings.manifest )
			playerPanel.SetScene( settings.manifest, settings.model, false );

		if ( !bDontStompModel )
		{
			playerPanel.SetPlayerCharacterItemID( settings.charItemId );
			playerPanel.SetPlayerModel( settings.model );
		}

		playerPanel.EquipPlayerWithItem( wid );
		playerPanel.EquipPlayerWithItem( settings.glovesItemId );

		playerPanel.ResetActivityModifiers();
		
		playerPanel.ApplyActivityModifier( settings.team );

		if ( !( 'arrModifiers' in settings ) )
		{
			settings.arrModifiers = [];
		}

		_AddModifiersFromWeaponItemId( wid, settings.arrModifiers );

		settings.arrModifiers.forEach( mod => playerPanel.ApplyActivityModifier( mod ) );
		
		if ( !('activity' in settings ) || settings.activity == "" )
		{
			settings.activity = 'ACT_CSGO_UIPLAYER_IDLE';
		}
		
  		                                                  
		
		if ( !( 'immediate' in settings ) || settings.immediate == "" )
		{
			settings.immediate = true;
		}

		playerPanel.PlayActivity( settings.activity, settings.immediate );

		var cam = 1;

		if ( 'cameraPreset' in settings )
		{
			cam = settings.cameraPreset;
			                                               
		}

		playerPanel.SetCameraPreset( Number( cam ), false );

		           

		if ( 'flashlightAmount' in settings && settings.flashlightAmount !== '' )
		{
			                                                                         
			playerPanel.SetFlashlightAmount( settings.flashlightAmount );
		}

		if ( 'flashlightColor' in settings && settings.flashlightColor !== '' )
		{
			                                                                       
			playerPanel.SetFlashlightColor( settings.flashlightColor[ 0 ], settings.flashlightColor[ 1 ], settings.flashlightColor[ 2 ] );
		}


		if ( 'ambientLightColor' in settings && settings.ambientLightColor !== '' )
		{
			                                                                            
			playerPanel.SetAmbientLightColor( settings.ambientLightColor[ 0 ], settings.ambientLightColor[ 1 ], settings.ambientLightColor[ 2 ] );
		}

	};

	var _CancelScheduledAnim = function ( playerPanel )
	{
		                                                                                             
		if ( playerPanel.Data().handle )
		{
			$.CancelScheduled( playerPanel.Data().handle );
			playerPanel.Data().handle = null;
		}
	};

	var _ResetLastRandomAnimHandle = function ( playerPanel)
	{
		if ( playerPanel.Data().lastRandomAnim !== -1 ) {
			playerPanel.Data().lastRandomAnim = -1;
		}
	};

	var _GetValidCharacterModels = function( bUniquePerTeamModelsOnly )
	{

		InventoryAPI.SetInventorySortAndFilters ( 'inv_sort_rarity', false, 'customplayer', '', '' );
		var count = InventoryAPI.GetInventoryCount();
		var itemsList = [];
		var uniqueTracker = {};

		for( var i = 0 ; i < count ; i++ )
		{
			var itemId = InventoryAPI.GetInventoryItemIDByIndex( i );
			
			var modelplayer = ItemInfo.GetModelPlayer( itemId );
			if ( !modelplayer )
				continue;

			var team = ( ItemInfo.GetTeam( itemId ).search( 'Team_T' ) === -1 ) ? 'ct' : 't';
			if ( bUniquePerTeamModelsOnly )
			{	                                           
				if ( uniqueTracker.hasOwnProperty( team + modelplayer ) )
					continue;
				uniqueTracker[ team + modelplayer ] = 1;
			}

			var label = ItemInfo.GetName( itemId );
			var entry = {
				label: label,
				team: team,
				itemId: itemId
			};

			itemsList.push( entry );
		}

		return itemsList;


	};


	return {
		PlayAnimsOnPanel			: _PlayAnimsOnPanel,
		CancelScheduledAnim			: _CancelScheduledAnim,
		GetValidCharacterModels		: _GetValidCharacterModels,
		NormalizeTeamName			: _NormalizeTeamName
	};
})();