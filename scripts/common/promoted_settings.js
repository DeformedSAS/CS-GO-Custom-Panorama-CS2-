'use strict';

                                                                                                                                      
var g_PromotedSettingsVersion = 1;

var g_PromotedSettings = [
	  
		                                                              
		                                                                 
		                                                                
		                                                 
		  	
		                                       
		                                                                                        
		                                                      
		                                                      
		                                                                              
		                                                                                                                         
					                                           
		                                                                                                              
					                                    
	  
	{
		id: "BuyMenuDonationKey",
		loc_name: "#SFUI_Settings_BuyWheelDonateKey",
		loc_desc: "#SFUI_Settings_BuyWheelDonateKey_Info",
		section: "GameSettings",
		start_date: new Date( 'December 17, 2020' ), 
		end_date: new Date( 'April 31, 2021' ),
	},
	{
		id: "SettingsChatWheel",
		loc_name: "#settings_ui_chatwheel_section",
		loc_desc: "#Chatwheel_description",
		section: "KeybdMouseSettings",
		start_date: new Date( 'November 25, 2020' ), 
		end_date: new Date( 'April 30, 2021' ),
	},
	{
		id: "SettingsCommunicationSettings",
		                                           
		                                        
		loc_name: "#SFUI_Settings_FilterText_Title",
		loc_desc: "#SFUI_Settings_FilterText_Title_Tooltip",
		section: "GameSettings",
		start_date: new Date( 'June 11, 2020' ), 
		end_date: new Date( 'June 30, 2020' )
	},
	{
	    id: "MainMenuMovieSceneSelector",
	    loc_name: "#GameUI_MainMenuMovieScene",
	    loc_desc: "#GameUI_MainMenuMovieScene_Tooltip",
		section: "VideoSettings",
		start_date: new Date( 'May 26, 2020' ), 
		end_date: new Date( 'June 15, 2020' )
	},
	{
	    id: "XhairShowObserverCrosshair",
	    loc_name: "#GameUI_ShowObserverCrosshair",
	    loc_desc: "#GameUI_ShowObserverCrosshair_Tooltip",
		section: "GameSettings",
		start_date: new Date( 'April 15, 2020' ), 
		end_date: new Date( 'May 1, 2020' )
	},
	{
		id: "SettingsCrosshair",
		loc_name: "#settings_crosshair",
		loc_desc: "#settings_crosshair_info",
		section: "GameSettings",
		start_date: new Date( 'February 24, 2019' ), 
		end_date: new Date( 'March 28, 2020' )
	},
	{
		id: "TripleMonitor",
		loc_name: "#SFUI_Settings_Triple_Monitor",
		loc_desc: "#GameUI_TripleMonitor_Tooltip",
		section: "VideoSettings",
		start_date: new Date( 'November 20, 2019' ), 
		end_date: new Date( 'January 30, 2020' )
	},
	{
		id: "ClutchKey",
		loc_name: "#GameUI_Clutch_Key",
		loc_desc: "#GameUI_Clutch_Key_Tooltip",
		section: "KeybdMouseSettings",
		start_date: new Date( 'September 21, 2019' ), 
		end_date: new Date( 'January 30, 2020' )
	},
	{
		id: "id-friendlyfirecrosshair",
		loc_name: "#GameUI_FriendlyWarning",
		loc_desc: "#GameUI_FriendlyWarning_desc",
		section: "GameSettings",
		start_date: new Date( 'October 7, 2019' ), 
		end_date: new Date( 'February 30, 2020' )
	},
	{
		id: "SettingsCommunicationSettings",
		loc_name: "#settings_comm_binds_section",
		loc_desc: "#settings_comm_binds_info",
		section: "GameSettings",
		start_date: new Date( 'September 13, 2019' ), 
		end_date: new Date( 'January 30, 2020' )
	},
	{
		id: "RadialWepMenuBinder",
		loc_name: "#SFUI_RadialWeaponMenu",
		loc_desc: "#SFUI_RadialWeaponMenu_Desc",
		section: "KeybdMouseSettings",
		start_date: new Date( 'September 18, 2019' ), 
		end_date: new Date( 'January 30, 2020' )
	},
];

var PromotedSettingsUtil = ( function ()
{
	function _GetUnacknowledgedPromotedSettings()
	{
		if ( g_PromotedSettings.length == 0 )
			return [];

		let settingsInfo = GameInterfaceAPI.GetSettingString( "cl_promoted_settings_acknowledged" ).split( ':' );
		let version = parseInt( settingsInfo.shift() );
		let arrNewSettings = [];
		if ( version === g_PromotedSettingsVersion )
		{
			                                                 
			let timeLastViewed = new Date( parseInt( settingsInfo.shift() ) );
			for ( let setting of g_PromotedSettings )
			{
				const now = new Date();
				if ( setting.start_date > timeLastViewed && setting.start_date <= now )
					arrNewSettings.push( setting );
			}
		}
		else
		{
			                                                                             
			                                                 
			const now = new Date();
			return g_PromotedSettings.filter( setting => setting.start_date <= now && setting.end_date > now );
		}
		return arrNewSettings;
	}

	                                                                                              
	var hPromotedSettingsViewedEvt = $.RegisterForUnhandledEvent( "MainMenu_PromotedSettingsViewed", function ( id )
	{
		                  
		GameInterfaceAPI.SetSettingString( "cl_promoted_settings_acknowledged", "" + g_PromotedSettingsVersion + ":" + Date.now() );
		$.UnregisterForUnhandledEvent( "MainMenu_PromotedSettingsViewed", hPromotedSettingsViewedEvt );
	} );

	return {
		GetUnacknowledgedPromotedSettings : _GetUnacknowledgedPromotedSettings
	}
}() );

