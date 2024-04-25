'use strict';

var GameModeFlags = ( function ()
{

	var k_gamemodeflags = {

		                                                                                                                               
		                                                                
		competitive: {
			flags: [
				48,
				32,
				16
			],
			icons: [
				'file://{images}/icons/ui/timer_both.svg',
				'file://{images}/icons/ui/timer_short.svg',
				'file://{images}/icons/ui/timer_long.svg' ]
		},

		deathmatch: {
			flags: [
				4,
				32,
				16
			],
			icons: [
				'file://{images}/icons/ui/team_deathmatch.svg',
				'file://{images}/icons/ui/normal_deathmatch.svg',
				'file://{images}/icons/ui/free_for_all.svg'
			]
		}
	}

	function _GetIcon ( mode, flags )
	{
		var iconIndex = k_gamemodeflags[ mode ].flags.indexOf( flags );
		return k_gamemodeflags[ mode ].icons[ iconIndex ];
	}

	function _GetOptionsString ( mode )
	{
		var s = '';
		var arr = k_gamemodeflags[ mode ].flags;
		for ( var i = 0; i < arr.length; ++i )
		{
			s += '&option' + i + '=' + arr[ i ];
		}
		return s;
	}

	function _AreFlagsValid ( mode, flags )
	{
		var arrPossibleFlags = k_gamemodeflags[ mode ].flags;

		return ( arrPossibleFlags.indexOf( flags ) != -1 );
	}

	function _DoesModeUseFlags ( mode )
	{
		return k_gamemodeflags.hasOwnProperty( mode );
	}


	return {
		GetOptionsString		: _GetOptionsString,
		GetIcon					: _GetIcon,
		AreFlagsValid			: _AreFlagsValid,
		DoesModeUseFlags		: _DoesModeUseFlags
	};

} )();

( function ()
{
} )();