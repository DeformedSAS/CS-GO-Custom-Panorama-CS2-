'use strict';

var InventoryInspect = ( function()
{
	var _Init = function ()
	{
		var itemId = $.GetContextPanel().GetAttributeString( "itemid", null );

		                                               
		    
		   	                                              
		   	       
		    

		                                                                      
		                                
		                                                                        
		                                                                                                     
		var elItemModelImagePanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectModelOrImage' );
		InspectModelImage.Init( elItemModelImagePanel, itemId, _GetSettingCallback );

		var elActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectActionBar' );
		InspectActionBar.Init(
			elActionBarPanel,
			itemId,
			_GetSettingCallback,
			_GetSettingCallbackInt,
			elItemModelImagePanel
		);

		var elAsyncActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		InspectAsyncActionBar.Init(
			elAsyncActionBarPanel,
			itemId,
			_GetSettingCallback
		);

		var elHeaderPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectHeader' );
		InspectHeader.Init( elHeaderPanel, itemId, _GetSettingCallback );

		var elCapabilityPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpCapabilityHeader' );
		CapabiityHeader.Init( elCapabilityPanel, itemId, _GetSettingCallback );

		var elPurchasePanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectPurchaseBar' );
		InpsectPurchaseBar.Init( elPurchasePanel, itemId, _GetSettingCallback );

		PlayShowPanelSound( itemId );
		_SetDescription( itemId );
		_LoadEquipNotification();

		var styleforPopUpInspectFullScreenHostContainer = $.GetContextPanel().GetAttributeString( 'extrapopupfullscreenstyle', null );
		if ( styleforPopUpInspectFullScreenHostContainer )
		{
			var elPopUpInspectFullScreenHostContainer = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectFullScreenHostContainer' );
			elPopUpInspectFullScreenHostContainer.AddClass( styleforPopUpInspectFullScreenHostContainer );
		}

		var blurOperationPanel = ( $.GetContextPanel().GetAttributeString( 'bluroperationpanel', 'false' ) === 'true' ) ? true : false;
		if ( blurOperationPanel )
		{
			$.DispatchEvent( 'BlurOperationPanel' );
		}

		var defIdx = InventoryAPI.GetItemDefinitionIndex( itemId );
		if ( defIdx > 0 )
		{
			StoreAPI.RecordUIEvent( "Inventory_Inspect", defIdx );
		}
	};

	var m_Inspectpanel = $.GetContextPanel();
	var _GetSettingCallback = function( settingname, defaultvalue )
	{
		return m_Inspectpanel.GetAttributeString( settingname, defaultvalue );
	};

	var _GetSettingCallbackInt = function( settingname, defaultvalue )
	{
		return m_Inspectpanel.GetAttributeInt( settingname, defaultvalue );
	};

	var PlayShowPanelSound = function ( itemId )
	{
		var slot = ItemInfo.GetSlot( itemId );
		var slotSubPosition = ItemInfo.GetSlotSubPosition( itemId );

		                                                                       
		var inspectSound = "";
		if(slot == "heavy" || slot == "rifle" || slot == "smg" || slot == "secondary") {
			                   
			inspectSound = "inventory_inspect_weapon";
		} else if(slot == "melee") {
			                     
			inspectSound = "inventory_inspect_knife";
		} else if(ItemInfo.ItemMatchDefName( itemId, 'sticker' )) {
			               
			inspectSound = "inventory_inspect_sticker";
		} else if(slot == "spray") {
			                
			inspectSound = "inventory_inspect_graffiti";
		} else if(slot == "musickit") {
			                 
			inspectSound = "inventory_inspect_musicKit";
		} else if(slot == "flair0") {
			            
			inspectSound = "inventory_inspect_coin";
		} else if(slot == "clothing" && slotSubPosition == "clothing_hands") {
			              
			inspectSound = "inventory_inspect_gloves";
		} else {
			               
			inspectSound = "inventory_inspect_sticker";
		}

		$.DispatchEvent( "PlaySoundEffect", inspectSound, "MOUSE" );
	}

	var _SetDescription = function (id)
	{
	    $.GetContextPanel().SetDialogVariable( 'item_description', '' );

		if ( !InventoryAPI.IsValidItemID( id ) )
		{
			return;
		}
		
		var elDesc = $.GetContextPanel().FindChildInLayoutFile( 'InspectItemDesc' );
		var descText = InventoryAPI.GetItemDescription( id );

		                                           
		var shortString = descText.substring( 0, descText.indexOf( "</font></b><br><font color='#9da1a9'>" ) );
		$.GetContextPanel().SetDialogVariable( 'item_description', shortString === '' ? descText : shortString );
	};

	                                                                                                    
	var _LoadEquipNotification = function()
	{
		var elParent = $.GetContextPanel();
		
		var elNotification = $.CreatePanel( 'Panel', elParent, 'InspectNotificationEquip' );
		elNotification.BLoadLayout( 'file://{resources}/layout/notification/notification_equip.xml', false, false );
	};

	var _ShowNotification = function( slotInt, slotString, prevEquippedItemId, newEquippedItemId )
	{
		var elNotification = $.GetContextPanel().FindChildInLayoutFile( 'InspectNotificationEquip' );
		if ( elNotification && elNotification.IsValid() )
		{
			EquipNotification.ShowEquipNotification( elNotification, slotString, newEquippedItemId );
		}
	};

	var _ItemAcquired = function( ItemId )
	{
		var storeItemId = $.GetContextPanel().GetAttributeString( "storeitemid", "" );
		if( storeItemId )
		{
			var storeItemSeasonAccess = InventoryAPI.GetItemAttributeValue( storeItemId, 'season access' );
			var acquiredItemSeasonAccess = InventoryAPI.GetItemAttributeValue( ItemId, 'season access' );
			if( storeItemSeasonAccess === acquiredItemSeasonAccess )
			{
				var nSeasonAccess = GameTypesAPI.GetActiveSeasionIndexValue();
				var nCoinRank = MyPersonaAPI.GetMyMedalRankByType( ( nSeasonAccess + 1 ) + "Operation$OperationCoin" );

				                                                                    
				if( nCoinRank === 1 && nSeasonAccess === acquiredItemSeasonAccess )
				{
					_ClosePopup();
					$.DispatchEvent( 'HideStoreStatusPanel', '' );
	
					UiToolkitAPI.ShowCustomLayoutPopupParameters(
						'',
						'file://{resources}/layout/popups/popup_inventory_inspect.xml',
						'itemid=' + ItemId +
						'&' + 'asyncworktype=useitem' + 
						'&' + 'seasonpass=true' +
						'&' + 'bluroperationpanel=true'
					);
	
					return;
				}
			}

			var defName = ItemInfo.GetItemDefinitionName(  InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( g_ActiveTournamentInfo.itemid_charge, 0 ));
			if ( ItemInfo.ItemMatchDefName( storeItemId, defName ) &&
				ItemInfo.ItemMatchDefName( ItemId, defName ) )
			{
				                                                        
				_ClosePopup();
				$.DispatchEvent( 'ShowAcknowledgePopup', '', '' );
				$.DispatchEvent( 'HideStoreStatusPanel', '' );

				return;
			}

			_ClosePopup();
			$.DispatchEvent( 'ShowAcknowledgePopup', '', ItemId );
			$.DispatchEvent( 'HideStoreStatusPanel', '' );
		}
	};

	var _ClosePopup = function()
	{
		var elAsyncActionBarPanel = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		var elPurchase = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectPurchaseBar' );
		var elInspectBar = $.GetContextPanel().FindChildInLayoutFile( 'PopUpInspectActionBar' );

		if( !elAsyncActionBarPanel.BHasClass( 'hidden' ))
		{
			InspectAsyncActionBar.OnEventToClose();
		}
		else if ( !elPurchase.BHasClass( 'hidden' ) )
		{
			InpsectPurchaseBar.ClosePopup();
		}
		else
		{
			InspectActionBar.CloseBtnAction();
		}
	};

	return{
		Init: _Init,
		ShowNotification: _ShowNotification,
		ClosePopup: _ClosePopup,
		ItemAcquired: _ItemAcquired
	};
} )();

( function()
{
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Inventory_PlayerEquipSlotChanged', InventoryInspect.ShowNotification );
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Store_PurchaseCompleted', InventoryInspect.ItemAcquired );
} )();
