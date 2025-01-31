'use-strict';

var AcknowledgeItems = ( function()
{
	var m_isCapabliltyPopupOpen = false;

	var _OnLoad = function()
	{
		$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', AcknowledgeItems.Init );
		_Init();
	};

	var _Init = function()
	{
		var items = _GetItems();

		if ( items.length < 1 )
		{
			$.DispatchEvent( 'UIPopupButtonClicked', '' );
			return;
		}

		var numItems = items.length;
		_AcknowledgeAllItems.SetItemsToSaveAsNew( items );

		                                                                                                        
		var elParent = $.GetContextPanel().FindChildInLayoutFile( 'AcknowledgeItemsCarousel' );
		elParent.RemoveAndDeleteChildren();

		for ( var i = 0; i < items.length; i++ )
		{
			var elDelayLoadPanel = $.CreatePanel( 
				'DelayLoadPanel', 
				elParent, 
				'carousel_delay_load_' + i,
				{ class: 'Offscreen' } );

			elDelayLoadPanel.SetLoadFunction( _MakeItemPanel.bind( null, items[i], i, numItems ) );
			elDelayLoadPanel.ListenForClassRemoved( 'Offscreen' );
		}
	};

	var _MakeItemPanel = function( item, index, numItems, elParent )
	{
		var isOperationReward = item.pickuptype === 'quest_reward';
		var elItemTile = $.CreatePanel( 'Panel', elParent, item.id );
		elItemTile.BLoadLayoutSnippet( 'Item' );

		_ShowModelOrItem( elItemTile, item.id, item.type );

		var elLabel = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemLabel' );
		elLabel.text = ItemInfo.GetName( item.id );

		                                                        
		var defName = InventoryAPI.GetItemDefinitionName( item.id );

		var elTitle = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemTitle' );
		var titleSuffex = isOperationReward ? 'quest_reward' : item.type;
		if ( defName === 'casket' && item.type === 'nametag_add' )
		{
			elTitle.text = $.Localize( '#CSGO_Tool_Casket_Tag' );
		}
		else
		{
			var idxOfExtraParams = titleSuffex.indexOf( "[" );
			var typeWithoutParams = ( idxOfExtraParams > 0 ) ? titleSuffex.substring( 0, idxOfExtraParams ) : titleSuffex;
			elTitle.text = $.Localize( '#popup_title_' + typeWithoutParams );
		}

		if ( isOperationReward )
		{
			var tier = ItemInfo.GetRewardTier( item.id );
			
			                          
			    
			   	                                                                                                
			   	                                                                                                                                                                           
			    
		}

		var rarityColor = ItemInfo.GetRarityColor( item.id );
		elTitle.style.washColor = rarityColor;

		var elMovie = elItemTile.FindChildInLayoutFile( 'AcknowledgeMovie' );
		elMovie.SetHasClass( 'operation', isOperationReward );
		_WashColorBackGroundMovie( elMovie, isOperationReward ? 'none' : rarityColor );

		var elBar = elItemTile.FindChildInLayoutFile( 'AcknowledgeBar' );
		elBar.style.washColor = rarityColor;

		_ShowGiftPanel( elItemTile, item.id );
		_ShowSetPanel( elItemTile, item.id );
		_ItemCount( elItemTile, index, numItems );

		                 
		                                                                               
		                                         
		                                   
		               
	};

	var _WashColorBackGroundMovie = function( elMovie, rarityColor )
	{
		elMovie.style.washColor = rarityColor;
	};

	var _ShowModelOrItem = function( elItemTile, id, type = "" )
	{
		var elModel = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemModel' );
		var elImage = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemImage' );
		elImage.visible = false;
		elModel.visible = false;

		var modelPath = ItemInfo.GetModelPathFromJSONOrAPI( id );

		if ( modelPath )
		{
			elModel.visible = true;
			
			                                                  
			elModel.SetAsActivePreviewPanel();
			elModel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
				modelPath,
				false
			);

			if ( type && ( ( typeof type ) === 'string' ) && type.startsWith( "patch_apply[" ) )
			{
				var settings = ItemInfo.GetOrUpdateVanityCharacterSettings( id );
				settings.panel = elModel;

				var slot = parseInt( type.substring( "patch_apply[".length ) );

				CapabilityCanSticker.UpdatePreviewPanelSettingsForPatchPosition( id, settings, slot );
				CharacterAnims.PlayAnimsOnPanel( settings );
				CapabilityCanSticker.UpdatePreviewPanelCameraAndLightingForPatch( elModel, id, slot );

			}
			else if ( type == "patch_remove" )
			{
				var settings = ItemInfo.GetOrUpdateVanityCharacterSettings( id );
				settings.panel = elModel;
	
				CharacterAnims.PlayAnimsOnPanel( settings );

				elModel.SetSceneIntroFOV( 1., 50000 );
				elModel.SetCameraPosition( 305.60, -7.43, 85.19 );
				elModel.SetCameraAngles( 4.81, 178.85, 0.00 );
			}
			else if ( ItemInfo.IsCharacter( id) )
			{
				var settings = ItemInfo.GetOrUpdateVanityCharacterSettings( id );
				settings.panel = elModel;
	
				CharacterAnims.PlayAnimsOnPanel( settings );
	
				elModel.SetSceneIntroFOV( 1., 50000 );
				elModel.SetCameraPosition( 305.60, -7.43, 85.19 );
				elModel.SetCameraAngles( 4.81, 178.85, 0.00 );

				elModel.SetFlashlightColor( 4.16, 4.06, 5.20 );
				elModel.SetFlashlightFOV( 60 );
				elModel.SetFlashlightAmount( 3 );
				elModel.SetDirectionalLightModify( 1 );
				elModel.SetDirectionalLightDirection( 66.83, -23.02, 121.82);
				elModel.SetDirectionalLightColor(0.29, 0.09, 0.63);
				elModel.SetAmbientLightColor(0.12, 0.14, 0.19);
			}
		}
		else
		{
			                               
			elImage.visible = true;
			elImage.itemid = id;
		}
	};

	var _ShowGiftPanel = function( elItemTile, id )
	{
		var elPanel = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemGift' );
		var gifterId = ItemInfo.GetGifter( id );

		elPanel.SetHasClass( 'hidden', gifterId === '' );

		var elLabel = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemGiftLabel' );
		elLabel.SetDialogVariable( 'name', FriendsListAPI.GetFriendName( gifterId ) );
		elLabel.text = $.Localize( '#acknowledge_gifter', elLabel );
	};

	var _ShowQuestPanel = function( elItemTile, id )
	{
		var elPanel = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemQuest' );
		elPanel.SetHasClass( 'hidden', 'quest_reward' !== ItemInfo.GetItemPickUpMethod( id ) );

		                                                    
		var nTierReward = ItemInfo.GetRewardTier( id );
		var bPremium = ItemInfo.BIsRewardPremium( id );
		elPanel.SetHasClass( "tier-reward", nTierReward > 0 );
		elPanel.SetHasClass( "premium", bPremium );
		if ( nTierReward > 0 )
		{
			elPanel.SetDialogVariableInt( "tier_num", nTierReward );
		}
	};

	var _ShowSetPanel = function( elItemTile, id )
	{
		var elPanel = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemSet' );
		var strSetName = InventoryAPI.GetTag( id, 'ItemSet' );
		if ( !strSetName || strSetName === '0' )
		{
			elPanel.SetHasClass( 'hide', true );
			return;
		}

		var setName = InventoryAPI.GetTagString( strSetName );
		if ( !setName )
		{
			elPanel.SetHasClass( 'hide', true );
			return;
		}

		var elLabel = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemSetLabel' );
		elLabel.text = setName;

		var elImage = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemSetImage' );
		elImage.SetImage( 'file://{images_econ}/econ/set_icons/' + strSetName + '_small.png' );
		elPanel.SetHasClass( 'hide', false );
	};

	var _ItemCount = function( elItemTile, index, numItems )
	{
		var elCountLabel = elItemTile.FindChildInLayoutFile( 'AcknowledgeItemCount' );
		if ( numItems < 2 )
		{
			elCountLabel.visible = false;
			return;
		}

		elCountLabel.visible = true;
		elCountLabel.text = ( index + 1 ) + ' / ' + numItems;
	};

	var _ShowEquipItem = function( elItemTile, id )
	{
		                                           
		var subSlot = ItemInfo.GetSlotSubPosition( id );

		if ( !subSlot || subSlot === '' )
			return;

		var elEquipBtn = elItemTile.FindChildInLayoutFile( 'AcknowledgeEquipBtn' );
		elEquipBtn.RemoveClass( 'hidden' );
	};

	var _GetItems = function()
	{
		var newItems = [];

		var itemCount = InventoryAPI.GetUnacknowledgeItemsCount();
		for ( var i = 0; i < itemCount; i++ )
		{
			var itemId = InventoryAPI.GetUnacknowledgeItemByIndex( i );
			var pickUpType = ItemInfo.GetItemPickUpMethod( itemId );
			var item = { type: 'acknowledge', id: itemId, pickuptype: pickUpType  };

			if ( _ItemstoAcknowlegeRightAway( itemId ) )
				InventoryAPI.AcknowledgeNewItembyItemID( itemId );
			else
				newItems.unshift( item );
		}

		var getUpdateItem = _GetUpdatedItem();
		if ( getUpdateItem && newItems.filter( item => item.id === getUpdateItem.id ).length < 1 )
		{
			newItems.push( getUpdateItem );
		}

		                         
		var rewardItems = newItems.filter( item => item.pickuptype === "quest_reward" );
		var otherItems = newItems.filter( item => item.pickuptype !== "quest_reward" );
	
		return rewardItems.concat( otherItems );
	};

	var _GetItemsByType = function( afilters, bShouldAcknowledgeItems )
	{
		var aItems = _GetItems();

		var filterByDefNames = function( oItem )
		{
			return afilters.includes( ItemInfo.GetItemDefinitionName( oItem.id ) );
		};

		var alist = aItems.filter( filterByDefNames );

		if ( bShouldAcknowledgeItems )
		{
			_AcknowledgeAllItems.SetItemsToSaveAsNew( alist );
			_AcknowledgeAllItems.AcknowledgeItems();
		}

		var aOnlyIds = [];
		alist.forEach( function( oItem ) { aOnlyIds.push( oItem.id ); } );
		return aOnlyIds;
	};


	var _GetUpdatedItem = function()
	{
		                                                  
		                                                
		                                                                             

		var itemidExplicitAcknowledge = $.GetContextPanel().GetAttributeString( "ackitemid", '' );
		if ( itemidExplicitAcknowledge === '' )
			return null;
		
		return {
			id: itemidExplicitAcknowledge,
			type: $.GetContextPanel().GetAttributeString( "acktype", '' )
		};
	};

	var _ItemstoAcknowlegeRightAway = function( id )
	{
		           
		                                                                 
		                                                                   
		
		                                                                                           
		    
		   	                                                              
		   	            
		    

		var itemType = InventoryAPI.GetItemTypeFromEnum( id );
		if ( itemType === 'quest' || itemType === 'coupon_crate' || itemType === 'campaign' )
			return true;

		return false;
	};

	var _AcknowledgeAllItems = ( function()
	{
		var itemsToSave = [];

		var _SetItemsToSaveAsNew = function( items )
		{
			itemsToSave = items;
		};

		var _AcknowledgeItems = function()
		{
			itemsToSave.forEach( function( item )
			{
				InventoryAPI.SetItemSessionPropertyValue( item.id, 'item_pickup_method', ItemInfo.GetItemPickUpMethod( item.id ) );                       

				if ( item.type === 'acknowledge' )
				{
					InventoryAPI.SetItemSessionPropertyValue( item.id, 'recent', '1' );
					InventoryAPI.AcknowledgeNewItembyItemID( item.id );
				}
				else
				{
					InventoryAPI.SetItemSessionPropertyValue( item.id, 'updated', '1' );
					$.DispatchEvent( 'RefreshActiveInventoryList' );
				}
			} );
		};

		var _OnActivate = function()
		{
			_AcknowledgeItems();

			                                          
			                                      
			InventoryAPI.AcknowledgeNewBaseItems();

			var callbackResetAcknowlegePopupHandle = $.GetContextPanel().GetAttributeInt( "callback", -1 );
			if ( callbackResetAcknowlegePopupHandle != -1 )
			{
				                                                                                            
				                                                                                        
				UiToolkitAPI.InvokeJSCallback( callbackResetAcknowlegePopupHandle );
			}

			$.DispatchEvent( 'UIPopupButtonClicked', '' );
			$.DispatchEvent( 'PlaySoundEffect', 'UIPanorama.inventory_new_item_accept', 'MOUSE' );

		};

		return {
			SetItemsToSaveAsNew: _SetItemsToSaveAsNew,
			AcknowledgeItems: _AcknowledgeItems,
			OnActivate: _OnActivate
		};
	} )();

	var _SetIsCapabilityPopUpOpen = function( isOpen )
	{
		m_isCapabliltyPopupOpen = isOpen;
	};

	return {
		Init				: _Init,
		OnLoad 				: _OnLoad,
		GetItems			: _GetItems,
		GetItemsByType		: _GetItemsByType,
		AcknowledgeAllItems	: _AcknowledgeAllItems,
		SetIsCapabilityPopUpOpen: _SetIsCapabilityPopUpOpen
	};
} )();

( function()
{
	                                                                                                    
} )();

