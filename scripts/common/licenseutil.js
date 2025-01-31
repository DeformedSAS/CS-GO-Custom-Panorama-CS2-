                                                             

"use strict";

var LicenseUtil = ( function ()
{
	var _GetCurrentLicenseRestrictions = function()
	{
		var szButtonText = "#Store_Get_License";
		var szMessageText = "#SFUI_LoginLicenseAssist_NoOnlineLicense";
		switch ( MyPersonaAPI.GetLicenseType() )
		{
		case "free_pw_needlink":
			szButtonText = "#Store_Link_Accounts";
			szMessageText = "#SFUI_LoginLicenseAssist_PW_NeedToLinkAccounts";
			break;
		case "free_pw_needupgrade":
			szMessageText = "#SFUI_LoginLicenseAssist_HasLicense_PW";
			break;
		case "free_pw":
			szMessageText = "#SFUI_LoginLicenseAssist_NoOnlineLicense_PW";
			break;
		case "free_sc":                                                                          
			szMessageText = "#SFUI_LoginLicenseAssist_NoOnlineLicense_SC";
			szButtonText = "#Store_Register_License";
			break;
		case "purchased":
			return false;
		}

		return {
			license_msg : szMessageText,
			license_act : szButtonText
		};
	}
	
	var _BuyLicenseForRestrictions = function( restrictions )
	{
		if ( restrictions.license_act === "#Store_Register_License" ) {
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/popups/popup_license_register.xml',
				'message=Store_Register_License' +
				'&' + 'spinner=1'
			);
		} else {
			MyPersonaAPI.ActionBuyLicense();
		}
	}

	var _ShowLicenseRestrictions = function( restrictions )
	{
		if ( restrictions !== false )
		{
			                              
			return UiToolkitAPI.ShowGenericPopupYesNo(
				$.Localize( restrictions.license_act ),
				$.Localize( restrictions.license_msg ),
				'',
				_BuyLicenseForRestrictions.bind( null, restrictions ),
				function() {}
			);
		}
	}

	return{
		GetCurrentLicenseRestrictions : _GetCurrentLicenseRestrictions,
		BuyLicenseForRestrictions : _BuyLicenseForRestrictions,
		ShowLicenseRestrictions : _ShowLicenseRestrictions
	};
})();