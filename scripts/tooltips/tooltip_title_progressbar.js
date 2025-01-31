
'use-strict';

var TooltipProgress = ( function()
{
	function _Init()
	{

		var titleText = $.GetContextPanel().GetAttributeString( "titletext", "not-found" );
		var bodyText = $.GetContextPanel().GetAttributeString( "bodytext", "not-found" );
		var useXp = $.GetContextPanel().GetAttributeString( "usexp", "false" ) === 'true';
		var value = 0;
		
		if ( useXp )
		{
			var currentPoints = FriendsListAPI.GetFriendXp( MyPersonaAPI.GetXuid() ),
			pointsPerLevel = MyPersonaAPI.GetXpPerLevel();
			value = ( currentPoints / pointsPerLevel ) * 100;
		}
		else
		{
			value = $.GetContextPanel().GetAttributeString( "barvalue", "0" );
		}

		                                            

		$( '#TitleLabel' ).text = $.Localize( titleText );
		$( '#TextLabel' ).text = $.Localize( bodyText );
		$( '#TextPercentage' ).text = Math.floor( value ) + '%';
		$( '#js-tooltip-progress-bar-inner' ).style.width = value + '%';

	}

	return {
		Init: _Init
	}
} )();

( function()
{
	                          
	                                                                                                                                           
} )();