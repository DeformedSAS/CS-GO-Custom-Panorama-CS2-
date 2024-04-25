'use strict';

var StoreLinkedItems = ( function()
{

	function _Init ()
	{
		var itemId = $.GetContextPanel().GetAttributeString( "itemids", "" );
		var extrapopupfullscreenstyle = $.GetContextPanel().GetAttributeString( "extrapopupfullscreenstyle", "" );
		var isDisabled = $.GetContextPanel().GetAttributeString( "disablepurchase", "" ) !== "true" ? false : true;
		var aItemIds = itemId.split(',');

		var usetinynames = $.GetContextPanel().GetAttributeString( "usetinynames", "" );

		                              
		var elItem = null;

		for( var i = 0; i < aItemIds.length; i++ )
		{
			var elItem = $.GetContextPanel().FindChildInLayoutFile( aItemIds[ i ] );

			if( !elItem )
			{
				elItem = $.CreatePanel( 'Button', $.GetContextPanel().FindChildInLayoutFile( 'id-store-linked-items-images' ), aItemIds[ i ] );
				
				elItem.Data().oData = {
					id: aItemIds[ i ],
					isMarketItem: false,
					extrapopupfullscreenstyle: extrapopupfullscreenstyle,
					isDisabled: isDisabled
				}

				if ( usetinynames )
				{
					elItem.Data().oData.usetinynames = usetinynames;
				}

				elItem.BLoadLayout( "file://{resources}/layout/mainmenu_store_tile.xml", false, false );
			}
		}

		_ShowWarningText();
	}

	function _ShowWarningText ()
	{
		var warningText = $.GetContextPanel().GetAttributeString( "warningtext", "" );
		if ( warningText )
		{
			$.GetContextPanel().SetHasClass( 'hidewarning', false );
			$.GetContextPanel().FindChildInLayoutFile( 'id-store-linked-items-warning' ).text = $.Localize( warningText );
		}
		else
		{
			$.GetContextPanel().SetHasClass( 'hidewarning', true );
		}
	}

	return {
		Init: _Init,
	}
})();

(function()
{

})();