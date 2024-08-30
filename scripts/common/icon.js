                                                             

"use strict";

var IconUtil = ( function ()
{
	                             
    var _SetPNGImageFallback = function( mapIconDetails, icon_image_path )
    {
        if ( mapIconDetails.m_type == 'svg' )
        {
            mapIconDetails.m_type = 'png';
            mapIconDetails.m_icon.SetImage( icon_image_path + '.png' );
        }
        else
        {
            $.UnregisterEventHandler( 'ImageFailedLoad', mapIconDetails.m_icon, mapIconDetails.m_handler );
            mapIconDetails.m_icon.SetImage( 'file://{images}/map_icons/map_icon_NONE.png' );                                  
        }
    };

    var _SetupFallbackMapIcon = function( elIconPanel, icon_image_path )
    {
        var mapIconDetails = { m_icon: elIconPanel, m_type: 'svg', m_handler: -1 };
        var eventHandler = $.RegisterEventHandler( 'ImageFailedLoad', elIconPanel, _SetPNGImageFallback.bind( undefined, mapIconDetails, icon_image_path ) );
        mapIconDetails.m_handler = eventHandler;
    };

	return{
		SetupFallbackMapIcon : _SetupFallbackMapIcon
	};
})();