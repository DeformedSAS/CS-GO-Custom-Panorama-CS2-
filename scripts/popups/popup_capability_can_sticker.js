'use-strict';

var CapabilityCanSticker = ( function()
{
	var m_emptySlotList = null;
	var m_scheduleHandle = null;
	var m_isRemoveStickers = false;
	var m_SlotSelectedForScratch = null;
	var m_isSticker = false;
	var m_isPatch = false;
	var m_cP = null;
	var m_toolToken = null;

	var m_prevCameraSlot = null;

	var _Init = function()
	{
		m_cP = $.GetContextPanel();

		var strMsg = m_cP.GetAttributeString( "sticker-and-itemtosticker", "(not found)" );
		                   

		var idList = strMsg.split( ',' );
		m_isRemoveStickers = idList[ 0 ] === 'remove' ? true : false;
		var itemId = idList[ 1 ];
		var toolId = m_isRemoveStickers ? '' : idList[ 0 ];

		m_isSticker = ItemInfo.IsSticker( idList[ 0 ] ) || ItemInfo.IsWeapon( idList[ 1 ] );
		m_isPatch = ItemInfo.IsPatch( idList[ 0 ] ) || ItemInfo.IsCharacter( idList[ 1 ] );

		var elTop = m_cP.FindChildTraverse( "id-popup-capability__top" );
		var elInfoBlock = m_cP.FindChildTraverse( "id-popup-capability__info-block" );

		if ( m_isSticker )
		{
			elTop.BLoadLayoutSnippet( "snippet-top--sticker" );			
			elInfoBlock.BLoadLayoutSnippet( "snippet-info-block--sticker" );
		}
		else if ( m_isPatch )
		{
			elTop.BLoadLayoutSnippet( "snippet-top--patch" );			
			elInfoBlock.BLoadLayoutSnippet( "snippet-info-block--patch" );	
		}

		if ( m_isPatch )
		{
			                                                         
			                                                                        
			                 

			var elPanel = m_cP.FindChildInLayoutFile( 'CanStickerItemModel' );
			elPanel.AddClass( 'characters' );
		}

		if ( !m_isRemoveStickers )
			m_emptySlotList = _GetEmptyStickerSlots( _GetSlotInfo( itemId ) );
		
		_SetToolName();
		_SetItemModel( toolId, itemId );
		_SetTitle();
		_SetDescText( itemId );
		_SetWarningText( toolId, itemId );
		_ShowStickerIconsToApplyOrRemove( toolId, itemId );
		_SetUpAsyncActionBar( itemId, toolId );
		_StickerBtnActions( toolId, itemId );

		$.DispatchEvent( 'CapabilityPopupIsOpen', true );
	};

	function _SetToolName ()
	{
		if ( m_isSticker )
		{
			m_toolToken = '_sticker';
		}
		else if ( m_isPatch )
		{
			m_toolToken = '_patch';		
		}	
	}

	                                                                                                    
	                                        
	                                                                                                    
	var _SetItemModel = function( toolId, itemId )
	{
		if ( !InventoryAPI.IsItemInfoValid( itemId ) )
			return;
		
		var elPanel = m_cP.FindChildInLayoutFile( 'CanStickerItemModel' );
		var modelPath = ItemInfo.GetModelPathFromJSONOrAPI( itemId ) + '?stickers';

		elPanel.SetAsActivePreviewPanel();
		elPanel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
			modelPath,
			false );
		
		elPanel.Data().id = itemId;

		if ( !m_isRemoveStickers )
		{
			_PreviewStickerInSlot( toolId, _GetSelectedStickerSlot() );
		}
	};

	var _SetTitle = function()
	{
		var title = '';

		if ( m_isRemoveStickers )
		{
			title = $.Localize( m_isPatch ? '#SFUI_InvContextMenu_can_stick_Wear_full' + m_toolToken : '#SFUI_InvContextMenu_can_stick_Wear' + m_toolToken, m_cP ) ;
		}
		else
		{
			title = $.Localize( '#SFUI_InvContextMenu_stick_use' + m_toolToken, m_cP ) ;
		}


		m_cP.SetDialogVariable( "CanStickerTitle", title );
		
	};

	var _SetDescText = function( itemId )
	{
		var currentName = ItemInfo.GetName( itemId );
		m_cP.SetDialogVariable( 'tool_target_name', currentName );

		var elDescLabel = m_cP.FindChildInLayoutFile( 'CanStickerDesc' );

		var desc = m_isRemoveStickers ?
			( m_isPatch ? '#popup_can_stick_scrape_full' + m_toolToken : '#popup_can_stick_scrape' + m_toolToken ) :
			'#popup_can_stick_desc';

		elDescLabel.text = desc;
		elDescLabel.visible = !m_isRemoveStickers;
	};

	var _SetWarningText = function( toolId, itemId )
	{
		                                                                                                           
		var warningText = _GetWarningTradeRestricted( toolId, itemId );

		            
		if ( m_isRemoveStickers )
		{
			warningText = ( m_isPatch ? '#popup_can_stick_scrape_full' + m_toolToken : '#popup_can_stick_scrape' + m_toolToken );
		}
		else if ( !m_isRemoveStickers )
		{
			if ( !warningText )
			{
				warningText = ( '#SFUI_InvUse_Warning_use_can_stick' + m_toolToken );
			}	
		}

		var elWarningLabel = m_cP.FindChildInLayoutFile( 'CanStickerWarning' );
		if ( elWarningLabel )
			elWarningLabel.text = warningText;
	};

	var _GetWarningTradeRestricted = function( toolId, itemId )
	{
		         
		                                                                                                                           
		                                                                                                                                    
		var strSpecialWarning = '';
		var strSpecialParam = null;
		var bIsPerfectWorld = MyPersonaAPI.GetLauncherType() === "perfectworld" ? true : false;

		if ( !bIsPerfectWorld )
		{
			                                                                                                                                           
			                                                                                                                                           
			if ( InventoryAPI.IsMarketable( itemId ) )
			{
				if ( !InventoryAPI.IsPotentiallyMarketable( toolId ) )
				{	                                                                                                                                                             
					                                                                                                                                   
					strSpecialParam = InventoryAPI.GetItemAttributeValue( toolId, "tradable after date" );
					if ( strSpecialParam !== undefined && strSpecialParam !== null )
					{
						strSpecialWarning = _GetSpecialWarningString( strSpecialParam, "#popup_can_stick_warning_marketrestricted" + m_toolToken );
					}
				}
				else
				{
					strSpecialWarning = _GetStickerMarketDateGreater( toolId, itemId );
				}
			}
		}
		else
		{
			strSpecialWarning = _GetStickerMarketDateGreater( toolId, itemId );
		}
		
		return strSpecialWarning;
	}

	var _GetStickerMarketDateGreater = function( toolId, itemId )
	{
		                                                                               
		var rtTradableAfterSticker = InventoryAPI.GetItemAttributeValue( toolId, "{uint32}tradable after date" );
		var rtTradableAfterWeapon = InventoryAPI.GetItemAttributeValue( itemId, "{uint32}tradable after date" );
		if ( rtTradableAfterSticker != undefined && rtTradableAfterSticker != null &&
			( rtTradableAfterWeapon == undefined || rtTradableAfterWeapon == null || rtTradableAfterSticker > rtTradableAfterWeapon ) )
		{
			var strSpecialParam = null;
			strSpecialParam = InventoryAPI.GetItemAttributeValue( toolId, "tradable after date" );
			if ( strSpecialParam != undefined && strSpecialParam != null )
			{
				return _GetSpecialWarningString( strSpecialParam, "#popup_can_stick_warning_traderestricted" + m_toolToken );
			}
		}

		return '';
	};

	var _GetSpecialWarningString = function( strSpecialParam, warningText )
	{
		var elLabel = m_cP.FindChildInLayoutFile( 'CanStickerWarning' );
		elLabel.SetDialogVariable( 'date', strSpecialParam );
		return warningText;
	}

	var _ShowStickerIconsToApplyOrRemove = function( toolId, itemId )
	{
		var elStickerToApply = m_cP.FindChildInLayoutFile( 'StickerToAppy' );
		elStickerToApply.SetHasClass( 'hidden', m_isRemoveStickers );

		var elStickersToRemove = m_cP.FindChildInLayoutFile( 'StickersToRemove' );
		elStickersToRemove.SetHasClass( 'hidden', !m_isRemoveStickers );

		if ( m_isRemoveStickers )
		{
			var slotCount = InventoryAPI.GetItemStickerSlotCount( itemId );
			
			for ( var i = 0; i < slotCount; i++ )
			{
				var imagePath = InventoryAPI.GetItemStickerImageBySlot( itemId, i );
				if ( imagePath )
				{
					if ( !m_SlotSelectedForScratch )
						m_SlotSelectedForScratch = i;
					
					var elSticker = $.CreatePanel( 'Button', elStickersToRemove, imagePath );
					elSticker.BLoadLayoutSnippet( 'ScrapeStickerBtn' );
					elSticker.FindChildInLayoutFile( 'ScrapeStickerImage' ).SetImage( 'file://{images_econ}' + imagePath + '_large.png' );
					elSticker.SetPanelEvent( 'onactivate', _OnScratchSticker.bind( undefined, elSticker, itemId, i ) );
					elSticker.SetPanelEvent( 'onmouseover', _HighlightStickerBySlot.bind( undefined, i ) ); 
					elSticker.SetPanelEvent( 'onmouseout', _HighlightStickerBySlot.bind( undefined, -1 ) );
				}
			}
		}
		else
		{
			elStickerToApply.itemid = toolId;
		}
	};

	var _SetUpAsyncActionBar = function( itemId, toolId )
	{
		m_cP.SetAttributeString( 'toolid', toolId );
		
		var elAsyncActionBarPanel = m_cP.FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		InspectAsyncActionBar.Init(
			elAsyncActionBarPanel,
			itemId,
			_GetSettingCallback,
			_AsyncActionPerformedCallback
		);
	};
	
	var _GetSettingCallback = function( settingname, defaultvalue )
	{
		return m_cP.GetAttributeString( settingname, defaultvalue );
	};

	var _AsyncActionPerformedCallback = function()
	{
		m_cP.FindChildInLayoutFile( 'CanStickerContinue' ).enabled = false;
		m_cP.FindChildInLayoutFile( 'CanStickerNextPos' ).enabled = false;
	};

	var _StickerBtnActions = function( toolId, itemId )
	{
		var slotsCount = m_isRemoveStickers ? InventoryAPI.GetItemStickerSlotCount( itemId ) : m_emptySlotList.length;

		var elAsyncActionBarPanel = m_cP.FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		InspectAsyncActionBar.EnableDisableOkBtn( elAsyncActionBarPanel, false );
		
		var elContinueBtn = m_cP.FindChildInLayoutFile( 'CanStickerContinue' );
		var elNextSlotBtn = m_cP.FindChildInLayoutFile( 'CanStickerNextPos' );
		
		if ( elContinueBtn )
			elContinueBtn.SetHasClass( 'hidden', m_isRemoveStickers || slotsCount == 1 );
		
		if ( elNextSlotBtn )
			elNextSlotBtn.SetHasClass( 'hidden', m_isRemoveStickers || slotsCount == 1 );

		if ( !m_isRemoveStickers )
		{	
			if ( slotsCount > 1 )
			{
				if ( elContinueBtn )
					elContinueBtn.SetPanelEvent( 'onactivate', _OnContinue.bind( undefined, elContinueBtn ) );
				
				if ( elNextSlotBtn )
					elNextSlotBtn.SetPanelEvent( 'onactivate', _NextSlot.bind( undefined, elContinueBtn, toolId ) );
				
					_CameraAnim( _GetSelectedStickerSlot(), false );
			}
			else
			{
				_NextSlot( elContinueBtn, toolId, true );
				_OnContinue( elContinueBtn );
			}
		}
		else
		{
			_CameraAnim( m_SlotSelectedForScratch, false );			
		}
	};

	                                                                                                    
	              
	                                                                                                    
	var _OnContinue = function( elContinueBtn )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'generic_button_press', 'MOUSE' );

		var elAsyncActionBarPanel = m_cP.FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		InspectAsyncActionBar.EnableDisableOkBtn( elAsyncActionBarPanel, true );

		m_cP.SetAttributeString( 'selectedstickerslot', _GetSelectedStickerSlot() );

		m_cP.FindChildInLayoutFile( 'StickerToAppy' ).RemoveClass( 'popup-cansticker-pickedslot--anim' );
		m_cP.FindChildInLayoutFile( 'StickerToAppy' ).AddClass( 'popup-cansticker-pickedslot--anim' );
	};

	var _NextSlot = function( elContinueBtn, toolId, bDontIncrement = false )
	{

		if ( !bDontIncrement )
			_ActiveSlotIndex.IncrementIndex();

		var activeIndex = _GetSelectedStickerSlot();
		_PreviewStickerInSlot( toolId, activeIndex );

		if ( elContinueBtn )
			elContinueBtn.enabled = true;
		
		var elAsyncActionBarPanel = m_cP.FindChildInLayoutFile( 'PopUpInspectAsyncBar' );
		InspectAsyncActionBar.EnableDisableOkBtn( elAsyncActionBarPanel, false );
		
		_CameraAnim( activeIndex, true );
	};

	var _OnScratchSticker = function( elSticker, itemId, slotIndex )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'sticker_scratchOff', 'MOUSE' );

		if ( m_isPatch )
		{
			UiToolkitAPI.ShowGenericPopupTwoOptions(
				$.Localize( '#SFUI_Patch_Remove' ),
				$.Localize( '#SFUI_Patch_Remove_Desc' ),
				'',
				$.Localize( '#SFUI_Patch_Remove' ),
				function() { InventoryAPI.WearItemSticker( itemId, slotIndex ); },
				$.Localize( '#UI_Cancel'),
				function() { }
			);
		}
		else if ( InventoryAPI.IsItemStickerAtExtremeWear( itemId, slotIndex ) )
		{
			UiToolkitAPI.ShowGenericPopupTwoOptions(
				$.Localize( '#SFUI_Sticker_Remove' ),
				$.Localize( '#SFUI_Sticker_Remove_Desc' ),
				'',
				$.Localize( '#SFUI_Sticker_Remove' ),
				function() { InventoryAPI.WearItemSticker( itemId, slotIndex ); },
				$.Localize( '#UI_Cancel'),
				function() { }
			);
		}
		else
		{
			            
			elSticker.FindChildInLayoutFile( 'ScrapingSpinner' ).RemoveClass( 'hidden' );

			                                                              
			if ( m_SlotSelectedForScratch != slotIndex )
			{
				_CameraAnim( slotIndex, true );
			}

			m_SlotSelectedForScratch = slotIndex;

			_HighlightStickerBySlot( slotIndex );
			InventoryAPI.WearItemSticker( itemId, slotIndex );			

			m_scheduleHandle = $.Schedule( 5, _CancelWaitforCallBack );
			                                                                   
		
			var panelsList = m_cP.FindChildInLayoutFile( 'StickersToRemove' ).Children();
			panelsList.forEach( element => element.enabled = false );
		}
	};

	var _HighlightStickerBySlot = function( slotIndex )
	{
		if ( m_isPatch )
		{
			InventoryAPI.HighlightPatchBySlot( slotIndex );
			_CameraAnim( slotIndex, false );
		}
		else
		{
			InventoryAPI.HighlightStickerBySlot( slotIndex );
		}
	};

	                                                                                                    
	var _PreviewStickerInSlot = function( stickerId, slot )
	{
		$.DispatchEvent( 'PlaySoundEffect', 'sticker_nextPosition', 'MOUSE' );

		var slotIndex = slot;

		InventoryAPI.PreviewStickerInModelPanel( stickerId, slotIndex );
		InventoryAPI.PeelEffectStickerBySlot( slotIndex );
		
		if ( m_isPatch )
		{
			InventoryAPI.HighlightPatchBySlot( slotIndex );
		}
		
	};

	var _ActiveSlotIndex = ( function()
	{
		var slotIndex = 0;

		var _IncrementIndex = function()
		{
			slotIndex++;
		};

		var _GetIndex = function()
		{
			return slotIndex;
		};

		return {
			IncrementIndex: _IncrementIndex,
			GetIndex: _GetIndex
		};
	} )();

	                                                                                                    
	          
	                                                                                                    
	var m_cameraRules = [
		{ weapontype: 'weapon_elite', slotsForSecondCamera: [ 2, 3 ], cameraPreset: 1 },
		{ weapontype: 'weapon_revolver', slotsForSecondCamera: [ 4 ], cameraPreset: 1 },
		{ weapontype: 'weapon_nova', slotsForSecondCamera: [ 1, 2, 3 ], cameraPreset: 1 },
		{ weapontype: 'weapon_m249', slotsForSecondCamera: [ 3 ], cameraPreset: 1 }
	];

	var _CameraAnim = function( activeIndex, bTransition )
	{
		if (m_prevCameraSlot == activeIndex || activeIndex == -1 )
			return;
		
		var elPanel = m_cP.FindChildInLayoutFile( 'CanStickerItemModel' );
		if ( !InventoryAPI.IsItemInfoValid( elPanel.Data().id ) )
			return;
		
		var defName = ItemInfo.GetItemDefinitionName( elPanel.Data().id );

		if ( m_isSticker )
		{
			var weaponProp = m_cameraRules.find( weapon => weapon.weapontype === defName );

			if ( weaponProp )
			{
				if ( weaponProp.slotsForSecondCamera.includes( activeIndex ) )
				{
					elPanel.SetCameraPreset( weaponProp.cameraPreset, bTransition );
				}
				else
				{
					elPanel.SetCameraPreset( 0, bTransition );
				}
			}
		}
		else if ( m_isPatch )
		{
			var settings = ItemInfo.GetOrUpdateVanityCharacterSettings( elPanel.Data().id );
			settings.panel = elPanel;
			settings.cameraPreset = 0;

			_UpdatePreviewPanelSettingsForPatchPosition( elPanel.Data().id, settings, activeIndex );
			CharacterAnims.PlayAnimsOnPanel( settings, !m_isRemoveStickers );
			_UpdatePreviewPanelCameraAndLightingForPatch( elPanel, elPanel.Data().id, activeIndex )

		}

		m_prevCameraSlot = activeIndex;
	};


	function _UpdatePreviewPanelSettingsForPatchPosition ( charItemId, oSettings, activeIndex = 0 )
	{
		var patchPosition = InventoryAPI.GetCharacterPatchPosition( charItemId, activeIndex );

		var loadoutslot;

		switch ( patchPosition )
		{
			case 'chest':
				loadoutslot = 'secondary1';
				break;
			
			case 'back':
			case 'rightarm':	
			case 'leftarm':
			case 'rightleg':
			case 'leftleg':
			default:
				loadoutslot = 'rifle1';
				
				break;
		}
		oSettings.loadoutSlot = loadoutslot;
		oSettings.weaponItemId = LoadoutAPI.GetItemID( oSettings.team, oSettings.loadoutSlot );
	}


	function _UpdatePreviewPanelCameraAndLightingForPatch ( elPanel, charItemId, activeIndex = 0 )
	{
		var patchPosition = InventoryAPI.GetCharacterPatchPosition( charItemId, activeIndex );

		var angle = 0;
		var lightpos = undefined;
		var lightang = undefined;
		var lightbrt = 0.5;

		var lightpos_torso = [ 51.10, -9.16, 72.78 ];
		var lightang_torso = [ 23.98, 166.50, 0.00 ];
		var campos_torso = [ 189.90, -28.08, 46.37 ];
		var camang_torso = [ -2.06, 171.74, 0.00 ];
		
		var lightpos_mid = [ 50.15, -10.03, 70.19 ];
		var lightang_mid = [ 23.98, 166.50, 0.00 ];
		var campos_mid = [ 188.43, -25.44, 38.53 ];
		var camang_mid = [ -2.06, 171.74, 0.00 ];

		var lightpos_legs = [ 50.15, -10.03, 50.19 ];
		var lightang_legs = [ 23.98, 166.50, 0.00 ];
		var campos_legs = [ 188.43, -25.44, 18.53 ];
		var camang_legs = [ -2.06, 171.74, 0.00 ];

		switch ( patchPosition )
		{
			case 'chest':
				angle = 0;
				lightpos = lightpos_torso;
				lightang = lightang_torso;
				campos = campos_torso;
				camang = camang_torso;
				break;
			
			case 'back':
				angle = 180;
				lightpos = lightpos_torso;
				lightang = lightang_torso;
				campos = campos_torso;
				camang = camang_torso;
				break;
			
			case 'rightarm':	
				angle = 40;
				lightpos = lightpos_torso;
				lightang = lightang_torso;
				campos = campos_torso;
				camang = camang_torso;
				break;
			
			
			case 'leftarm':
				angle = 280;
				lightpos = lightpos_torso;
				lightang = lightang_torso;
				campos = campos_torso;
				camang = camang_torso;
				break;
			
			case 'rightleg':
				angle = 65;
				lightpos = lightpos_legs;
				lightang = lightang_legs;
				campos = campos_legs;
				camang = camang_legs;
				break;
			
			case 'leftleg':
				angle = -90;
				lightpos = lightpos_legs;
				lightang = lightang_legs;
				campos = campos_legs;
				camang = camang_legs;
				break;
				
			case 'rightside':
				angle = 110;
				lightpos = lightpos_mid;
				lightang = lightang_mid;
				campos = campos_mid;
				camang = camang_mid;
				break;
				
			case 'rightpocket':
				angle = 40;
				lightpos = lightpos_mid;
				lightang = lightang_mid;
				campos = campos_mid;
				camang = camang_mid;
				break;
			
			default:
				angle = 0;
		}

		elPanel.SetCameraPosition( campos[0], campos[1], campos[2] );
		elPanel.SetCameraAngles( camang[0], camang[1], camang[2] );

		if ( lightang )
		elPanel.SetFlashlightAngle( lightang[0], lightang[1], lightang[2] );

		if ( lightpos )
		elPanel.SetFlashlightPosition( lightpos[ 0 ], lightpos[ 1 ], lightpos[ 2 ] );
		
		if ( lightbrt )
		elPanel.SetFlashlightAmount( lightbrt );

		elPanel.SetSceneAngles( 0, angle, 0, true );

		                                               

	}

	var _GetSlotInfo = function( itemId )
	{
		var slotsCount = InventoryAPI.GetItemStickerSlotCount( itemId );
		var slotInfoList = [];

		for ( var i = 0; i < slotsCount; i++ )
		{
			var StickerPath = InventoryAPI.GetItemStickerImageBySlot( itemId, i );
			slotInfoList.push( { index: i, path: !StickerPath ? 'empty' : StickerPath } );
		}

		return slotInfoList;
	};

	var _GetEmptyStickerSlots = function( slotInfoList )
	{
		return slotInfoList.filter( function( slot )
		{
			if ( slot.path === 'empty' )
				return true;
		} );
	};

	var _GetSelectedStickerSlot = function()
	{
		var emptySlotCount = m_emptySlotList.length;
		var activeIndex = ( _ActiveSlotIndex.GetIndex() % emptySlotCount );
		
		return m_emptySlotList[ activeIndex ].index;
	};

	                                                                                                    
	var _ClosePopUp = function()
	{
		_CancelHandleForTimeout();
		
		var elAsyncActionBarPanel = m_cP.FindChildInLayoutFile( 'PopUpInspectAsyncBar' );

		if( !elAsyncActionBarPanel.BHasClass( 'hidden' ))
		{
			InspectAsyncActionBar.OnEventToClose();
		}
	};

	var _CancelWaitforCallBack = function()
	{
		                                                                              
		                                                                                   
		                                                                                 
		                           
		m_scheduleHandle = null;
		_ClosePopUp();

		UiToolkitAPI.ShowGenericPopupOk(
			$.Localize( '#SFUI_SteamConnectionErrorTitle' ),
			$.Localize( '#SFUI_InvError_Item_Not_Given' ),
			'',
			function()
			{
			},
			function()
			{
			}
		);
	};

	var _OnFinishedScratch = function( itemid )
	{
		_CancelHandleForTimeout();

		if ( !m_cP )
			return;
		
		var elStickersToRemove = m_cP.FindChildInLayoutFile( 'StickersToRemove' );
		if ( elStickersToRemove )
		{
			var panelsList = m_cP.FindChildInLayoutFile( 'StickersToRemove' ).Children();
			panelsList.forEach( element =>
			{
				element.enabled = true;
				element.FindChildInLayoutFile( 'ScrapingSpinner' ).AddClass( 'hidden' );
			
			} );

			var elPanel = m_cP.FindChildInLayoutFile( 'CanStickerItemModel' );
			_SetItemModel( '', elPanel.Data().id, true );
			_CameraAnim( m_SlotSelectedForScratch, false );
		}


		


	};

	var _CancelHandleForTimeout = function()
	{
		if ( m_scheduleHandle !== null )
		{
			                                                                        
			$.CancelScheduled( m_scheduleHandle );
			m_scheduleHandle = null;
		}
	};
	
	return {
		Init: 											_Init,
		ClosePopUp: 									_ClosePopUp,
		NextSlot: 										_NextSlot,
		OnFinishedScratch: 								_OnFinishedScratch,
		UpdatePreviewPanelCameraAndLightingForPatch: 	_UpdatePreviewPanelCameraAndLightingForPatch,
		UpdatePreviewPanelSettingsForPatchPosition:		_UpdatePreviewPanelSettingsForPatchPosition,
	};
} )();

( function()
{
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', CapabilityCanSticker.OnFinishedScratch );
} )();
