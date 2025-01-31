'use strict';

var CharacterButtons = ( function() {

	function _PopulateWeaponDropdownForCharacter ( elDropdown, modelPanelSettings )
	{
		var list = ItemInfo.GetLoadoutWeapons( modelPanelSettings.team );

		if ( !list || list.length == 0 )
		{
			return;
		}

		elDropdown.RemoveAllOptions();

		list.forEach( function( entry )
		{

			var newEntry = $.CreatePanel( 'Panel', elDropdown, entry, {
				'class': 'DropDownMenu'
			} );
			newEntry.SetAcceptsFocus( true );
			
			var elRarity = $.CreatePanel( 'Label', newEntry, 'rarity');
			elRarity.style.width = '100%';
			elRarity.style.height = '100%';
			elRarity.style.padding = '0px 0px';
			var rarityColor = ItemInfo.GetRarityColor( entry );
	  		                                   
	  		                      
			elRarity.style.backgroundColor = "gradient( linear, 0% 0%, 100% 0%, from(" + rarityColor + " ),  color-stop( 0.0125, #00000000 ), to( #00000000 ) );";

			var elLabel = $.CreatePanel( 'Label', newEntry, 'label', {
				'text': ItemInfo.GetName( entry )
			} );

			elDropdown.AddOption( newEntry );
		} );
		
		elDropdown.SetPanelEvent( 'oninputsubmit', _OnUpdateWeaponSelection.bind( undefined, elDropdown, modelPanelSettings, true ) );
		elDropdown.SetSelected( modelPanelSettings.weaponItemId );
	}

	var _OnUpdateWeaponSelection = function ( elDropdown, modelPanelSettings, bPlaySound )
	{
		                                                
		modelPanelSettings.weaponItemId = elDropdown.GetSelected() ? elDropdown.GetSelected().id : "";

		CharacterAnims.PlayAnimsOnPanel( modelPanelSettings );

		                                                                                                           

		                                                         
		   
		  
		                                                                                     
		                                                                                       
		                     
		   
		   	                                                                             
		   	                                                                                  
		   	                          
		   	                
		   	 
		   		                                                
		   		 
		   			                                                      
		   			 
		   				                                         
		   				      
		   			 
		   		 
		   
		   		                                                            
		   		 
		   			                                                           
		   			                                                                                 
		   			                                                             
		   		 
		   	 
		    
	};

	function _ZoomCamera ()
	{
		var data = $.GetContextPanel().Data();

		var elZoomButton = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItemModelZoom' );
		data.m_modelPanelSettings.cameraPreset =
			elZoomButton.checked
				? data.m_characterToolbarButtonSettings.cameraPresetZoomed
				: data.m_characterToolbarButtonSettings.cameraPresetUnzoomed;

		data.m_modelPanelSettings.panel.SetCameraPreset( data.m_modelPanelSettings.cameraPreset, true );
	}

	function _PlayCheer ()
	{
		                   
		var elZoomButton = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItemModelZoom' );
		if ( elZoomButton.checked )
			elZoomButton.checked = false;

		var data = $.GetContextPanel().Data();
		data.m_modelPanelSettings.cameraPreset = data.m_characterToolbarButtonSettings.cameraPresetUnzoomed;

		                                                                                        
		                                                
		var modelRenderSettingsOneOffTempCopy = ItemInfo.DeepCopyVanityCharacterSettings( data.m_modelPanelSettings );
		modelRenderSettingsOneOffTempCopy.arrModifiers = [ InventoryAPI.GetCharacterDefaultCheerByItemId( modelRenderSettingsOneOffTempCopy.charItemId ) ];
		modelRenderSettingsOneOffTempCopy.activity = 'ACT_CSGO_UIPLAYER_CELEBRATE';

		CharacterAnims.PlayAnimsOnPanel( modelRenderSettingsOneOffTempCopy );

		StoreAPI.RecordUIEvent( "PlayCheer", 1 );
	}

	function _PreviewModelVoice ()
	{
		var data = $.GetContextPanel().Data();
		InventoryAPI.PreviewModelVoice( data.m_modelPanelSettings.charItemId );
		StoreAPI.RecordUIEvent( "PlayCheer", 2 );
	}
	
	function _InitCharacterButtons ( elButtons, elPreviewpanel, characterToolbarButtonSettings )
	{
		                             
		   	              
		   	                        
		   	                      
		     

		                     
		if ( !elButtons )
			return;
		elButtons.Children().forEach( el => el.enabled = true );
		
		if ( !elPreviewpanel )
			return;
		
		var elZoomButton = elButtons.FindChildInLayoutFile( 'LoadoutSingleItemModelZoom' );

		var modelPanelSettings = ItemInfo.GetOrUpdateVanityCharacterSettings( characterToolbarButtonSettings.charItemId );
		modelPanelSettings.panel = elPreviewpanel;
		modelPanelSettings.cameraPreset = elZoomButton.checked ? characterToolbarButtonSettings.cameraPresetZoomed : characterToolbarButtonSettings.cameraPresetUnzoomed;
		
		var elDropdown = elButtons.FindChildInLayoutFile( 'LoadoutSingleItemModelWeaponChoice' );

		_PopulateWeaponDropdownForCharacter( elDropdown, modelPanelSettings  );

		var cheer = ItemInfo.GetDefaultCheer( modelPanelSettings.charItemId );
		var elCheer = elButtons.FindChildInLayoutFile( 'PlayCheer' );
		elCheer.enabled = cheer != undefined && cheer != "";
	
		                                                                        
		elButtons.Data().m_characterToolbarButtonSettings = characterToolbarButtonSettings;
		elButtons.Data().m_modelPanelSettings = modelPanelSettings;
	}
		

                          
    return {
		InitCharacterButtons:	 				_InitCharacterButtons,
		PlayCheer: 								_PlayCheer,
		PreviewModelVoice: 						_PreviewModelVoice,
		ZoomCamera:								_ZoomCamera,
    };

} )();

                                                                                                    
                                           
                                                                                                    
(function ()
{

})();
