'use strict';


var SettingsMenuShared = ( function () {


	var _ResetControlsRecursive = function( panel )
	{
		if ( panel == null )
		{
			return;
		}

		if (panel.GetChildCount == undefined)
		{
			                                       
			return;
		}

		if (panel.paneltype == 'CSGOSettingsSlider' || panel.paneltype == 'CSGOSettingsEnumDropDown')
		{
			panel.RestoreCVarDefault();
		}
		else if ( panel.paneltype == 'CSGOSettingsKeyBinder' )
		{
			                                                                                          
			panel.OnShow();
		}
		else                                          
		{
			var nCount = panel.GetChildCount();
			for ( var i = 0; i < nCount; i++ )
			{
				var child = panel.GetChild(i);
				_ResetControlsRecursive(child);
			}
		}
	};

	var _ResetControls = function( )
	{
		                        
		_ResetControlsRecursive($.GetContextPanel());
	};

	var _ResetKeybdMouseDefaults = function( )
	{
		                                 
		OptionsMenuAPI.RestoreKeybdMouseBindingDefaults();
		_ResetControls();
	};

    var _ResetSteamInputDefaults = function( )
    {
                                         
        OptionsMenuAPI.RestoreKeybdMouseBindingDefaults();
        _ResetControls();
    };

	var _ResetAudioSettings = function( )
	{
		$.DispatchEvent( "CSGOAudioSettingsResetDefault" );
		_ResetControls();
	};

	var _ResetVideoSettings = function( )
	{
		$.DispatchEvent( "CSGOVideoSettingsResetDefault" );
		_ResetControls();
		_VideoSettingsOnUserInputSubmit();
	};
	
	var _RefreshControlsRecursive = function( panel )
	{
		if ( panel == null )
		{
			return;
		}

		if ( panel.OnShow != undefined )
		{
			panel.OnShow();
		}
		
		if (panel.GetChildCount == undefined)
		{
			                                       
			return;
		}
		else                                          
		{
			var nCount = panel.GetChildCount();
			for ( var i = 0; i < nCount; i++ )
			{
				var child = panel.GetChild(i);
				_RefreshControlsRecursive(child);
			}
		}
	};

	var _ShowConfirmReset = function ( resetCall, locText )
	{
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle('#settings_reset_confirm_title',
			locText,
			'',
			'#settings_reset',
			function() {
				resetCall();
			},
			'#settings_return',
			function() {
			},
			'dim'
		);
	}

	var _ShowConfirmDiscard = function ( discardCall )
	{
		UiToolkitAPI.ShowGenericPopupTwoOptionsBgStyle('#settings_discard_confirm_title',
			'#settings_discard_confirm_video_desc',
			'',
			'#settings_discard',
			function() {
				discardCall();
			},
			'#settings_return',
			function() {
			},
			'dim'
		);
	}

	var _ScrollToId = function ( locationId )
	{
		var elLocationPanel = $.GetContextPanel().FindChildTraverse( locationId );

		if ( elLocationPanel != null )
		{
			elLocationPanel.ScrollParentToMakePanelFit(3, false);
			elLocationPanel.AddClass('Highlight');
		}
	}
	
	                                                                    
	                                           
	                                      
	                                       
	                                         

	var gBtnApplyVideoSettingsButton=null;
	var gBtnDiscardVideoSettingChanges=null;
	
	var _VideoSettingsOnUserInputSubmit = function ()
	{
		if ( gBtnApplyVideoSettingsButton != null )
		{
			gBtnApplyVideoSettingsButton.enabled = true;
		}

		if ( gBtnDiscardVideoSettingChanges != null )
		{
			gBtnDiscardVideoSettingChanges.enabled = true;
		}
	}

	var _VideoSettingsResetUserInput = function ()
	{
		if ( gBtnApplyVideoSettingsButton != null )
		{
			gBtnApplyVideoSettingsButton.enabled = false;
		}

		if ( gBtnDiscardVideoSettingChanges != null )
		{
			gBtnDiscardVideoSettingChanges.enabled = false;
		}
	}

	var _VideoSettingsDiscardChanges = function ()
	{
		$.DispatchEvent( "CSGOVideoSettingsInit" );
		_VideoSettingsResetUserInput();
	}

	var _VideoSettingsApplyChanges = function ()
	{
		$.DispatchEvent( "CSGOApplyVideoSettings" );
		_VideoSettingsResetUserInput();
	}

	var _NewTabOpened = function ( newTab )
	{
		                                            
		
		var videoSettingsStr = 'VideoSettings';
        
		if ( newTab == videoSettingsStr )
		{
			var videoSettingsPanel = $.GetContextPanel().FindChildInLayoutFile( videoSettingsStr );
			
			                                                                 
			gBtnApplyVideoSettingsButton = videoSettingsPanel.FindChildInLayoutFile( "BtnApplyVideoSettings" );
			gBtnDiscardVideoSettingChanges = videoSettingsPanel.FindChildInLayoutFile( "BtnDiscardVideoSettingChanges" );
			
			                                  
			gBtnApplyVideoSettingsButton.enabled = false;
			gBtnDiscardVideoSettingChanges.enabled = false;

			                                         
			$.DispatchEvent( "CSGOVideoSettingsInit" );
		} 
		
		var newTabPanel = $.GetContextPanel().FindChildInLayoutFile( newTab );
		_RefreshControlsRecursive( newTabPanel );

		                                                                               
		GameInterfaceAPI.ConsoleCommand( "host_writeconfig");
	}

	var _ShowHudEdgePositions = function()
	{
		UiToolkitAPI.ShowCustomLayoutPopup('', 'file://{resources}/layout/popups/popup_hud_edge_positions.xml');
	}

	var _ChangeBackground = function( delta )
	{
		let elBkg = $( "#XhairBkg" );
		if ( elBkg )
		{
			let nBkgIdx = elBkg.GetAttributeInt( "bkg-id", 0 );
			let arrBkgs = [ "bkg-dust2", "bkg-aztec", "bkg-mirage", "bkg-office" ];
			nBkgIdx = ( arrBkgs.length + nBkgIdx + delta ) % arrBkgs.length;
			elBkg.SwitchClass( "bkg-style", arrBkgs[ nBkgIdx ] );
			elBkg.SetAttributeInt( "bkg-id", nBkgIdx );
		}
	}

	return {

		ResetControlsRecursivepanel	    : _ResetControlsRecursive,
		ResetControls	                : _ResetControls,
		ResetKeybdMouseDefaults	        : _ResetKeybdMouseDefaults,
        ResetSteamInputDefaults	        : _ResetSteamInputDefaults,
		ResetAudioSettings	            : _ResetAudioSettings,
		ResetVideoSettings	            : _ResetVideoSettings,
		ScrollToId                      : _ScrollToId,
		ShowConfirmReset                : _ShowConfirmReset,
		ShowConfirmDiscard				: _ShowConfirmDiscard,
		VideoSettingsOnUserInputSubmit  : _VideoSettingsOnUserInputSubmit,
		VideoSettingsDiscardChanges		: _VideoSettingsDiscardChanges,
		VideoSettingsApplyChanges		: _VideoSettingsApplyChanges,
		NewTabOpened					: _NewTabOpened,
		ShowHudEdgePositions			: _ShowHudEdgePositions,
        ChangeBackground 				: _ChangeBackground,
	};

} )();
