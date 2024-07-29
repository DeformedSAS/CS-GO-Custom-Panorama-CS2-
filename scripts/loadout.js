'use strict';

var Loadout = ( function() {

	var _Init = function()
	{
		$.GetContextPanel().FindChildInLayoutFile( 'LoadoutTeamCt' ).checked = true;
		$.GetContextPanel().FindChildInLayoutFile( 'LoadoutPistols' ).checked = true;
		_AddSort();
		_HideShowSingleItem( true );
		_ShowItemsForSelectedSlot();
	};

	var _AddSort = function()
	{
		var elDropdown = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSortDropdown' );
		var count = InventoryAPI.GetSortMethodsCount();

		for ( var i = 0; i < count; i++ ) 
		{
			var sort = InventoryAPI.GetSortMethodByIndex( i );
			var newEntry = $.CreatePanel( 'Label', elDropdown, sort, {
				class: 'DropDownMenu'
			} );

			newEntry.text = $.Localize( '#' + sort );
			elDropdown.AddOption( newEntry );
		}

		                        
		elDropdown.SetSelected( InventoryAPI.GetSortMethodByIndex( 1 ) );
	};

	var _HideShowRadialLoadout = function( bShow )
	{
		$.GetContextPanel().FindChildInLayoutFile( 'LoadoutRadialSelector' ).SetHasClass( 'hidden', !bShow ) ;
	};
	
	var _ShowRadialLoadout = function( )
	{
		_HideShowRadialLoadout( true );
		_HideShowSingleItem( false );
		_ShouldShowTeamData();
	};

	var _OnShuffleToggle = function()
	{
		var elBtn = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutShuffleToggle' );
		var slot = _GetUsesWedges() ? _GetSelectededRadialButton() : _GetSelectededLoadoutSlot();
		var ItemId = _GetUsesWedges() ? _GetItemIdFromSelectedWedge() : LoadoutAPI.GetItemID( _GetSelectedTeamAsString( slot ), slot );
		
		LoadoutAPI.SetShuffleEnabled( ItemId, _GetSelectedTeamAsString( slot ), elBtn.checked );
	
		_UpdateItemList();
		if ( elBtn.checked )
		{
			var teamAsString = _ConvertTeamFromNumToString( _GetSelectededTeam( slot ) );
			                                            
			LoadoutAPI.ShuffleAllForTeam( ItemId, teamAsString );
			ItemInfo.EnsureShuffleItemEquipped( ItemId, teamAsString );
		}
	};

	var _GetCurrentItemID = function ()
	{
		var bValidWedgeSelected = _GetSelectededRadialButton() !== '';
		if ( !_GetUsesWedges() || !bValidWedgeSelected ) 
		{
			var loadoutSlot = _GetSelectededLoadoutSlot();
			var team = _GetSelectedTeamAsString( loadoutSlot );
			return LoadoutAPI.GetItemID( team, loadoutSlot );
		}
		else
		{
			return _GetItemIdFromSelectedWedge();
		}
	}

	var _UpdateShuffleToggle = function( teamAsNumber )
	{
		var elBtn = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutShuffleToggle' );
		var elLabel = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutShuffleToggleLabel' );
		var loadoutSlot = _GetSelectededLoadoutSlot();
		var weaponType = '';
		var teamAsString = _ConvertTeamFromNumToString( teamAsNumber );

		var ItemId = _GetCurrentItemID();
		if ( !InventoryAPI.IsValidItemID( ItemId ) )
		{
			                          
			elBtn.visible = false;
			$( "#LoadoutShuffleOptions" ).visible = false;
			return;
		}

		if ( _GetUsesWedges() ) 
		{
			weaponType = InventoryAPI.GetItemDefinitionName( ItemId ).replace( 'weapon_', '' );

			elLabel.SetDialogVariable( 'weapon', $.Localize( InventoryAPI.GetItemBaseName( ItemId ) ) );
			elLabel.SetDialogVariable( 'team', $.Localize( '#SFUI_MainMenu_TeamIcon_' + teamAsString ) );
			elLabel.text = $.Localize( "#shuffle_toggle_btn" , elLabel );
		}

		elBtn.visible = ( loadoutSlot !== 'spray0' ) && ItemInfo.IsShuffleAllowed( ItemId ) && ItemInfo.CountItemsInInventoryForShuffleSlot( ItemId, teamAsString ) > 1;

		var nameString = ( loadoutSlot === 'melee' || loadoutSlot === 'clothing_hands' ) || loadoutSlot === 'musickit' || loadoutSlot === 'customplayer' ?
		$.Localize( '#loadoutslot_' + loadoutSlot ) :
		$.Localize( InventoryAPI.GetItemBaseName( ItemId ) );
		
		if ( loadoutSlot === 'musickit' )
		{
			elLabel.SetDialogVariable( 'weapon', $.Localize( nameString ) );
			elLabel.text = $.Localize( "#shuffle_toggle_btn_noteam" , elLabel );
		}
		else if ( loadoutSlot === 'flair0')
		{
			elLabel.SetDialogVariable( 'weapon', $.Localize( "#LoadoutSlot_Flair") );
			elLabel.text = $.Localize( "#shuffle_toggle_btn_noteam" , elLabel );
		}
		else
		{
			elLabel.SetDialogVariable( 'weapon', nameString );
			elLabel.SetDialogVariable( 'team', $.Localize( '#SFUI_MainMenu_TeamIcon_' + teamAsString) );
			elLabel.text = $.Localize( "#shuffle_toggle_btn" , elLabel );
		}
			
		elBtn.checked = LoadoutAPI.IsShuffleEnabled( ItemId, teamAsString );
		$( "#LoadoutShuffleOptions" ).visible = elBtn.checked;
	};

	var _LoadoutWedgePressed = function( team )
	{
		_UpdateShuffleToggle( team );
	};

	                                                                                                    
	                     
	                                                                                                    
	var _ShowSingleSlotLoadout = function()
	{
		_HideShowRadialLoadout( false );
		_HideShowSingleItem( true );
		_UpdateSingleItem();
		_ShouldShowTeamData();
	};

	var _HideShowSingleItem = function( bShow )
	{
		$.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItem' ).SetHasClass( 'hidden', !bShow );
	};

	var _UpdateSingleItem = function()
	{
		var loadoutSlot = _GetSelectededLoadoutSlot();
		var team = _GetSelectedTeamAsString( loadoutSlot );
		
		var elModel = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItemModel' );
		var itemId = LoadoutAPI.GetItemID( team, loadoutSlot );

		_FillOutItemData( itemId, loadoutSlot );
		_UpdateShuffleToggle( _GetSelectededTeam( loadoutSlot ) );
		_UpdateItemList();
	};

	var _FillOutItemData = function( itemId, loadoutSlot )
	{
		var elModel = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItemModel' );
		var elTitle = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItemLabel' );
		var elRarity = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItemRarity' );

		var idForDisplay = itemId;
		if ( loadoutSlot === 'spray0' )
			idForDisplay = ItemInfo.GetFauxReplacementItemID( itemId, 'graffiti' );

		var noIdEquipped = ( itemId === '0' ) ? true : false;
		elModel.SetHasClass( 'hidden', noIdEquipped );
		elRarity.SetHasClass( 'hidden', noIdEquipped );

		_ShowFlairReset( loadoutSlot, noIdEquipped );

		var elSingleItemPanel = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItem' );
		elSingleItemPanel.SetHasClass( 'extra-tall', loadoutSlot === 'customplayer' );
	
		                                                                                   
		var elCharControls = $.GetContextPanel().FindChildInLayoutFile( 'id-character-buttons-container' );
		elCharControls.SetHasClass( 'hidden', true );
		
		elModel.visible = !noIdEquipped;
		
		if ( noIdEquipped )
		{
			elTitle.text = $.Localize( '#inv_empty_loadout_slot' );
			return;
		}
	
		var elBackground = $.GetContextPanel().FindChildInLayoutFile( 'loadout-single-item__bg' );

		var modelPath = ItemInfo.GetModelPathFromJSONOrAPI( idForDisplay );
		InventoryAPI.PrecacheCustomMaterials( idForDisplay );

		                                                  
		elModel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
			modelPath,
			false
		);

		

	
		elBackground.SetImage( "file://{images}/backgrounds/inspect.svg" );
		
		_InitCharacterItemPanel( itemId );

		elTitle.text = ItemInfo.GetName( idForDisplay );
		var rarityColor = ItemInfo.GetRarityColor( itemId );

		if ( rarityColor )
		{
			elRarity.style.backgroundColor = rarityColor;
		}
	};

	var _InitCharacterItemPanel = function( charItemId )
	{
		$( '#id-character-buttons-container' ).SetHasClass( 'hidden', !ItemInfo.IsCharacter( charItemId ) );

		if ( !ItemInfo.IsCharacter( charItemId ) )
			return;
	
		                                                                                 

		var characterToolbarButtonSettings = {
			charItemId: charItemId,
			cameraPresetUnzoomed: 5,
			cameraPresetZoomed: 6,
		};

		CharacterButtons.InitCharacterButtons( $('#id-character-buttons'), $('#LoadoutSingleItemModel'), characterToolbarButtonSettings );
	}

	
	var _ShowFlairReset = function( loadoutSlot, noIdEquipped )
	{
		var elClearBtn = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutResetFlair' );
		elClearBtn.SetHasClass( 'hidden', ( noIdEquipped || loadoutSlot !== 'flair0' ) );
	};

	var _ResetFlair = function()
	{
		var loadoutSlot = 'flair0';
		var team = 'noteam';
		var defaultItem = LoadoutAPI.GetDefaultItem( team, loadoutSlot );

		if ( defaultItem !== LoadoutAPI.GetItemID( team, loadoutSlot ) )
		{
			LoadoutAPI.EquipItemInSlot( team, defaultItem, loadoutSlot );
		}
	};
	
	                                                                                                        

	var _UpdateItemList= function()
	{
		var loadoutSlot = _GetUsesWedges() ? _GetSelectededRadialButton() : _GetSelectededLoadoutSlot();
		var elListerToUpdate = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutItemList' );
		var elDropdown = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSortDropdown' );
		var elShuffle = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutShuffleToggle' );
		var sortType = elDropdown.GetSelected() ? elDropdown.GetSelected().id : "";

		var defName= _GetUsesWedges() && elShuffle.checked ? InventoryAPI.GetItemDefinitionName( _GetItemIdFromSelectedWedge() ) : '';

		var szMainFilter = 'inv_group_equipment';
		switch ( loadoutSlot )
		{
			case 'flair0':
				szMainFilter = 'inv_display_slot';
				break;
			case 'spray0':
				szMainFilter = 'inv_graphic_art';
				break;
		}

		var team = _GetSelectedTeamAsString( loadoutSlot ) === 'noteam' ? '' : _GetSelectedTeamAsString( loadoutSlot );

		var loadoutSlotParams = defName ? ',only_econ_items,item_definition:'+ defName + ',' + team : ',' + team;

		$.DispatchEvent( 'SetInventoryFilter',
			elListerToUpdate,
			szMainFilter,
			'any',
			'any',
			sortType,
			loadoutSlot + loadoutSlotParams,
			''               
		);

		_ShowHideNoItemsMessage( elListerToUpdate );
	};

	                                                                                               
	                                                                                                                      
	var _ShowHideNoItemsMessage = function( elLister )
	{
		var count = elLister.count;
		var elParent = elLister.GetParent();

		var elEmpty = elParent.FindChildInLayoutFile( 'LoadoutEmptyLister' );

		if ( count > 0 )
		{
			if ( elEmpty )
			{
				elEmpty.AddClass( 'hidden' );
			}
			return;
		}

		elEmpty.RemoveClass( 'hidden' );
		var elLabel = elEmpty.FindChildInLayoutFile( 'LoadoutEmptyListerLabel' );
		elLabel.text = $.Localize( '#inv_empty_lister_general');
	};

	                                                                                                    
	          
	                                                                                                    
	var _GetSelectedTab = function()
	{
		var elSlots = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSlotSelectionRadios' );
		var elSelectedSlot = elSlots.Children().filter( slot => slot.checked === true );
		return elSelectedSlot[ 0 ];
	}	
	
	var _GetSelectededLoadoutSlot = function()
	{
		return _GetSelectedTab().GetAttributeString( 'data-slot', '' );
	};

	var _GetUsesWedges= function()
	{
		                                                                                    
		return _GetSelectedTab().GetAttributeString( 'data-wedge', '' ) === 'true' ? true : false;
	};

	var _GetSelectededRadialButton = function()
	{
		return _GetSelectedWedge().GetAttributeString( 'equip_slot', '' );
	};

	var _GetSelectedWedge = function()
	{
		var elWedges = $.GetContextPanel().FindChildInLayoutFile( 'ItemWheel' );
		var wedgeList = elWedges.Children().filter( wedge => wedge.checked === true );
		return wedgeList[ 0 ];
	};

	var _GetItemIdFromSelectedWedge = function()
	{
		var slot = _GetSelectededRadialButton();
		return LoadoutAPI.GetItemID( _GetSelectedTeamAsString( slot ), slot );
	};

	var _GetSelectededTeam = function( loadoutSlot )
	{
		var elTeams = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSelectTeam' );
		var elSelectedTeam = elTeams.Children().filter( slot => slot.checked === true );
		return _SlotHasNoTeamAsTeam( loadoutSlot ) ? 0 : elSelectedTeam[ 0 ].GetAttributeString( 'data-team', '' );
	};

	var _SlotHasNoTeamAsTeam = function( loadoutSlot )
	{
		if ( loadoutSlot === 'spray0' ||
			loadoutSlot === 'musickit' ||
			loadoutSlot === 'flair0')	
			{
			return true;
		}

		return false;
	};

	var _ShouldShowTeamData = function()
	{
		var elTeams = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSelectTeam' );
		var loadoutSlot = _GetSelectededLoadoutSlot();
		var team = _GetSelectededTeam( loadoutSlot );

		if ( _SlotHasNoTeamAsTeam( loadoutSlot ) )
		{
			elTeams.visible = false;
		}
		else
		{
			elTeams.visible = true;
		}
	};

	var _GetSelectedTeamAsString = function( loadoutSlot )
	{
		if ( _SlotHasNoTeamAsTeam( loadoutSlot ) )
		{
			return 'noteam';
		}

		return _ConvertTeamFromNumToString( _GetSelectededTeam( loadoutSlot ));
	};

	var _ConvertTeamFromNumToString = function( numTeam )
	{
		if ( numTeam === 0 )
		{
			return 'noteam';
		}
		
		return numTeam === 3 || numTeam === "3" ? 'ct' : 't';
	};

	                                                                                                    
	var _ShowItemsForSelectedSlot = function()
	{
		                           
		if ( _GetUsesWedges() )
		{
			var loadoutSlot = _GetSelectededLoadoutSlot();
			$.DispatchEvent( "ShowLoadout", loadoutSlot, Number( _GetSelectededTeam(loadoutSlot) ) );

			var wedges = $.GetContextPanel().FindChildInLayoutFile( 'ItemWheel' ).Children();
			var result = wedges.filter( element => element.checked === true );
			var selectedWedge =  result.length > 0 ? result[0] : wedges[ 0 ];

			$.DispatchEvent( "Activated", selectedWedge, "mouse" );

			_ShowRadialLoadout();
			return;
		}

		_ShowSingleSlotLoadout();
	};

	var _ToggleTeam = function()
	{
		var elTeams = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSelectTeam' ).Children();

		for ( var i = 0; i < elTeams.length; i++ )
		{
			                                         

			if ( !elTeams[ i ].checked )
			{
				elTeams[ i ].checked = true;
				break;
			}
		}

		_ShowItemsForSelectedSlot();
	};

	var _OnReadyForDisplay = function()
	{
		                       
		                              
		var loadoutSlot = _GetSelectededLoadoutSlot();
		$.DispatchEvent( "ShowLoadout", loadoutSlot, Number( _GetSelectededTeam( loadoutSlot ) ) );
		Loadout.PlayerEquipSlotChangedHandler = $.RegisterForUnhandledEvent( 'PanoramaComponent_Inventory_PlayerEquipSlotChanged', Loadout.UpdateForSingleSlotItems );
		Loadout.InventoryUpdatedHandler = $.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', Loadout.UpdateInteriorPreviewAndItemTiles );
	};

	var _OnUnreadyForDisplay = function()
	{
		if ( Loadout.PlayerEquipSlotChangedHandler )
		{
			$.UnregisterForUnhandledEvent( 'PanoramaComponent_Inventory_PlayerEquipSlotChanged', Loadout.PlayerEquipSlotChangedHandler );
			Loadout.PlayerEquipSlotChangedHandler = undefined;
		}

		if ( Loadout.InventoryUpdatedHandler )
		{
			$.UnregisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', Loadout.InventoryUpdatedHandler );
			Loadout.InventoryUpdatedHandler = undefined;
		}
	};

	var _UpdateForSingleSlotItems = function( pos, subslot, oldItemId, newItemId)
	{
		                         
		if ( oldItemId == newItemId )
			return;

		_UpdateInteriorPreviewAndItemTiles();
	}
	
	var _UpdateInteriorPreviewAndItemTiles = function()
	{
		if ( _GetUsesWedges() )
		{
			var loadoutSlot = _GetSelectededLoadoutSlot();
			var team = _GetSelectededTeam( loadoutSlot );
			_UpdateShuffleToggle( team );
			return;
		}

		_UpdateSingleItem();
		_UpdateItemList();
	};
	
	var _SetLoadoutToSlot = function( itemSlot, subslot, numTeam )
	{
		if ( itemSlot === 'spray' || itemSlot === 'clothing' )
		{
			itemSlot = subslot;
		}
		
		var elSlots = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSlotSelectionRadios' );
		var elSelectedSlot = elSlots.Children().filter( slot => slot.GetAttributeString( 'data-slot', '' ) === itemSlot );
		elSelectedSlot[ 0 ].checked = true;

		                                                                               
		                                         
		if ( numTeam == 2 )
		{
			$( "#LoadoutTeamT" ).checked = true;
		}

		if ( _GetUsesWedges() )
		{
			$.DispatchEvent( "ShowLoadout", subslot, numTeam );
			var elWedges = $.GetContextPanel().FindChildInLayoutFile( 'ItemWheel' );
			var wedgeList = elWedges.Children().filter( wedge => wedge.GetAttributeString( 'equip_slot', '' ) === subslot );
			wedgeList[ 0 ].checked = true;

			_ShowRadialLoadout();
			_UpdateShuffleToggle( numTeam );
		}
		else
		{
			_ShowSingleSlotLoadout();
		}
	};

	var _SelectMinimumItemsForShuffle = function ( itemID, team )
	{
		                               
		var curItem = ItemInfo.GetItemIdForItemEquippedInLoadoutSlot( itemID, team );
		if ( !ItemInfo.IsItemInShuffleForTeam( curItem, team ) )
		{
			ItemInfo.AddItemToShuffle( curItem, team );
		}

		var elLoadoutItemList = $( '#LoadoutItemList' );
		if ( elLoadoutItemList && elLoadoutItemList.IsValid() )
		{
			for ( var i = 0; i < elLoadoutItemList.count; ++i )
			{
				if ( LoadoutAPI.GetItemCountInShuffle( itemID, team ) >= 2 )
					break;
	
				ItemInfo.AddItemToShuffle( elLoadoutItemList.GetItem( i ), team );
			}
		}
	}


	var _ShowShuffleContextMenu = function()
	{
		var items = [];	
		var loadoutSlot = _GetSelectededLoadoutSlot();
		var team = _ConvertTeamFromNumToString( _GetSelectededTeam( loadoutSlot ) );
		var itemID = _GetCurrentItemID();
		items.push( 
			{
				label: '#CSGO_UI_AddAllToShuffle',
				jsCallback: function ()
				{
					LoadoutAPI.ShuffleAllForTeam( itemID, team )
				}
			},
			{
				label: '#CSGO_UI_MinimalShuffle',
				jsCallback: function ()
				{
					LoadoutAPI.ClearShuffle( itemID, team );
					_SelectMinimumItemsForShuffle( itemID, team );
				}
			}
		);
		UiToolkitAPI.ShowSimpleContextMenu( 'LoadoutShuffleOptions', 'LoadoutShuffleCtxMenu', items );
	}

                          
    return {
		Init								: _Init,
		ShowRadialLoadout					: _ShowRadialLoadout,
		ShowSingleSlotLoadout				: _ShowSingleSlotLoadout,
		ShowItemsForSelectedSlot			: _ShowItemsForSelectedSlot,
		OnReadyForDisplay					: _OnReadyForDisplay,
		OnUnreadyForDisplay					: _OnUnreadyForDisplay,
		LoadoutWedgePressed					: _LoadoutWedgePressed,
		UpdateForSingleSlotItems			: _UpdateForSingleSlotItems,
		UpdateInteriorPreviewAndItemTiles	: _UpdateInteriorPreviewAndItemTiles,
		ResetFlair							: _ResetFlair,
		UpdateItemLister					: _UpdateItemList,
		OnShuffleToggle						: _OnShuffleToggle,
		SetLoadoutToSlot					: _SetLoadoutToSlot,
		ToggleTeam							: _ToggleTeam,
		ShowShuffleContextMenu				: _ShowShuffleContextMenu,
    };

} )();

                                                                                                    
                                           
                                                                                                    
(function ()
{
	Loadout.Init();
	var elloadout = $.GetContextPanel().FindChildInLayoutFile( 'Loadout' );
	$.RegisterEventHandler( 'ReadyForDisplay', $.GetContextPanel(), Loadout.OnReadyForDisplay );
	$.RegisterEventHandler( 'UnreadyForDisplay', $.GetContextPanel(), Loadout.OnUnreadyForDisplay );
	$.RegisterForUnhandledEvent( 'LoadoutWedgePressed', Loadout.LoadoutWedgePressed );
	$.RegisterForUnhandledEvent( 'ShowLoadoutForItem', Loadout.SetLoadoutToSlot );
})();
