"use strict";

                                                                                                    
          
                                                                                                    
var SettingsMenu = ( function () {

	var activeTab;
	
	let tabInfo = {
		Promoted: {
			xml: "settings_promoted",
			radioid: "PromotedSettingsRadio"
		},
		KeybdMouseSettings: {
			xml: 'settings_kbmouse',                            
			radioid: "KBMouseRadio"                                            
		},
		ControllerSettings: {
			xml: 'settings_steaminput',                                                                      
			radioid: "ControllerRadio"
		},
		GameSettings: {
			xml: "settings_game",
			radioid: "GameRadio"
		},
		AudioSettings: {
			xml: "settings_audio",
			radioid: "AudioRadio"
		},
		VideoSettings: {
			xml: "settings_video",
			radioid: "VideoRadio"
		},
		Search: {
			xml: "settings_search",
			radioid: "SettingsRadio"
		}
	};

    var _NavigateToTab = function( tabID ) 
    {
		
        var parentPanel = $('#SettingsMenuContent');

                                               
                                    
        if (!parentPanel.FindChildInLayoutFile(tabID)) 
        {
            _InitTab(tabID);
        }

                                                                                  
                                
        if( activeTab !==  tabID )
        {
                                             
            if( activeTab )
            {
                var panelToHide = $.GetContextPanel().FindChildInLayoutFile( activeTab );
                panelToHide.RemoveClass( 'Active' ); 
                                                   
            }
            
                               
            var prevTab = activeTab;
            activeTab = tabID;
            var activePanel = $.GetContextPanel().FindChildInLayoutFile( tabID );
            activePanel.AddClass( 'Active' );

                                          

                                                                                     
                                                
            {
                activePanel.visible = true;
                activePanel.SetReadyForDisplay( true );   
            }

            SettingsMenuShared.NewTabOpened( activeTab );

			  
			  
			  
            var controllerSettingsStr = 'ControllerSettings';
            if (tabID == controllerSettingsStr) 
            {
                $.DispatchEvent("CSGOControllerSettingsOpened");
            }
        }
    };

    var _AccountPrivacySettingsChanged = function()
    {
                                                                                        
                                                                                           
                                                                                           
        var gameSettingPanel = $.GetContextPanel().FindChildInLayoutFile ( "GameSettings" );
        if ( gameSettingPanel != null )
        {
            var twitchTvSetting = gameSettingPanel.FindChildInLayoutFile( "accountprivacydropdown" );
            if ( twitchTvSetting != null )
            {
                twitchTvSetting.OnShow();                
            }
        }
    }

	var _OnSettingsMenuShown = function ()
	{
		                                                                             
		                                                                                   
		                                               
		SettingsMenuShared.NewTabOpened( activeTab );
	}

	var _OnSettingsMenuHidden = function ()
	{
	                                   
	GameInterfaceAPI.ConsoleCommand( "host_writeconfig" );
	}

	var _NavigateToSetting = function ( tab, id )
	{
		                                                  
		$.DispatchEvent( "Activated", $( "#" + tabInfo[ tab ].radioid ), "mouse" );
		SettingsMenuShared.ScrollToId( id );                     
	}
	var _NavigateToSettingPanel = function( tab, p )
	{
		$.DispatchEvent( "Activated", $( "#" + tabInfo[ tab ].radioid ), "mouse" );
		p.ScrollParentToMakePanelFit(3, false);
		p.AddClass('Highlight');
	}

	var _InitTab = function(tabID) 
    {
        var parentPanel = $('#SettingsMenuContent');

        var newPanel = $.CreatePanel('Panel', parentPanel, tabID);
                                                         

        let XmlName = tabInfo[ tabID ].xml;
        newPanel.BLoadLayout('file://{resources}/layout/settings/' + XmlName + '.xml', false, false );
            
                                                                                    
                                                               
        newPanel.OnPropertyTransitionEndEvent = function ( panelName, propertyName )
        {   
            if( newPanel.id === panelName && propertyName === 'opacity')
            {
                                                         
                if( newPanel.visible === true && newPanel.BIsTransparent() )
                {
                                                                   
                    newPanel.visible = false;
                    newPanel.SetReadyForDisplay( false );
                    return true;
                }
            }

            return false;
        }

        $.RegisterEventHandler( 'PropertyTransitionEnd', newPanel, newPanel.OnPropertyTransitionEndEvent );
  
                                                                                                            
        newPanel.visible = false;
    }
	var _Init = function( )
	{
		                                                             
		for (let tab in tabInfo) {
			if ( tab !== "Promoted" && tab !== "Search" )
                _InitTab(tab);
		}
	}

	return {
		Init                            : _Init,
        InitTab	                        : _InitTab,
		NavigateToTab	                : _NavigateToTab,
		NavigateToSetting	            : _NavigateToSetting,
		NavigateToSettingPanel	        : _NavigateToSettingPanel,
		AccountPrivacySettingsChanged   : _AccountPrivacySettingsChanged,
		OnSettingsMenuShown             : _OnSettingsMenuShown,
		OnSettingsMenuHidden            : _OnSettingsMenuHidden
};

} )() ;

                                                                                                    
                                           
                                                                                                    
(function ()
{
	SettingsMenu.Init();

	if ( PromotedSettingsUtil.GetUnacknowledgedPromotedSettings().length > 0 )
	{
		SettingsMenu.NavigateToTab( 'Promoted' );
	}
	else
	{
		const now = new Date();
		if ( g_PromotedSettings.filter( setting => setting.start_date <= now && setting.end_date > now ).length == 0 )
			$( '#PromotedSettingsRadio' ).visible = false;

		SettingsMenu.NavigateToTab( 'GameSettings' );
	}

	MyPersonaAPI.RequestAccountPrivacySettings();
	$.RegisterForUnhandledEvent( "PanoramaComponent_MyPersona_AccountPrivacySettingsChanged", 
		SettingsMenu.AccountPrivacySettingsChanged );

	$.RegisterEventHandler( 'ReadyForDisplay', $( '#JsSettings' ), SettingsMenu.OnSettingsMenuShown );
	$.RegisterEventHandler( 'UnreadyForDisplay', $( '#JsSettings' ), SettingsMenu.OnSettingsMenuHidden );
	$.RegisterForUnhandledEvent( 'SettingsMenu_NavigateToSetting',  SettingsMenu.NavigateToSetting );
	$.RegisterForUnhandledEvent( 'SettingsMenu_NavigateToSettingPanel',  SettingsMenu.NavigateToSettingPanel );
	
})();

