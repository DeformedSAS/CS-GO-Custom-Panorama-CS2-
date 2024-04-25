'use strict';

var ItemInfo = ( function() {
	var _GetRarityColor = function( id )
	{
		return InventoryAPI.GetItemRarityColor( id );
	};

                                    
	var _GetFormattedName = function ( id )
	{
	    var strName = _GetName( id );

	    if ( InventoryAPI.HasCustomName( id ) )
	    {
	        return new CFormattedText( '#CSGO_ItemName_Custom', { item_name: strName } );
	    }
	    else
	    {
	                                                                                                   
	        var splitLoc = strName.indexOf('|');
            
	        if ( splitLoc >= 0 )
	        {
	            var strWeaponName = strName.substr( 0, splitLoc ).trimRight();                                          
	            var strPaintName  = strName.substr( splitLoc + 1 ).trimLeft();                                      

	            return new CFormattedText( '#CSGO_ItemName_Painted', { item_name: strWeaponName, paintkit_name: strPaintName } );
	        }

	        return new CFormattedText( '#CSGO_ItemName_Base', { item_name: strName } );
	    }
	};

	var _AddItemToShuffle = function( id, team )
	{
		return LoadoutAPI.AddItemToShuffle( id, team );
	};

	var _RemoveItemFromShuffle = function( id, team )
	{
		return LoadoutAPI.RemoveItemFromShuffle( id, team );
	};

	var _IsItemInShuffleForTeam = function( id, team )
	{
		return LoadoutAPI.IsItemInShuffleForTeam( id, team );
	};

	var _ClearShuffle = function( id, team )
	{
		return LoadoutAPI.ClearShuffle ( id, team );
	};

	var _SetShuffleEnabled = function ( id, team, enable )
	{
		return LoadoutAPI.SetShuffleEnabled( id, team, enable );
	};

	var _IsShuffleEnabled = function ( id, team )
	{
		return LoadoutAPI.IsShuffleEnabled( id, team );
	};

	var _IsShuffleAllowed = function ( id )
	{
		return LoadoutAPI.IsShuffleAllowed( id );
	};

	var _CountItemsInInventoryForShuffleSlot = function ( id, team )
	{
		return LoadoutAPI.CountItemsInInventoryForShuffleSlot( id, team );
	};

	var _EnsureShuffleItemEquipped = function ( itemID, team )
	{
		var equippedItemID = ItemInfo.GetItemIdForItemEquippedInLoadoutSlot( itemID, team );
		if ( !LoadoutAPI.IsItemInShuffleForTeam( equippedItemID, team ) )
		{
			LoadoutAPI.ShuffleEquipmentInSlot( equippedItemID, team );
		}
	};

	var _GetName = function( id )
	{
		return InventoryAPI.GetItemName( id );
	};

	var _IsEquippedForCT = function( id )
	{
		return InventoryAPI.IsEquipped( id, 'ct' );
	};

	var _IsEquippedForT = function( id )
	{
		return InventoryAPI.IsEquipped( id, 't' );
	};

	var _IsEquippedForNoTeam = function( id )
	{
		return InventoryAPI.IsEquipped( id, "noteam" );
	};

	var _IsEquipped = function( id, team )
	{
		return InventoryAPI.IsEquipped( id, team );
	};

	var _GetSlot = function( id )
	{
		return InventoryAPI.GetSlot( id );
	};

	var _GetSlotSubPosition = function( id )
	{
		return InventoryAPI.GetSlotSubPosition( id );
	};

	var _IsLoadoutSlotSubPositionAWeapon = function( slotSubPosition )
	{
		return InventoryAPI.IsLoadoutSlotSubPositionAWeapon( slotSubPosition );
	};	

	var _GetTeam = function( id )
	{
		return InventoryAPI.GetItemTeam( id );
	};

	var _IsSpraySealed = function( id )
	{
		return InventoryAPI.DoesItemMatchDefinitionByName( id, 'spray' );
	};

	var _IsSprayPaint = function( id )
	{
		return InventoryAPI.DoesItemMatchDefinitionByName( id, 'spraypaint' );
	};

	var _IsTradeUpContract = function ( id )
	{
		return InventoryAPI.DoesItemMatchDefinitionByName( id, 'Recipe Trade Up' );
	};

	var _GetSprayTintColor = function( id )
	{
		return InventoryAPI.GetSprayTintColorCode( id );
	};

	var _IsTool = function( id )
	{
		return InventoryAPI.IsTool( id );
	};

	var _GetCapabilitybyIndex = function( id, index )
	{
		return InventoryAPI.GetItemCapabilityByIndex( id, index );
	};

	var _GetCapabilityCount = function( id )
	{
		return InventoryAPI.GetItemCapabilitiesCount( id );
	};

	var _ItemHasCapability = function( id, capName )
	{
		var caps = [];
		var capCount = _GetCapabilityCount( id );

		for ( var i = 0; i < capCount; i++ )
		{
			caps.push( _GetCapabilitybyIndex( id, i ) );
		}

		return caps.includes( capName );
	};

	var _GetChosenActionItemsCount = function( id, capability )
	{
		return InventoryAPI.GetChosenActionItemsCount( id, capability );
	};

	var _GetChosenActionItemIDByIndex = function( id, capability, index )
	{
		return InventoryAPI.GetChosenActionItemIDByIndex( id, capability, index );
	};

	var _GetKeyForCaseInXray = function( caseId )
	{
		var numActionItems = _GetChosenActionItemsCount( caseId, 'decodable' );
		if ( numActionItems > 0 )
		{
			                                                      
			var aKeyIds = [];
			for ( var i = 0; i < numActionItems; i++ )
			{
				aKeyIds.push( _GetChosenActionItemIDByIndex( caseId, 'decodable', i ) );
			}

			aKeyIds.sort( function( a, b ) { return a - b; } );
			return aKeyIds[ 0 ];
		}

		return '';
	};

	var _GetItemsInXray = function()
	{
		InventoryAPI.SetInventorySortAndFilters( 'inv_sort_age', false, 'xraymachine', '', '' );
		var count = InventoryAPI.GetInventoryCount();

		if ( count === 0 )
		{
			return {};
		}

		var xrayCaseId = '';
		var xrayRewardId = '';
		for ( var i = 0; i < count; i++ )
		{
			var id = InventoryAPI.GetInventoryItemIDByIndex( i );

			xrayRewardId = i === 0 ? id : xrayRewardId;
			xrayCaseId = i === 1 ? id : xrayCaseId;
		}

		return { case: xrayCaseId, reward: xrayRewardId };
	};

	var _GetLoadoutWeapons = function( team )
	{
		team =	CharacterAnims.NormalizeTeamName( team, true );

		var list = [];

		var slotStrings = LoadoutAPI.GetLoadoutSlotNames( false );
		var slots = JSON.parse( slotStrings );

		slots.forEach( slot => 
		{
			var weaponItemId = LoadoutAPI.GetItemID( team, slot );

			var bIsWeapon = ItemInfo.IsWeapon( weaponItemId );

			if ( bIsWeapon )
			{
				list.push( weaponItemId );
			}
		} );

		return list;
	}

	var _DeepCopyVanityCharacterSettings = function( inVanityCharacterSettings )
	{
		var modelRenderSettingsOneOffTempCopy =                                                                     
			JSON.parse( JSON.stringify( inVanityCharacterSettings ) );
		modelRenderSettingsOneOffTempCopy.panel = inVanityCharacterSettings.panel;
		return modelRenderSettingsOneOffTempCopy;
	}

	var _PrecacheVanityCharacterSettings = function( inVanityCharacterSettings )
	{
		if ( inVanityCharacterSettings.weaponItemId )
			InventoryAPI.PrecacheCustomMaterials( inVanityCharacterSettings.weaponItemId );
		if ( inVanityCharacterSettings.glovesItemId )
			InventoryAPI.PrecacheCustomMaterials( inVanityCharacterSettings.glovesItemId );
	}

	var _GetOrUpdateVanityCharacterSettings = function( optionalCharacterItemId, optionalState )
	{
		var oSettings = {
			panel: undefined,
			activity: undefined,                                                        
			team: undefined,
			charItemId: undefined,
			loadoutSlot: undefined,
			weaponItemId: undefined,
			glovesItemId: undefined,
			cameraPreset: undefined,
			arrModifiers:  [],
		};

		  
		                                              
		  
		if ( optionalCharacterItemId && InventoryAPI.IsValidItemID( optionalCharacterItemId ) )
		{
			var charTeam = ItemInfo.GetTeam( optionalCharacterItemId );
			if ( charTeam.search( 'Team_CT' ) !== -1 )
				oSettings.team = 'ct';
			else if ( charTeam.search( 'Team_T' ) !== -1 )
				oSettings.team = 't';

			if ( oSettings.team )
				oSettings.charItemId = optionalCharacterItemId;
		}

		  
		                                          
		                                                                   
		  
		if ( !oSettings.team )
		{
			oSettings.team = GameInterfaceAPI.GetSettingString( 'ui_vanitysetting_team' );
			if ( oSettings.team !== 'ct' && oSettings.team !== 't' )
			{
				oSettings.team = ( Math.round( Math.random() ) > 0 ) ? 'ct' : 't';
				                                                   
				GameInterfaceAPI.SetSettingString( 'ui_vanitysetting_team', oSettings.team );
			}
		}

		var _fnRollRandomLoadoutSlotAndWeapon = function( strTeam ) {
			var myResult = {
				loadoutSlot: '',
				weaponItemId: ''
			};
			var slots = JSON.parse( LoadoutAPI.GetLoadoutSlotNames( false ) );
			while ( slots.length > 0 )
			{
				var nRandomSlotIndex = Math.floor( Math.random() * slots.length );
				myResult.loadoutSlot = slots.splice( nRandomSlotIndex, 1 )[ 0 ];                                     
				myResult.weaponItemId = LoadoutAPI.GetItemID( strTeam, myResult.loadoutSlot );
				if ( ItemInfo.IsWeapon( myResult.weaponItemId ) )
					break;	                                                                  
			}
			return myResult;
		}

		  
		                                                    
		  
		oSettings.loadoutSlot = GameInterfaceAPI.GetSettingString( 'ui_vanitysetting_loadoutslot_' + oSettings.team );
		oSettings.weaponItemId = LoadoutAPI.GetItemID( oSettings.team, oSettings.loadoutSlot );
		if ( !ItemInfo.IsWeapon( oSettings.weaponItemId ) )
		{	                                                                                              
			                                      
			var randomResult = _fnRollRandomLoadoutSlotAndWeapon( oSettings.team );
			oSettings.loadoutSlot = randomResult.loadoutSlot;
			oSettings.weaponItemId = randomResult.weaponItemId;
			                                                                                                
			                                                          
			GameInterfaceAPI.SetSettingString( 'ui_vanitysetting_loadoutslot_' + oSettings.team, oSettings.loadoutSlot );
		}

		  
		                  
		  
		oSettings.glovesItemId = LoadoutAPI.GetItemID( oSettings.team, 'clothing_hands' );

		  
		                                                                   
		  
		if ( !oSettings.charItemId )
			oSettings.charItemId = LoadoutAPI.GetItemID( oSettings.team, 'customplayer' );

		  
		                                                       
		                                                         
		                                        
		  
		if ( optionalState && optionalState === 'unowned' )
		{
			var randomResult = _fnRollRandomLoadoutSlotAndWeapon( oSettings.team );
			oSettings.loadoutSlot = randomResult.loadoutSlot;
			oSettings.weaponItemId = LoadoutAPI.GetDefaultItem( oSettings.team, oSettings.loadoutSlot );
			oSettings.glovesItemId = LoadoutAPI.GetDefaultItem( oSettings.team, 'clothing_hands' );
		}

		return oSettings;
	}

	var _GetStickerSlotCount = function( id )
	{
		return InventoryAPI.GetItemStickerSlotCount( id );
	};

	var _GetStickerCount = function( id )
	{
		return InventoryAPI.GetItemStickerCount( id );
	};

	var _GetitemStickerList = function( id )
	{
		var count = _GetStickerCount( id );
		var stickerList = [];

		for ( var i = 0; i < count; i++ )
		{
			var image = _GetStickerImageByIndex( id, i );
			var oStickerInfo = {
				image: _GetStickerImageByIndex( id, i ),
				name: _GetStickerNameByIndex( id, i )
			}
			stickerList.push( oStickerInfo );
		}

		return stickerList;
	};

	var _GetStickerImageByIndex = function( id, index )
	{
		return InventoryAPI.GetItemStickerImageByIndex( id, index );
	};

	var _GetStickerNameByIndex = function( id, index )
	{
		return InventoryAPI.GetItemStickerNameByIndex( id, index )
	};

	var _GetItemPickUpMethod = function( id )
	{
		return InventoryAPI.GetItemPickupMethod( id );
	};

	var _GetLoadoutPrice = function( id, subposition )
	{
		var team = _IsEquippedForCT( id ) ? 'ct' : 't';
		return LoadoutAPI.GetItemGamePrice( team, _GetSlotSubPosition( id ).toString() );
	};

	var _GetStoreOriginalPrice = function( id, count, rules )
	{
		                                                                      
		                                                                            
		                                                                                                   
		return StoreAPI.GetStoreItemOriginalPrice( id, count, rules ? rules : '' );
	};

	var _GetStoreSalePrice = function( id, count, rules )
	{
		                                                                      
		                                                                            
		                                                                                                   
		return StoreAPI.GetStoreItemSalePrice( id, count, rules ? rules : '' );
	};

	var _GetStoreSalePercentReduction = function( id, count )
	{
		return StoreAPI.GetStoreItemPercentReduction( id, count );                                                 
	};

	var _ItemPurchase = function( id )
	{
		                                                
		                                                    
		StoreAPI.StoreItemPurchase( id );
	};

	var _IsStatTrak = function( id )
	{
		var numIsStatTrak = InventoryAPI.GetRawDefinitionKey( id , "will_produce_stattrak" );

		return ( Number( numIsStatTrak ) === 1 ) ? true : false;
	};

	var _IsEquippalbleButNotAWeapon = function( id )
	{
		var subSlot = _GetSlotSubPosition( id );
		return ( subSlot === "flair0" || subSlot === "musickit" || subSlot === "spray0" || subSlot === "customplayer" );
	};

	var _IsEquippableThroughContextMenu = function( id )
	{
		var subSlot = _GetSlotSubPosition( id );
		return ( subSlot === "flair0" || subSlot === "musickit" || subSlot === "spray0"  );
	};

	var _IsWeapon = function( id )
	{
		var schemaString = InventoryAPI.BuildItemSchemaDefJSON( id );

		if ( !schemaString )
			return false;
		
		var itemSchemaDef = JSON.parse( schemaString );	
		
		return ( itemSchemaDef[ "craft_class" ] === "weapon" );
	};

	var _IsCharacter = function( id )
	{
		return ( _GetSlotSubPosition( id ) === "customplayer" );
	}

	var _IsItemCt = function( id )
	{
		return _GetTeam( id ) === '#CSGO_Inventory_Team_CT';
	};
		
	var _IsItemT = function( id )
	{
		return _GetTeam( id ) === '#CSGO_Inventory_Team_T';
	};

	var _IsItemAnyTeam = function( id )
	{
		return _GetTeam( id ) === '#CSGO_Inventory_Team_Any';
	};

	var _GetItemDefinitionName = function( id )
	{
		return InventoryAPI.GetItemDefinitionName( id );
	};

	var _ItemMatchDefName = function( id, defName )
	{
		return InventoryAPI.DoesItemMatchDefinitionByName( id, defName );
	};

	var _ItemDefinitionNameSubstrMatch = function( id, defSubstr )
	{
		var itemDefName = InventoryAPI.GetItemDefinitionName( id );
		return ( itemDefName && ( itemDefName.indexOf( defSubstr ) != -1 ) );
	};

	var _GetFauxReplacementItemID = function( id, purpose )
	{
		                                                                                 
		                                                                                
		                                
		if ( purpose === 'graffiti' )
		{
			if ( _ItemDefinitionNameSubstrMatch( id, 'tournament_journal_' ) )
			{
				return _GetFauxItemIdForGraffiti( parseInt( InventoryAPI.GetItemAttributeValue( id, 'sticker slot 0 id' ) ));
			}
		}
		return id;
	};

	var _GetFauxItemIdForGraffiti = function( stickestickerid_graffiti )
	{
		                                                                                 
		                                                                                
		                                
		
		return InventoryAPI.GetFauxItemIDFromDefAndPaintIndex(                
			1349, stickestickerid_graffiti );
	};

	var _GetItemIdForItemEquippedInLoadoutSlot = function( id, team )
	{
		return LoadoutAPI.GetItemID( team, _GetSlotSubPosition( id ) );
	};

	                                              
	    
	   	                                                  
	   	
	   	                                                          
	   	                                                        
	   	 
	   		                                        
	   		 
	   			                                  
	   		    
	   	    
	     
	
	var _ItemsNeededToTradeUp = function( id )
	{
		return InventoryAPI.GetNumItemsNeededToTradeUp( id );
	};

	var _GetGifter = function( id )
	{
		var xuid = InventoryAPI.GetItemGifterXuid( id );
		
		return xuid !== undefined ? xuid : '';
	};

	var _GetSet = function( id )
	{
		var setName = InventoryAPI.GetSet( id );

		return setName !== undefined ? setName : '';
	};

	var _GetModelPath = function( id, itemSchemaDef )
	{
		var isMusicKit = _ItemMatchDefName( id, 'musickit' );
		var issMusicKitDefault = _ItemMatchDefName( id, 'musickit_default' );
		var isSpray = itemSchemaDef.name === 'spraypaint';
		var isSprayPaint = itemSchemaDef.name === 'spray';
		var isFanTokenOrShieldItem = itemSchemaDef.name && itemSchemaDef.name.indexOf( 'tournament_journal_' ) != -1;
	
		                                                                    
		                                                       
		if ( isSpray || isSprayPaint || isFanTokenOrShieldItem )
			return 'vmt://spraypreview_' + id;
		else if ( _IsSticker( id ) || _IsPatch( id ) )
			return 'vmt://stickerpreview_' + id;
		else if ( itemSchemaDef.hasOwnProperty( "model_player" ) || isMusicKit || issMusicKitDefault )
			return 'img://inventory_' + id;
	};

	                                                                        
	var _GetModelPlayer = function( id )
	{
		var schemaString = InventoryAPI.BuildItemSchemaDefJSON( id );

		if ( !schemaString )
			return "";
		
		var itemSchemaDef = JSON.parse( schemaString );		
		var modelPlayer = itemSchemaDef[ "model_player" ];

		return modelPlayer;

	}

	function _IsSticker( itemId )
	{
		return _ItemMatchDefName( itemId, 'sticker' );
	}

	function _IsPatch( itemId )
	{
		return _ItemMatchDefName( itemId, 'patch' );
	}

	var _GetDefaultCheer = function( id )
	{
		var schemaString = InventoryAPI.BuildItemSchemaDefJSON( id );
		var itemSchemaDef = JSON.parse( schemaString );		

		if ( itemSchemaDef[ "default_cheer" ] )
			return itemSchemaDef[ "default_cheer" ]
		else
			return "";
	}

	var _GetVoPrefix = function( id )
	{
		var schemaString = InventoryAPI.BuildItemSchemaDefJSON( id );
		var itemSchemaDef = JSON.parse( schemaString );		

		return itemSchemaDef[ "vo_prefix" ];
	}

	var _GetModelPathFromJSONOrAPI = function( id )
	{
		                                
		if ( id === '' || id === undefined || id === null )
		{
			return '';
		}
		
		var pedistalModel = '';
		var schemaString = InventoryAPI.BuildItemSchemaDefJSON( id );
		var itemSchemaDef = JSON.parse( schemaString );
		
		if ( _GetSlotSubPosition( id ) === "flair0" )
		{
			pedistalModel = itemSchemaDef.hasOwnProperty( 'attributes' ) ? itemSchemaDef.attributes[ "pedestal display model" ] : '';
		}
		else if( _ItemHasCapability( id, 'decodable' ) )
		{
			                                  

			pedistalModel = itemSchemaDef.hasOwnProperty( "model_player" ) ? itemSchemaDef.model_player : '';
			                                                   
		}

		return ( pedistalModel === '' ) ? _GetModelPath( id, itemSchemaDef ) : pedistalModel;
	};

	var _GetLootListCount = function( id )
	{
		return InventoryAPI.GetLootListItemsCount( id );
	};

	var _GetLootListItemByIndex = function( id, index )
	{
		return InventoryAPI.GetLootListItemIdByIndex( id, index );
	};

	var _GetMarketLinkForLootlistItem = function( id )
	{
		var appID = SteamOverlayAPI.GetAppID();
		var communityUrl = SteamOverlayAPI.GetSteamCommunityURL();
		var strName = _GetName( id );
		
		return communityUrl + "/market/search?appid=" + appID + "&lock_appid=" + appID + "&q=" + strName;
	};

	var _GetToolType = function( id )
	{
		return InventoryAPI.GetToolType( id );
	};

	function _FindAnyUserOwnedCharacterItemID()
	{
		InventoryAPI.SetInventorySortAndFilters( 'inv_sort_rarity', false, 'customplayer,not_base_item', '', '' );
		var count = InventoryAPI.GetInventoryCount();
		return ( count > 0 ) ? InventoryAPI.GetInventoryItemIDByIndex( 0 ) : '';
	}

	function _IsDefaultCharacter ( id )
	{
		var defaultTItem = LoadoutAPI.GetDefaultItem( 't', 'customplayer' );
		var defaultCTItem = LoadoutAPI.GetDefaultItem( 'ct', 'customplayer' );
		return id == defaultTItem || id == defaultCTItem;
	}

	function _IsPreviewable ( id )
	{
		return ( ItemInfo.GetSlotSubPosition( id ) || ItemInfo.ItemMatchDefName( id, 'sticker' ) || ItemInfo.ItemMatchDefName( id, 'patch' ) ||ItemInfo.ItemMatchDefName( id, 'spray' ) ) &&
			                                                                                                                                 
			!_IsDefaultCharacter( id );
	}

	return {
		GetRarityColor					: _GetRarityColor,
		GetName							: _GetName,
		GetFauxReplacementItemID		: _GetFauxReplacementItemID,
		GetFauxItemIdForGraffiti		: _GetFauxItemIdForGraffiti,
		GetFormattedName				: _GetFormattedName,                                 
		IsEquipped						: _IsEquipped,
		IsEquippedForCT					: _IsEquippedForCT,
		IsEquippedForT					: _IsEquippedForT,
		IsEquippedForNoTeam				: _IsEquippedForNoTeam,
		IsEquippalbleButNotAWeapon		: _IsEquippalbleButNotAWeapon,
		IsEquippableThroughContextMenu  : _IsEquippableThroughContextMenu,
		AddItemToShuffle				: _AddItemToShuffle,
		RemoveItemFromShuffle			: _RemoveItemFromShuffle,
		IsItemInShuffleForTeam			: _IsItemInShuffleForTeam,
		ClearShuffle					: _ClearShuffle,
		SetShuffleEnabled				: _SetShuffleEnabled, 
		IsShuffleEnabled				: _IsShuffleEnabled, 
		IsShuffleAllowed				: _IsShuffleAllowed, 
		CountItemsInInventoryForShuffleSlot	: _CountItemsInInventoryForShuffleSlot, 
		EnsureShuffleItemEquipped		: _EnsureShuffleItemEquipped, 
		GetSlot							: _GetSlot,
		GetTeam							: _GetTeam,
		GetSlotSubPosition				: _GetSlotSubPosition,
		IsSpraySealed					: _IsSpraySealed,
		IsSprayPaint					: _IsSprayPaint,
		IsTradeUpContract				: _IsTradeUpContract,
		GetSprayTintColor				: _GetSprayTintColor,
		IsTool							: _IsTool,
		IsWeapon						: _IsWeapon,
		IsCharacter						: _IsCharacter,
		GetCapabilitybyIndex			: _GetCapabilitybyIndex,
		GetCapabilityCount				: _GetCapabilityCount,
		ItemHasCapability				: _ItemHasCapability,
		GetChosenActionItemsCount		: _GetChosenActionItemsCount,
		GetChosenActionItemIDByIndex	: _GetChosenActionItemIDByIndex,
		GetStickerSlotCount				: _GetStickerSlotCount,
		GetStickerCount					: _GetStickerCount,
		GetitemStickerList				: _GetitemStickerList,
		GetItemPickUpMethod				: _GetItemPickUpMethod,
		BIsRewardPremium				: function( id ) { return InventoryAPI.BIsRewardPremium( id ) },
		GetRewardTier					: function( id ) { return InventoryAPI.GetRewardTier( id ) },
		GetLoadoutPrice					: _GetLoadoutPrice,
		GetStoreOriginalPrice			: _GetStoreOriginalPrice,
		GetStoreSalePrice				: _GetStoreSalePrice,
		GetStoreSalePercentReduction	: _GetStoreSalePercentReduction,
		ItemPurchase					: _ItemPurchase,
		IsItemCt						: _IsItemCt,
		IsItemT							: _IsItemT,
		IsItemAnyTeam					: _IsItemAnyTeam,
		ItemsNeededToTradeUp			: _ItemsNeededToTradeUp,
		             						                                      
		ItemMatchDefName				: _ItemMatchDefName,
		ItemDefinitionNameSubstrMatch	: _ItemDefinitionNameSubstrMatch,
		GetItemDefinitionName			: _GetItemDefinitionName,
		GetGifter						: _GetGifter,
		GetSet							: _GetSet,
		GetModelPath					: _GetModelPath,
		GetModelPathFromJSONOrAPI       : _GetModelPathFromJSONOrAPI,
		GetModelPlayer                  : _GetModelPlayer,
		GetLootListCount				: _GetLootListCount,
		GetLootListItemByIndex			: _GetLootListItemByIndex,
		IsStatTrak						: _IsStatTrak,
		GetToolType						: _GetToolType,
		GetMarketLinkForLootlistItem	: _GetMarketLinkForLootlistItem,
		GetItemIdForItemEquippedInLoadoutSlot: _GetItemIdForItemEquippedInLoadoutSlot,           
		IsLoadoutSlotSubPositionAWeapon	: _IsLoadoutSlotSubPositionAWeapon,
		GetDefaultCheer					: _GetDefaultCheer,
		GetVoPrefix						: _GetVoPrefix,
		IsPreviewable					: _IsPreviewable,
		FindAnyUserOwnedCharacterItemID : _FindAnyUserOwnedCharacterItemID,
		IsDefaultCharacter				: _IsDefaultCharacter,
		GetKeyForCaseInXray				: _GetKeyForCaseInXray,
		GetItemsInXray					: _GetItemsInXray,
		GetOrUpdateVanityCharacterSettings: _GetOrUpdateVanityCharacterSettings,
		DeepCopyVanityCharacterSettings : _DeepCopyVanityCharacterSettings,
		PrecacheVanityCharacterSettings : _PrecacheVanityCharacterSettings,
		GetLoadoutWeapons				: _GetLoadoutWeapons,
		IsSticker						: _IsSticker,
		IsPatch							: _IsPatch,				
	};
})();
