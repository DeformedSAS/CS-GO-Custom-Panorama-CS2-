'use strict';

                                                                                 

var MockAdapter = ( function()
{

	var k_GetMatchEndWinDataJSO = "k_GetMatchEndWinDataJSO";
	var k_GetScoreDataJSO = "k_GetScoreDataJSO";
	var k_GetPlayerName = "k_GetPlayerName";
	var k_IsFakePlayer = "k_IsFakePlayer";
	var k_XpDataJSO = "k_XpDataJSO";
	var k_GetGameModeInternalName = "k_GetGameModeInternalName";
	var k_GetGameModeName = "k_GetGameModeName";
	var k_SkillgroupDataJSO = "k_SkillgroupDataJSO";
	var k_DropListJSO = "k_DropListJSO";
	var k_GetTimeDataJSO = "k_GetTimeDataJSO";
	var k_NextMatchVotingData = "k_NextMatchVotingData";
	var k_GetPlayerStatsJSO = "k_GetPlayerStatsJSO";
	var k_GetPlayerDataJSO = "k_GetPlayerDataJSO";
	var k_IsTournamentMatch = "k_IsTournamentMatch";
	var k_GetServerName = "k_GetServerName";
	var k_GetMapName = "k_GetMapName";
	var k_GetTournamentEventStage = "k_GetTournamentEventStage";
	var k_GetGameModeImagePath = "k_GetGameModeImagePath";
	var k_GetMapBSPName = "k_GetMapBSPName";
	var k_GetPlayerTeamName = "k_GetPlayerTeamName";
	var k_GetPlayerTeamNumber = "k_GetPlayerTeamNumber";
	var k_GetTeamNextRoundLossBonus = "k_GetTeamNextRoundLossBonus";
	var k_AreTeamsPlayingSwitchedSides = "k_AreTeamsPlayingSwitchedSides";
	var k_AreTeamsPlayingSwitchedSidesInRound = "k_AreTeamsPlayingSwitchedSidesInRound";
	var k_HasHalfTime = "k_HasHalfTime";
	var k_IsDemoOrHltv = "k_IsDemoOrHltv";
	var k_IsHLTVAutodirectorOn = "k_IsHLTVAutodirectorOn";
	var k_GetTeamLogoImagePath = "k_GetTeamLogoImagePath";
	var k_GetTeamLivingPlayerCount = "k_GetTeamLivingPlayerCount";
	var k_GetTeamLogoImagePath = "k_GetTeamLogoImagePath";
	var k_GetTeamTotalPlayerCount = "k_GetTeamTotalPlayerCount";
	var k_GetTeamClanName = "k_GetTeamClanName";
	var k_IsXuidValid = "k_IsXuidValid";
	var k_GetPlayerIndex = "k_GetPlayerIndex";
	var k_GetLocalPlayerXuid = "k_GetLocalPlayerXuid";
	var k_IsLocalPlayerHLTV = "k_IsLocalPlayerHLTV";
	var k_GetPlayerStatus = "k_GetPlayerStatus";
	var k_GetPlayerCommendsLeader = "k_GetPlayerCommendsLeader";
	var k_GetPlayerCommendsFriendly = "k_GetPlayerCommendsFriendly";
	var k_GetPlayerCommendsTeacher = "k_GetPlayerCommendsTeacher";
	var k_GetPlayerCompetitiveRanking = "k_GetPlayerCompetitiveRanking";
	var k_GetPlayerXpLevel = "k_GetPlayerXpLevel";
	var k_GetTeamGungameLeaderXuid = "k_GetTeamGungameLeaderXuid";
	var k_GetPlayerScore = "k_GetPlayerScore";
	var k_GetPlayerMVPs = "k_GetPlayerMVPs";
	var k_GetPlayerKills = "k_GetPlayerKills";
	var k_GetPlayerAssists = "k_GetPlayerAssists";
	var k_GetPlayerDeaths = "k_GetPlayerDeaths";
	var k_GetPlayerPing = "k_GetPlayerPing";
	var k_GetPlayerColor = "k_GetPlayerColor";
	var k_HasCommunicationAbuseMute = "k_HasCommunicationAbuseMute";
	var k_IsSelectedPlayerMuted = "IsSelectedPlayerMuted";
	var k_IsPlayerConnected = "k_IsPlayerConnected";
	var k_ArePlayersEnemies = "k_ArePlayersEnemies";
	var k_GetPlayerClanTag = "k_GetPlayerClanTag";
	var k_GetPlayerMoney = "k_GetPlayerMoney";
	var k_GetPlayerActiveWeaponItemId = "k_GetPlayerActiveWeaponItemId";
	var k_GetPlayerModel = "k_GetPlayerModel";
	var k_GetPlayerGungameLevel = "k_GetPlayerGungameLevel";
	var k_GetPlayerItemCT = "k_GetPlayerItemCT";
	var k_GetPlayerItemTerrorist = "k_GetPlayerItemTerrorist";
	var k_AccoladesJSO = "k_AccoladesJSO";
	var k_GetCharacterDefaultCheerByXuid = "k_GetCharacterDefaultCheerByXuid";
	var k_GetCooperativePlayerTeamName = "k_GetCooperativePlayerTeamName";
	var k_GetAllPlayersMatchDataJSO = "k_GetAllPlayersMatchDataJSO";
	var k_GetPlayerCharacterItemID = "k_GetPlayerCharacterItemID";
	var k_GetFauxItemIDFromDefAndPaintIndex = "GetFauxItemIDFromDefAndPaintIndex";

	var _m_mockData = undefined;

	function _SetMockData ( dummydata )
	{
		_m_mockData = dummydata;
	}

	function _GetMockData ()
	{
		return _m_mockData;
	}

	function FindMockTable ( key )
	{
		var arrTablesInUse = _m_mockData.split( ',' );

		for ( let group of arrTablesInUse )
		{
			if ( MOCK_TABLE.hasOwnProperty( group ) && MOCK_TABLE[ group ].hasOwnProperty( key ) )
			{
				return MOCK_TABLE[ group ];
			}
		}

		if ( MOCK_TABLE[ 'defaults' ].hasOwnProperty( key ) )
		{
			return MOCK_TABLE[ 'defaults' ];
		}
		else
			return undefined;

	}

	function _APIAccessor ( val, key, xuid = -1 )
	{
		if ( !_m_mockData )
		{
			var temp = JSON.stringify( val );
			return val;
		}

		return GetProperty( key, xuid );
	}

	function GetProperty ( key, xuid )
	{
		var table = FindMockTable( key );

		if ( !table )
			return 0;


		var val = undefined;

		                                        
		if ( xuid !== -1 && table[ key ].hasOwnProperty( xuid ) )
		{
			val = table[ key ][ xuid ];
		}
		else
		{
			val = table[ key ];
		}

		                                                    
		if ( val && typeof val === "function" )
		{
			return val( xuid );
		}
		else
		{
			return val;
		}


	}

	var _getLoadoutWeapons = function( team )
	{

		  	                              

		var list = [];

		var slotStrings = LoadoutAPI.GetLoadoutSlotNames( false );
		var slots = JSON.parse( slotStrings );

		slots.forEach( slot => 
		{
			var itemId = LoadoutAPI.GetItemID( team, slot );

			var bIsWeapon = ItemInfo.IsWeapon( itemId );

			                                                        

			if ( bIsWeapon ) 
			{
				list.push( itemId );
			}
		} );

		return list;
	}


	function _GetRandomWeaponFromLoadout ()
	{
		  	                              

		var team = ( _m_mockData.search( 'team_ct' ) !== -1 ) ? 'ct' : 't';

		var list = _getLoadoutWeapons( team );

		return list[ _r( 0, list.length ) ];
	}

	function _GetRandomPlayerStatsJSO ( xuid )
	{
		var oPlayerStats = {"damage": 0, "kills": 0, "assists": 0, "deaths": 0, "adr": 0, "kdr": 0, "3k": 0, "4k": 0, "5k": 0, "headshotkills": 0, "hsp": 0, "worth": 0, "killreward": 0, "cashearned": 99, "livetime": 0, "objective": 0, "utilitydamage": 0, "enemiesflashed": 0}

		Object.keys( oPlayerStats ).forEach( stat =>
		{
			oPlayerStats[ stat ] = _r();

		} );

		return oPlayerStats;
	}

	function _r ( min = 0, max = 100 ) {return Math.floor( Math.random() * ( ( max - min ) + min ) + 0.5 )};

	function _GetRandomXP ()
	{
		var ret = {
			"xp_earned":
			{
				"2": _r( 0, 1000 ),
				"6": _r( 0, 1000 ),
			},
			"current_level": _r( 0, 39 ),
			"current_xp": _r( 0, 4999 ),
		};

		return ret;
	}

	function _GetRandomSkillGroup ()
	{
		var oldrank = _r( 1, 18 );
		var newrank = oldrank + _r( -1, 1 );

		var ret = {
			"old_rank": oldrank,
			"new_rank": newrank,
			"num_wins": _r( 10, 1000 )
		};

		return ret;
	}

	function _GetRandomPlayerModel ( team )
	{
		var PlayerModels = {
			"ct":
				[
					"models/player/custom_player/legacy/ctm_fbi.mdl",
					"models/player/custom_player/legacy/ctm_fbi_varianta.mdl",
					"models/player/custom_player/legacy/ctm_fbi_variantb.mdl",
					"models/player/custom_player/legacy/ctm_fbi_variantc.mdl",
					"models/player/custom_player/legacy/ctm_fbi_variantd.mdl",
					"models/player/custom_player/legacy/ctm_fbi_variante.mdl",

					"models/player/custom_player/legacy/ctm_fbi_varianth.mdl",
					"models/player/custom_player/legacy/ctm_fbi_variantf.mdl",
					"models/player/custom_player/legacy/ctm_fbi_variantg.mdl",

					"models/player/custom_player/legacy/ctm_st6.mdl",
					"models/player/custom_player/legacy/ctm_st6_varianta.mdl",
					"models/player/custom_player/legacy/ctm_st6_variantb.mdl",
					"models/player/custom_player/legacy/ctm_st6_variantc.mdl",
					"models/player/custom_player/legacy/ctm_st6_variantd.mdl",

					"models/player/custom_player/legacy/ctm_st6_varianti.mdl",
					"models/player/custom_player/legacy/ctm_st6_variantm.mdl",
					"models/player/custom_player/legacy/ctm_st6_variantg.mdl",
					"models/player/custom_player/legacy/ctm_st6_variantk.mdl",
					"models/player/custom_player/legacy/ctm_st6_variante.mdl",

					"models/player/custom_player/legacy/ctm_gign.mdl",
					"models/player/custom_player/legacy/ctm_gign_varianta.mdl",
					"models/player/custom_player/legacy/ctm_gign_variantb.mdl",
					"models/player/custom_player/legacy/ctm_gign_variantc.mdl",
					"models/player/custom_player/legacy/ctm_gign_variantd.mdl",

					"models/player/custom_player/legacy/ctm_gsg9.mdl",
					"models/player/custom_player/legacy/ctm_gsg9_varianta.mdl",
					"models/player/custom_player/legacy/ctm_gsg9_variantb.mdl",
					"models/player/custom_player/legacy/ctm_gsg9_variantc.mdl",
					"models/player/custom_player/legacy/ctm_gsg9_variantd.mdl",

					"models/player/custom_player/legacy/ctm_idf.mdl",
					"models/player/custom_player/legacy/ctm_idf_variantb.mdl",
					"models/player/custom_player/legacy/ctm_idf_variantc.mdl",
					"models/player/custom_player/legacy/ctm_idf_variantd.mdl",
					"models/player/custom_player/legacy/ctm_idf_variante.mdl",
					"models/player/custom_player/legacy/ctm_idf_variantf.mdl",

					"models/player/custom_player/legacy/ctm_sas.mdl",
					"models/player/custom_player/legacy/ctm_sas_variantf.mdl",

					"models/player/custom_player/legacy/ctm_swat.mdl",
					"models/player/custom_player/legacy/ctm_swat_varianta.mdl",
					"models/player/custom_player/legacy/ctm_swat_variantb.mdl",
					"models/player/custom_player/legacy/ctm_swat_variantc.mdl",
					"models/player/custom_player/legacy/ctm_swat_variantd.mdl",

					"models/player/custom_player/legacy/ctm_heavy.mdl",


				],

			"t":
				[
					"models/player/custom_player/legacy/tm_balkan_variante.mdl",
					"models/player/custom_player/legacy/tm_balkan_varianta.mdl",
					"models/player/custom_player/legacy/tm_balkan_variantb.mdl",
					"models/player/custom_player/legacy/tm_balkan_variantc.mdl",
					"models/player/custom_player/legacy/tm_balkan_variantd.mdl",

					"models/player/custom_player/legacy/tm_balkan_variantf.mdl",
					"models/player/custom_player/legacy/tm_balkan_variantg.mdl",
					"models/player/custom_player/legacy/tm_balkan_varianth.mdl",
					"models/player/custom_player/legacy/tm_balkan_varianti.mdl",
					"models/player/custom_player/legacy/tm_balkan_variantj.mdl",

					"models/player/custom_player/legacy/tm_leet_variante.mdl",
					"models/player/custom_player/legacy/tm_leet_varianta.mdl",
					"models/player/custom_player/legacy/tm_leet_variantb.mdl",
					"models/player/custom_player/legacy/tm_leet_variantc.mdl",
					"models/player/custom_player/legacy/tm_leet_variantd.mdl",
					"models/player/custom_player/legacy/tm_leet_variantf.mdl",
					"models/player/custom_player/legacy/tm_leet_varianth.mdl",
					"models/player/custom_player/legacy/tm_leet_variantg.mdl",
					"models/player/custom_player/legacy/tm_leet_varianti.mdl",

					"models/player/custom_player/legacy/tm_anarchist.mdl",
					"models/player/custom_player/legacy/tm_anarchist_varianta.mdl",
					"models/player/custom_player/legacy/tm_anarchist_variantb.mdl",
					"models/player/custom_player/legacy/tm_anarchist_variantc.mdl",
					"models/player/custom_player/legacy/tm_anarchist_variantd.mdl",

					"models/player/custom_player/legacy/tm_phoenix.mdl",
					"models/player/custom_player/legacy/tm_phoenix_varianta.mdl",
					"models/player/custom_player/legacy/tm_phoenix_variantb.mdl",
					"models/player/custom_player/legacy/tm_phoenix_variantc.mdl",
					"models/player/custom_player/legacy/tm_phoenix_variantd.mdl",

					"models/player/custom_player/legacy/tm_pirate.mdl",
					"models/player/custom_player/legacy/tm_pirate_varianta.mdl",
					"models/player/custom_player/legacy/tm_pirate_variantb.mdl",
					"models/player/custom_player/legacy/tm_pirate_variantc.mdl",
					"models/player/custom_player/legacy/tm_pirate_variantd.mdl",

					"models/player/custom_player/legacy/tm_professional.mdl",
					"models/player/custom_player/legacy/tm_professional_var1.mdl",
					"models/player/custom_player/legacy/tm_professional_var2.mdl",
					"models/player/custom_player/legacy/tm_professional_var3.mdl",
					"models/player/custom_player/legacy/tm_professional_var4.mdl",

					"models/player/custom_player/legacy/tm_separatist.mdl",
					"models/player/custom_player/legacy/tm_separatist_varianta.mdl",
					"models/player/custom_player/legacy/tm_separatist_variantb.mdl",
					"models/player/custom_player/legacy/tm_separatist_variantc.mdl",
					"models/player/custom_player/legacy/tm_separatist_variantd.mdl",

					"models/player/custom_player/legacy/tm_phoenix_variantg.mdl",
					"models/player/custom_player/legacy/tm_phoenix_variante.mdl",
					"models/player/custom_player/legacy/tm_phoenix_variantf.mdl",

					"models/player/custom_player/legacy/tm_phoenix_heavy.mdl",


				]
		}

		return PlayerModels[ team ][ Math.floor( Math.random() * PlayerModels[ team ].length ) ];
	}

	function _GetRandomAccolades ()
	{
		function _GetRandomAccoladeTitle ()
		{
			var titles = [
				"kills",
				"damage",
				"adr",
				"mvps",
				"assists",
				"hsp",
				"3k",
				"4k",
				"5k",
				"headshotkills",
				"killreward",
				"utilitydamage",
				"enemiesflashed",
				"objective",
				"worth",
				"score",
				"livetime",
				"deaths",
				"nopurchasewins",
				"clutchkills",
				"footsteps",           
				"pistolkills",
				"firstkills",
				"sniperkills",
				"roundssurvived",
				"chickenskilled",
				"killswhileblind",
				"bombcarrierkills",
				"burndamage",
				"cashspent",
				"uniqueweaponkills",

				"gimme_01",
				"gimme_02",
				"gimme_03",
				"gimme_04",
				"gimme_05",
				"gimme_06",
			];

			return titles[ Math.floor( Math.random() * titles.length ) ];
		}

		function _GetRandomAccolade ( xuid )
		{
			var name = _GetRandomAccoladeTitle();
			var pos = name.includes( "gimme_" ) ? 1 : 1 + Math.floor( Math.random() * 2 );

			var accolade = {
				accolade: name,
				value: Math.floor( Math.random() * 1000 ),
				xuid: xuid,
				position: pos
			}

			return accolade;
		}



		var oAccolades =
		{
			titles:
				[
					_GetRandomAccolade( 1 ),
					_GetRandomAccolade( 3 ),
					_GetRandomAccolade( 5 ),
					_GetRandomAccolade( 7 ),
					_GetRandomAccolade( 9 ),

					_GetRandomAccolade( 2 ),
					_GetRandomAccolade( 4 ),
					_GetRandomAccolade( 6 ),
					_GetRandomAccolade( 8 ),
					_GetRandomAccolade( 10 ),

					_GetRandomAccolade( 11 ),
					_GetRandomAccolade( 13 ),
					_GetRandomAccolade( 15 ),
					_GetRandomAccolade( 17 ),
					_GetRandomAccolade( 19 ),

					_GetRandomAccolade( 12 ),
					_GetRandomAccolade( 14 ),
					_GetRandomAccolade( 16 ),
					_GetRandomAccolade( 18 ),
					_GetRandomAccolade( 20 ),
				]
		}

		return oAccolades;
	}

	function _InternalGetFauxItemId ( defid, paintid )
	{
		return String( InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( defid, paintid ) );
	}

	function _GetRandomModelDefIndex ( teamnum )
	{

		var models = [
			[],    
			[],     
			[			                   
				4780,
				4777,
				4774,
			],
			[			                           
				4771,
				4757,
				4751
			],
		]

		var random = _r( 0, 2 );

		                                 
		    
		   	                    
		    

		return ( models[ parseInt( teamnum ) ][ random ] );
		



	}



	var MOCK_TABLE =
	{
		          

		          	
	}

	                      
	return {

		GetMatchEndWinDataJSO: function _APIGetMatchEndWinDataJSO () {return _APIAccessor( GameStateAPI.GetMatchEndWinDataJSO(), k_GetMatchEndWinDataJSO );},
		GetScoreDataJSO: function _GetScoreDataJSO () {return _APIAccessor( GameStateAPI.GetScoreDataJSO(), k_GetScoreDataJSO );},
		GetPlayerName: function _GetPlayerName ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerName( xuid ), k_GetPlayerName, xuid );},
		GetPlayerNameWithNoHTMLEscapes: function GetPlayerNameWithNoHTMLEscapes ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerNameWithNoHTMLEscapes( xuid ), k_GetPlayerName, xuid );},
		IsFakePlayer: function _IsFakePlayer ( xuid ) {return _APIAccessor( GameStateAPI.IsFakePlayer( xuid ), k_IsFakePlayer );},
		XPDataJSO: function _XPDataJSO ( panel ) {return _APIAccessor( panel.XpDataJSO, k_XpDataJSO );},
		GetGameModeInternalName: function _GetGameModeInternalName ( bUseSkirmishName ) {return _APIAccessor( GameStateAPI.GetGameModeInternalName( bUseSkirmishName ), k_GetGameModeInternalName );},
		GetGameModeName: function _GetGameModeName ( bUseSkirmishName ) {return _APIAccessor( GameStateAPI.GetGameModeName( bUseSkirmishName ), k_GetGameModeName );},
		SkillgroupDataJSO: function _SkillgroupDataJSO ( panel ) {return _APIAccessor( panel.SkillgroupDataJSO, k_SkillgroupDataJSO );},
		DropListJSO: function _DropListJSO ( panel ) {return _APIAccessor( panel.DropListJSO, k_DropListJSO );},
		GetTimeDataJSO: function _GetTimeDataJSO () {return _APIAccessor( GameStateAPI.GetTimeDataJSO(), k_GetTimeDataJSO );},
		NextMatchVotingData: function _NextMatchVotingData ( panel ) {return _APIAccessor( panel.NextMatchVotingData, k_NextMatchVotingData );},
		GetPlayerStatsJSO: function _GetPlayerStatsJSO ( xuid ) {return _APIAccessor( MatchStatsAPI.GetPlayerStatsJSO( xuid ), k_GetPlayerStatsJSO, xuid );},
		GetPlayerDataJSO: function _GetPlayerDataJSO () {return _APIAccessor( GameStateAPI.GetPlayerDataJSO(), k_GetPlayerDataJSO );},
		IsTournamentMatch: function _IsTournamentMatch () {return _APIAccessor( MatchStatsAPI.IsTournamentMatch(), k_IsTournamentMatch );},
		GetServerName: function _GetServerName () {return _APIAccessor( GameStateAPI.GetServerName(), k_GetServerName );},
		GetMapName: function _GetMapName () {return _APIAccessor( GameStateAPI.GetMapName(), k_GetMapName );},
		GetTournamentEventStage: function _GetTournamentEventStage () {return _APIAccessor( GameStateAPI.GetTournamentEventStage(), k_GetTournamentEventStage );},
		GetGameModeImagePath: function _GetGameModeImagePath () {return _APIAccessor( GameStateAPI.GetGameModeImagePath(), k_GetGameModeImagePath );},
		GetMapBSPName: function _GetMapBSPName () {return _APIAccessor( GameStateAPI.GetMapBSPName(), k_GetMapBSPName );},
		GetPlayerTeamName: function _GetPlayerTeamName ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerTeamName( xuid ), k_GetPlayerTeamName, xuid );},
		GetPlayerTeamNumber: function _GetPlayerTeamNumber ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerTeamNumber( xuid ), k_GetPlayerTeamNumber, xuid );},
		GetTeamNextRoundLossBonus: function _GetTeamNextRoundLossBonus ( team ) {return _APIAccessor( GameStateAPI.GetTeamNextRoundLossBonus( team ), k_GetTeamNextRoundLossBonus );},
		AreTeamsPlayingSwitchedSides: function _AreTeamsPlayingSwitchedSides () {return _APIAccessor( GameStateAPI.AreTeamsPlayingSwitchedSides(), k_AreTeamsPlayingSwitchedSides );},
		AreTeamsPlayingSwitchedSidesInRound: function _AreTeamsPlayingSwitchedSidesInRound ( rnd ) {return _APIAccessor( GameStateAPI.AreTeamsPlayingSwitchedSidesInRound( rnd ), k_AreTeamsPlayingSwitchedSidesInRound );},
		HasHalfTime: function _HasHalfTime () {return _APIAccessor( GameStateAPI.HasHalfTime(), k_HasHalfTime );},
		IsDemoOrHltv: function _IsDemoOrHltv () {return _APIAccessor( GameStateAPI.IsDemoOrHltv(), k_IsDemoOrHltv );},
		IsHLTVAutodirectorOn: function _IsHLTVAutodirectorOn () {return _APIAccessor( GameStateAPI.IsHLTVAutodirectorOn(), k_IsHLTVAutodirectorOn );},
		GetTeamLogoImagePath: function _GetTeamLogoImagePath ( team ) {return _APIAccessor( GameStateAPI.GetTeamLogoImagePath( team ), k_GetTeamLogoImagePath );},
		GetTeamLivingPlayerCount: function _GetTeamLivingPlayerCount ( team ) {return _APIAccessor( GameStateAPI.GetTeamLivingPlayerCount( team ), k_GetTeamLivingPlayerCount );},
		GetTeamLogoImagePath: function _GetTeamLogoImagePath ( team ) {return _APIAccessor( GameStateAPI.GetTeamLogoImagePath( team ), k_GetTeamLogoImagePath );},
		GetTeamTotalPlayerCount: function _GetTeamTotalPlayerCount ( team ) {return _APIAccessor( GameStateAPI.GetTeamTotalPlayerCount( team ), k_GetTeamTotalPlayerCount );},
		GetTeamClanName: function _GetTeamClanName ( team ) {return _APIAccessor( GameStateAPI.GetTeamClanName( team ), k_GetTeamClanName, team );},
		IsXuidValid: function _IsXuidValid ( xuid ) {return _APIAccessor( GameStateAPI.IsXuidValid( xuid ), k_IsXuidValid );},
		GetPlayerIndex: function _GetPlayerIndex ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerIndex( xuid ), k_GetPlayerIndex, xuid );},
		GetLocalPlayerXuid: function _GetLocalPlayerXuid ( xuid ) {return _APIAccessor( GameStateAPI.GetLocalPlayerXuid( xuid ), k_GetLocalPlayerXuid );},
		IsLocalPlayerHLTV: function _IsLocalPlayerHLTV () {return _APIAccessor( GameStateAPI.IsLocalPlayerHLTV(), k_IsLocalPlayerHLTV );},
		GetPlayerStatus: function _GetPlayerStatus ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerStatus( xuid ), k_GetPlayerStatus );},
		GetPlayerCommendsLeader: function _GetPlayerCommendsLeader ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerCommendsLeader( xuid ), k_GetPlayerCommendsLeader );},
		GetPlayerCommendsFriendly: function _GetPlayerCommendsFriendly ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerCommendsFriendly( xuid ), k_GetPlayerCommendsFriendly );},
		GetPlayerCommendsTeacher: function _GetPlayerCommendsTeacher ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerCommendsTeacher( xuid ), k_GetPlayerCommendsTeacher );},
		GetPlayerCompetitiveRanking: function _GetPlayerCompetitiveRanking ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerCompetitiveRanking( xuid ), k_GetPlayerCompetitiveRanking );},
		GetPlayerXpLevel: function _GetPlayerXpLevel ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerXpLevel( xuid ), k_GetPlayerXpLevel, xuid );},
		GetTeamGungameLeaderXuid: function _GetTeamGungameLeaderXuid ( xuid ) {return _APIAccessor( GameStateAPI.GetTeamGungameLeaderXuid( xuid ), k_GetTeamGungameLeaderXuid );},
		GetPlayerScore: function _GetPlayerScore ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerScore( xuid ), k_GetPlayerScore, xuid );},
		GetPlayerMVPs: function _GetPlayerMVPs ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerMVPs( xuid ), k_GetPlayerMVPs, xuid );},
		GetPlayerKills: function _GetPlayerKills ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerKills( xuid ), k_GetPlayerKills, xuid );},
		GetPlayerAssists: function _GetPlayerAssists ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerAssists( xuid ), k_GetPlayerAssists, xuid );},
		GetPlayerDeaths: function _GetPlayerDeaths ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerDeaths( xuid ), k_GetPlayerDeaths, xuid );},
		GetPlayerPing: function _GetPlayerPing ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerPing( xuid ), k_GetPlayerPing, xuid );},
		GetMusicIDForPlayer: function _GetMusicIDForPlayer ( xuid ) {return _APIAccessor( GameStateAPI.GetMusicIDForPlayer( xuid ), k_GetMusicIDForPlayer, xuid );},
		GetPlayerColor: function _GetPlayerColor ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerColor( xuid ), k_GetPlayerColor, xuid );},
		HasCommunicationAbuseMute: function _HasCommunicationAbuseMute ( xuid ) {return _APIAccessor( GameStateAPI.HasCommunicationAbuseMute( xuid ), k_HasCommunicationAbuseMute );},
		IsSelectedPlayerMuted: function _IsSelectedPlayerMuted ( xuid ) {return _APIAccessor( GameStateAPI.IsSelectedPlayerMuted( xuid ), k_IsSelectedPlayerMuted );},
		IsPlayerConnected: function _IsPlayerConnected ( xuid ) {return _APIAccessor( GameStateAPI.IsPlayerConnected( xuid ), k_IsPlayerConnected );},
		ArePlayersEnemies: function _ArePlayersEnemies ( xuid1, xuid2 ) {return _APIAccessor( GameStateAPI.ArePlayersEnemies( xuid1, xuid2 ), k_ArePlayersEnemies );},
		GetPlayerClanTag: function _GetPlayerClanTag ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerClanTag( xuid ), k_GetPlayerClanTag );},
		GetPlayerMoney: function _GetPlayerMoney ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerMoney( xuid ), k_GetPlayerMoney );},
		GetPlayerActiveWeaponItemId: function _GetPlayerActiveWeaponItemId ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerActiveWeaponItemId( xuid ), k_GetPlayerActiveWeaponItemId, xuid );},
		GetPlayerModel: function _GetPlayerModel ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerModel( xuid ), k_GetPlayerModel, xuid );},
		GetPlayerGungameLevel: function _GetPlayerGungameLevel ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerGungameLevel( xuid ), k_GetPlayerGungameLevel, xuid );},
		GetPlayerItemCT: function _GetPlayerItemCT ( panel ) {return _APIAccessor( panel.GetPlayerItemCT(), k_GetPlayerItemCT );},
		GetPlayerItemTerrorist: function _GetPlayerItemTerrorist ( panel ) {return _APIAccessor( panel.GetPlayerItemTerrorist(), k_GetPlayerItemTerrorist );},
		AccoladesJSO: function _AccoladesJSO ( panel ) {return _APIAccessor( panel.AccoladesJSO, k_AccoladesJSO );},
		GetCharacterDefaultCheerByXuid: function _GetCharacterDefaultCheerByXuid ( xuid ) {return _APIAccessor( GameStateAPI.GetCharacterDefaultCheerByXuid( xuid ), k_GetCharacterDefaultCheerByXuid, xuid );},
		GetCooperativePlayerTeamName: function _GetCooperativePlayerTeamName () {return _APIAccessor( GameStateAPI.GetCooperativePlayerTeamName(), k_GetCooperativePlayerTeamName );},
		GetAllPlayersMatchDataJSO: function _GetAllPlayersMatchDataJSO () {return _APIAccessor( GameStateAPI.GetAllPlayersMatchDataJSO(), k_GetAllPlayersMatchDataJSO );},
		GetPlayerCharacterItemID: function _GetPlayerCharacterItemID ( xuid ) {return _APIAccessor( GameStateAPI.GetPlayerCharacterItemID( xuid ), k_GetPlayerCharacterItemID );},
		GetFauxItemIDFromDefAndPaintIndex: function _GetFauxItemIDFromDefAndPaintIndex ( defindex, paintid ) {return _APIAccessor( InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( defindex, paintid ), k_GetFauxItemIDFromDefAndPaintIndex );},

		SetMockData: _SetMockData,
		GetMockData: _GetMockData,
	};

} )();


                                                                                                    
                                           
                                                                                                    
( function()
{

} )();
