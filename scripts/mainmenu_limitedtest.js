'use strict';

var LimitedTest = ( function()
{
	var _m_cp = $.GetContextPanel();


	var _Init = function()
	{
		_m_cp.FindChildInLayoutFile( 'id-mainmenu-limitedtest' ).SetPanelEvent( 
			'onactivate',
			function(){
				UiToolkitAPI.ShowCustomLayoutPopupParameters( '', 'file://{resources}/layout/popups/popup_limitedtest.xml', '' );

		});
	};

	return {
		Init: _Init
	};

} )();

                             
( function()
{
	LimitedTest.Init();
} )();