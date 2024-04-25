'use strict';

var freezePanel = ( function() {
	
	var _OnSetFlairEvent = function( xuid, skillgroup )
	{
		var elAvatarFlair = $( '#AvatarFlair' );
		var elMedalText = $( '#MedalText' );
		var elAvatarFlairSS = $( '#AvatarFlairSS' );
		var elMedalTextSS = $( '#MedalTextSS' );
		var elPlayerAvatarSkillGroup = $( '#PlayerAvatarSkillGroup' );

		var flairItemImage = _GetFlairItemImage( xuid );
		if ( flairItemImage !== '' )
		{
			elAvatarFlair.RemoveClass( 'FreezePanel__AvatarFlair--Hidden' );
			elAvatarFlair.SetImage( 'file://{images_econ}' + flairItemImage + '_small.png' );
			elAvatarFlairSS.RemoveClass( 'FreezePanel__AvatarFlair--Hidden' );
			elAvatarFlairSS.SetImage( 'file://{images_econ}' + flairItemImage + '_small.png' );

			var flairItemName = InventoryAPI.GetFlairItemName( xuid );
			if ( flairItemName === '' || flairItemName === undefined )
			{
				elMedalText.AddClass( 'FreezePanel__MedalText--Hidden' );
				elMedalTextSS.AddClass( 'FreezePanel__MedalText--Hidden' );
			}
			else
			{
				elMedalText.RemoveClass( 'FreezePanel__MedalText--Hidden' );
				elMedalText.text = flairItemName;
				elMedalTextSS.RemoveClass( 'FreezePanel__MedalText--Hidden' );
				elMedalTextSS.text = flairItemName;
			}
		}
		else
		{
			elAvatarFlair.AddClass( 'FreezePanel__AvatarFlair--Hidden' );
			elMedalText.AddClass( 'FreezePanel__MedalText--Hidden' );
			elAvatarFlairSS.AddClass( 'FreezePanel__AvatarFlair--Hidden' );
			elMedalTextSS.AddClass( 'FreezePanel__MedalText--Hidden' );
		}

		if ( skillgroup )
		{
			elPlayerAvatarSkillGroup.SetImage( 'file://{images}/icons/skillgroups/dangerzone'+skillgroup+'.svg' );
			elPlayerAvatarSkillGroup.RemoveClass( 'FreezePanel__AvatarSkillGroup--Hidden' );
		}
		else
		{
			elPlayerAvatarSkillGroup.AddClass( 'FreezePanel__AvatarSkillGroup--Hidden' );
		}
	}

	                                            
	                                          
	var _GetFlairItemImage = function( xuid )
	{
		if( xuid === '' || xuid === '0'|| xuid === 0 )
		{
			return '';
		}

		var flairItemId = InventoryAPI.GetFlairItemId( xuid );

		                                                                                   
		if ( flairItemId === "0" || !flairItemId )
		{
			var flairDefIdx = FriendsListAPI.GetFriendDisplayItemDefFeatured( xuid );
			flairItemId = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( flairDefIdx, 0 );

			if ( flairItemId === "0" || !flairItemId )
			return '';
		}

		var imagePath = InventoryAPI.GetItemInventoryImage( flairItemId );
		
		return imagePath;
	}

	return {
		OnSetFlairEvent : _OnSetFlairEvent
	};
} )();

(function()
{
	$.RegisterEventHandler( 'CSGOHudFreezePanelSetFlair', $.GetContextPanel(), freezePanel.OnSetFlairEvent );
})();