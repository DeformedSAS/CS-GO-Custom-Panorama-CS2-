'use strict';

var PopupPrimeStatus = ( function ()
{
	var m_bIsPerfectWorld = ( ( MyPersonaAPI.GetLauncherType() === "perfectworld" ) && !GameInterfaceAPI.HasCommandLineParm( '-forceperfectworld' ) ) ? true : false;
	var m_btnPurchase = $( '#PurchaseButton' );

	var _Init = function ()
	{
		_SetStatusPanel( MyPersonaAPI.GetElevatedState() );
	}

	function _SetStatusPanel( strState )
	{
		                                                       
		                                                        
		                                                                                                                                         
		    
		   	                                                                                                                                                                                 
		    

		if( strState !== "elevated" )
		{
			m_btnPurchase.visible = true;
			_SetUpPurchaseBtn();

			return;
		}

		m_btnPurchase.visible= false;
	}

	function _SetUpPurchaseBtn ()
	{
		               
		                                            

		var sPrice = StoreAPI.GetStoreItemSalePrice( InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( 1353, 0 ), 1, '' );
		m_btnPurchase.SetDialogVariable( "price", sPrice ? sPrice : '$0' );
		
		m_btnPurchase.SetPanelEvent('onactivate', function () {
			SteamOverlayAPI.OpenURL( _GetStoreUrl() + '/sub/54029');
			$.DispatchEvent('UIPopupButtonClicked', '');
		});
	}

	function _GetStoreUrl()
	{
		return 'https://store.' +
			((SteamOverlayAPI.GetAppID() == "710") ? 'beta.' : '') +
			((MyPersonaAPI.GetSteamType() === 'china' || MyPersonaAPI.GetLauncherType() === "perfectworld" ) ? 'steamchina' : 'steampowered') + '.com';
	}

	function _UpdateEleveatedStatusPanel()
	{
		_SetStatusPanel( MyPersonaAPI.GetElevatedState() );
	}

	return {
		Init						: _Init,
		UpdateEleveatedStatusPanel	:_UpdateEleveatedStatusPanel
	}

})();

(function()
{
	$.RegisterForUnhandledEvent( "PanoramaComponent_MyPersona_ElevatedStateUpdate", PopupPrimeStatus.UpdateEleveatedStatusPanel );
})();
