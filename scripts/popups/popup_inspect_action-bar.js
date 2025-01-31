'use strict';

var InspectActionBar = ( function (){

	var m_modelImagePanel = null;
	var m_itemId = '';
	var m_callbackHandle = -1;

	                                
	var m_showCert = true;
	var m_showEquip = true;
	var m_insideCasketID = '';
	var m_capability = '';
	var m_showSave = true;
	var m_showMaketLink = false;
	var m_showCharSelect = true;
	var m_blurOperationPanel = false;
	var m_previewingMusic = false;
	var m_isSelected = false;
	var m_schfnMusicMvpPreviewEnd = null;
	
	var _Init = function( elPanel, itemId, funcGetSettingCallback, funcGetSettingCallbackInt, elItemModelImagePanel )
	{
		if ( funcGetSettingCallback( 'inspectonly', 'false' ) === 'false' )
			return;
		
		elPanel.RemoveClass( 'hidden' );

		m_modelImagePanel = elItemModelImagePanel;
		m_itemId = itemId;
		m_callbackHandle = funcGetSettingCallbackInt( 'callback', -1 );
		m_showCert = ( funcGetSettingCallback( 'showitemcert', 'true' ) === 'false' );
		m_showEquip = ( funcGetSettingCallback( 'showequip', 'true' ) === 'false' );
		m_insideCasketID = funcGetSettingCallback( 'insidecasketid', '' );
		m_capability = funcGetSettingCallback( 'capability', '' );
		m_showSave = ( funcGetSettingCallback( 'allowsave', 'true' ) === 'true' );
		m_showMaketLink = ( funcGetSettingCallback( 'showmarketlink', 'false' ) === 'true' );
		m_showCharSelect = ( funcGetSettingCallback( 'showcharselect', 'true' ) === 'true' );
		m_isSelected = ( funcGetSettingCallback( 'isselected', 'false' ) === 'true' ); 
		m_blurOperationPanel = ( $.GetContextPanel().GetAttributeString( 'bluroperationpanel', 'false' ) === 'true' ) ? true : false;
		
		_SetUpItemCertificate( elPanel, itemId );
		_SetupEquipItemBtns( elPanel, itemId );
		_ShowButtonsForWeaponInspect( elPanel, itemId );
		_ShowButtonsForCharacterInspect( elPanel, itemId );
		_SetCloseBtnAction( elPanel );
		_SetUpMarketLink( elPanel, itemId );

		var slot = ItemInfo.GetSlot( itemId );
		if ( slot == "musickit" )
		{
			                                                                        
			InventoryAPI.PlayItemPreviewMusic( itemId );
			m_previewingMusic = true;

			                                                              
			var elMusicBtn = elPanel.FindChildInLayoutFile( 'InspectPlayMvpBtn' );
			elMusicBtn.SetHasClass( 'hidden', ( InventoryAPI.GetItemRarity( itemId ) <= 0 ) );                                      
		}
	};

	var _SetUpItemCertificate = function ( elPanel, id, funcGetSettingCallback )
	{
		var elCert = elPanel.FindChildInLayoutFile( 'InspectItemCert' );
		if ( !elCert || !elCert.IsValid() )
		{
			return;
		}
		
		var certData = InventoryAPI.GetItemCertificateInfo( id );

		if( !certData || m_showCert )
		{
			elCert.visible = false;
			return;
		}

		var aCertData = certData.split("\n"); 
		var strLine = "";
	
		for ( var i = 0; i < aCertData.length -1; i++ )
		{
			if( i % 2 == 0 )
			{
				strLine = strLine + "<b>" + aCertData[i] + "</b>" + ": " + aCertData[i + 1] + "<br><br>";
			}
		}

		elCert.visible = true;
		elCert.SetPanelEvent( 'onmouseover', function (){
			UiToolkitAPI.ShowTextTooltip('InspectItemCert', strLine);
		});

		elCert.SetPanelEvent( 'onmouseout', function (){
			UiToolkitAPI.HideTextTooltip();
		});
	};

	var _SetUpMarketLink = function( elPanel, id )
	{
		var elMarketLinkBtn = elPanel.FindChildInLayoutFile( 'InspectMarketLink' );

		elMarketLinkBtn.SetHasClass( 'hidden', !m_showMaketLink );

		if ( !m_showMaketLink )
		{
			return;
		}

		elMarketLinkBtn.SetPanelEvent( 'onmouseover', function (){
			UiToolkitAPI.ShowTextTooltip('InspectMarketLink', '#SFUI_Store_Market_Link');
		});

		elMarketLinkBtn.SetPanelEvent( 'onmouseout', function (){
			UiToolkitAPI.HideTextTooltip();
		});

		elMarketLinkBtn.SetPanelEvent( 'onactivate', function() {
			SteamOverlayAPI.OpenURL( ItemInfo.GetMarketLinkForLootlistItem( id ));
			StoreAPI.RecordUIEvent( "ViewOnMarket" );
		});
	};

	var _SetupEquipItemBtns = function ( elPanel, id )
	{
		var elMoreActionsBtn = elPanel.FindChildInLayoutFile( 'InspectActionsButton' );
		var elSingleActionBtn = elPanel.FindChildInLayoutFile( 'SingleAction' );

		if ( m_insideCasketID )
		{
			elMoreActionsBtn.AddClass( 'hidden' );
			elSingleActionBtn.RemoveClass( 'hidden' );
			elSingleActionBtn.text = !m_isSelected ? '#UI_Select' : '#UI_Unselect';
			elSingleActionBtn.SetPanelEvent( 'onactivate', _OnActivateUpdateSelectionForMultiSelect.bind( this, id ) );
			return;
		}
		
		if ( m_showEquip )
		{
			elMoreActionsBtn.AddClass( 'hidden' );
			elSingleActionBtn.AddClass( 'hidden' );
			return;
		}

		var isFanToken = ItemInfo.ItemDefinitionNameSubstrMatch(id, 'tournament_pass_');
		var isSticker = ItemInfo.ItemMatchDefName( id, 'sticker' );
		var isPatch = ItemInfo.ItemMatchDefName( id, 'patch' );
		var isSpraySealed = ItemInfo.IsSpraySealed( id );
		var isEquipped = ( ItemInfo.IsEquippedForT( id ) || ItemInfo.IsEquippedForCT( id ) || ItemInfo.IsEquippedForNoTeam( id ) ) ? true : false;
		
		                                                 
		if ( ItemInfo.IsEquippalbleButNotAWeapon( id ) ||
			isSticker ||
			isSpraySealed ||
			isFanToken ||
			isPatch ||
			isEquipped )
		{
			elMoreActionsBtn.AddClass( 'hidden' );

			if ( !isEquipped  )
			{
				elSingleActionBtn.RemoveClass( 'hidden' );
				_SetUpSingleActionBtn( elPanel, id, ( isSticker || isSpraySealed || isFanToken || isPatch ) );
			}

			return;
		}
		else
		{
			elMoreActionsBtn.RemoveClass( 'hidden' );
			elSingleActionBtn.AddClass( 'hidden' );
		}
	};

	var _SetUpSingleActionBtn = function( elPanel, id, isSticker )
	{
		var validEntries = ItemContextEntires.FilterEntries( 'inspect' );
		var elSingleActionBtn = elPanel.FindChildInLayoutFile( 'SingleAction' );

		for( var i = 0; i < validEntries.length; i++ )
		{
			var entry = validEntries[ i ];
			
			if ( entry.AvailableForItem( id ) )
			{
				var closeInspect = isSticker ? true : false;
				var displayName = '';

				if ( entry.name instanceof Function )
				{
					displayName = entry.name( id );
				}
				else
				{
					displayName = entry.name;
				}

				elSingleActionBtn.text = '#inv_context_' + displayName;
				elSingleActionBtn.SetPanelEvent( 'onactivate', _OnSingleAction.bind( this, entry, id, closeInspect ) );
			}
		}
	};

	var _OnSingleAction= function( entry, id, closeInspect )
	{
		if ( closeInspect )
		{
			_CloseBtnAction();
		}
		
		entry.OnSelected( id );
	};

	var _OnActivateUpdateSelectionForMultiSelect = function( idSubjectItem )
	{
		_CloseBtnAction();

		$.DispatchEvent( 'UpdateSelectItemForCapabilityPopup',
			m_capability,
			idSubjectItem,
			!m_isSelected
		);
		
		                                                
		   	    
		   	                                                              
		   	             
		   	                                  
		   	              
		   	                               
		   	                                   
		     
	};

	                                                                                                    
	                            
	                                                                                                    
	var _ShowButtonsForWeaponInspect = function ( elPanel, id )
	{
		if ( m_showCharSelect === false )
		{
			return;
		}
		
		var hasAnims = ItemInfo.IsCharacter( id ) || ItemInfo.IsWeapon( id );

		if ( hasAnims &&
			!ItemInfo.IsEquippalbleButNotAWeapon( id ) &&
			!ItemInfo.ItemMatchDefName( id, 'sticker' ) &&
			!ItemInfo.IsSpraySealed( id ) &&
			!ItemInfo.ItemDefinitionNameSubstrMatch( id, "tournament_journal_" ) &&
			!ItemInfo.ItemDefinitionNameSubstrMatch( id, "tournament_pass_" )
		)
		{
			elPanel.FindChildInLayoutFile( 'InspectCharBtn' ).SetHasClass( 'hidden', !hasAnims );
			elPanel.FindChildInLayoutFile( 'InspectWeaponBtn' ).SetHasClass( 'hidden', !hasAnims );

			var list =	                                                                          
				CharacterAnims.GetValidCharacterModels( true ).filter(function (entry) {
					return (ItemInfo.IsItemCt(id) && ( entry.team === 'ct' || entry.team === 'any' )) ||
						(ItemInfo.IsItemT(id) && ( entry.team === 't'|| entry.team === 'any')) ||
						ItemInfo.IsItemAnyTeam(id);
				});
			
			if ( list && ( list.length > 0 )  && !elPanel.FindChildInLayoutFile( 'InspectDropdownCharModels' ).Data().selectedId )
				_SetDropdown( elPanel, list, id );
		}
	};

	function _ShowButtonsForCharacterInspect ( elPanel, id )
	{
		var elPreviewPanel = m_modelImagePanel.FindChildTraverse( 'InspectItemModel' );

		if ( !ItemInfo.IsCharacter( id ) )
			return;
		
		elPanel.FindChildInLayoutFile( 'id-character-button-container' ).SetHasClass( 'hidden', false );	
		
		var inspectCameraPresets =
		{
			"AspectRatio4x3": [ 16, 17 ],
			"AspectRatio16x9": [ 26, 27 ],
			"AspectRatio21x9": [ 28, 29 ]
		}

		var arrCameraSetToUse = inspectCameraPresets.AspectRatio4x3;
		
		if ( $.GetContextPanel().BAscendantHasClass( "AspectRatio16x9" ) ||
			$.GetContextPanel().BAscendantHasClass( "AspectRatio16x10" ))
		{
			arrCameraSetToUse = inspectCameraPresets.AspectRatio16x9;
		}
		else if ( $.GetContextPanel().BAscendantHasClass( "AspectRatio21x9" ) )
		{
			arrCameraSetToUse = inspectCameraPresets.AspectRatio21x9;
		}

		var characterToolbarButtonSettings = {
			charItemId: id,
			cameraPresetUnzoomed: arrCameraSetToUse[0],
			cameraPresetZoomed: arrCameraSetToUse[1]
		};

		var elCharacterButtons = elPanel.FindChildInLayoutFile( 'id-character-buttons' );
		CharacterButtons.InitCharacterButtons( elCharacterButtons, elPreviewPanel, characterToolbarButtonSettings );
	}

	var _SetDropdown = function( elPanel, vaildEntiresList, id )
	{
		                                       
		var currentMainMenuVanitySettings = ItemInfo.GetOrUpdateVanityCharacterSettings(
			ItemInfo.IsItemAnyTeam( id ) ? null
			: LoadoutAPI.GetItemID( ItemInfo.IsItemCt(id) ? 'ct' : 't', 'customplayer' )
		);

		var elDropdown = elPanel.FindChildInLayoutFile( 'InspectDropdownCharModels' );

		vaildEntiresList.forEach( function( entry )
		{
			var rarityColor = ItemInfo.GetRarityColor( entry.itemId );
			
			var newEntry = $.CreatePanel( 'Label', elDropdown, entry.itemId, {
				'class': 'DropDownMenu',
				'html': 'true',
				'text': "<font color='" + rarityColor + "'>•</font> " + entry.label,
				'data-team': ( entry.team === 'any' ) ? ( ( ItemInfo.IsItemT(id) || ItemInfo.IsItemAnyTeam(id) ) ? 't' : 'ct' ) : entry.team
			});
	
			elDropdown.AddOption( newEntry );
		} );

		elDropdown.SetPanelEvent( 'oninputsubmit', InspectActionBar.OnUpdateCharModel.bind( undefined, false, elDropdown, id ));
		elDropdown.SetSelected( currentMainMenuVanitySettings.charItemId );
		elDropdown.SetPanelEvent( 'oninputsubmit', InspectActionBar.OnUpdateCharModel.bind( undefined, true, elDropdown, id ));
	};

	var _OnUpdateCharModel = function ( bPlaySound, elDropdown, weaponItemId )
	{
		var characterItemId = elDropdown.GetSelected().id;
		elDropdown.Data().selectedId = elDropdown.GetSelected().id;
		
		InspectModelImage.SetCharScene( m_modelImagePanel, characterItemId, weaponItemId );
		
		                                                                                     
		                                                                                       
		                     
		   
		   	                                                                             
		   	                                                                                  
		   	                          
		   	                                             
		   		                                                 
		   			                                     
		   			      
		   		 
		   	 
		   
		   	                                                       
		   		                                                       
		   		                                                                                 
		   	 
		    
	};



	                                                                                                    
	                              
	                                                                                                    
	var _NavigateModelPanel = function ( type )
	{ 
		InspectModelImage.ShowHideItemPanel( m_modelImagePanel, ( type !== 'InspectModelChar' ) );
		InspectModelImage.ShowHideCharPanel( m_modelImagePanel, ( type === 'InspectModelChar' ));

		$.GetContextPanel().FindChildTraverse( 'InspectCharModelsControls' ).SetHasClass( 'hidden', type !== 'InspectModelChar' );
	};

	var _InspectPlayMusic = function ( type )
	{
		                                                        
		if ( !m_previewingMusic )
			return;

		if ( type === 'mvp' )
		{
			if ( m_schfnMusicMvpPreviewEnd )
				return;	                                                                    

			InventoryAPI.StopItemPreviewMusic();
			InventoryAPI.PlayItemPreviewMusic( m_itemId, 'roundmvpanthem_01.mp3' );

			                                                                                         
			m_schfnMusicMvpPreviewEnd = $.Schedule( 6.8, InspectActionBar.InspectPlayMusic.bind( null, 'schfn' ) );
		}
		else if ( type === 'schfn' )
		{
			m_schfnMusicMvpPreviewEnd = null;
			InventoryAPI.StopItemPreviewMusic();
			InventoryAPI.PlayItemPreviewMusic( m_itemId );
		}
	}

	var _ShowContextMenu = function ()
	{
		var elBtn = $.GetContextPanel().FindChildTraverse( 'InspectActionsButton' );
		var id = m_itemId;
		                                         

		var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
			elBtn.id,
			'',
			'file://{resources}/layout/context_menus/context_menu_inventory_item.xml',
			'itemid='+id+'&populatefiltertext=inspect',
			function () 
			{
				$.DispatchEvent( "PlaySoundEffect", "weapon_selectReplace", "MOUSE" );
			}
		);
		contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
	};

	var _SetCloseBtnAction = function( elPanel )
	{
		var elBtn = elPanel.FindChildInLayoutFile( 'InspectCloseBtn' );
		elBtn.SetPanelEvent( 'onactivate', _CloseBtnAction );
	};

	var _CloseBtnAction = function ()
	{
		$.DispatchEvent( "PlaySoundEffect", "inventory_inspect_close", "MOUSE" );

		if ( m_modelImagePanel && m_modelImagePanel.IsValid() )
		{
			InspectModelImage.CancelCharAnim( m_modelImagePanel );
		}

		                                                      
		$.DispatchEvent( 'UIPopupButtonClicked', '' );

		var callbackFunc = m_callbackHandle;
		if ( callbackFunc != -1 )
		{
			UiToolkitAPI.InvokeJSCallback( callbackFunc );
		}

		if( m_blurOperationPanel )
		{
			$.DispatchEvent( 'UnblurOperationPanel' );
		}

		if ( m_previewingMusic )
		{
			InventoryAPI.StopItemPreviewMusic();
			m_previewingMusic = false;

			if ( m_schfnMusicMvpPreviewEnd )
			{
				$.CancelScheduled( m_schfnMusicMvpPreviewEnd );
				m_schfnMusicMvpPreviewEnd = null;
			}
		}
	};

	return{
		Init						: _Init,
		ShowContextMenu: _ShowContextMenu,
		CloseBtnAction: _CloseBtnAction,
		NavigateModelPanel: _NavigateModelPanel,
		InspectPlayMusic: _InspectPlayMusic,
		OnUpdateCharModel: _OnUpdateCharModel
	};
} )();

( function()
{
} )();
