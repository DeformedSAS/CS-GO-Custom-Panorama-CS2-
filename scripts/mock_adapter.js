'use strict';

var MockAdapter = (function () {
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

    function _SetMockData(dummydata) {
        _m_mockData = dummydata;
    }

    function _GetMockData() {
        return _m_mockData;
    }

    function FindMockTable(key) {
        var arrTablesInUse = _m_mockData.split(',');

        for (let group of arrTablesInUse) {
            if (MOCK_TABLE.hasOwnProperty(group) && MOCK_TABLE[group].hasOwnProperty(key)) {
                return MOCK_TABLE[group];
            }
        }

        if (MOCK_TABLE['defaults'].hasOwnProperty(key)) {
            return MOCK_TABLE['defaults'];
        } else
            return undefined;
    }

    function _APIAccessor(val, key, xuid = -1) {
        if (!_m_mockData) {
            return val;
        }

        return GetProperty(key, xuid);
    }

    function GetProperty(key, xuid) {
        var table = FindMockTable(key);

        if (!table)
            return 0;

        var val = undefined;

        if (xuid !== -1 && table[key].hasOwnProperty(xuid)) {
            val = table[key][xuid];
        } else {
            val = table[key];
        }

        if (val && typeof val === "function") {
            return val(xuid);
        } else {
            return val;
        }
    }

    var _getLoadoutWeapons = function (team) {
        var list = [];

        var slotStrings = LoadoutAPI.GetLoadoutSlotNames(false);
        var slots = JSON.parse(slotStrings);

        slots.forEach(slot => {
            var itemId = LoadoutAPI.GetItemID(team, slot);
            var bIsWeapon = ItemInfo.IsWeapon(itemId);

            if (bIsWeapon) {
                list.push(itemId);
            }
        });

        return list;
    }

    function _GetRandomWeaponFromLoadout() {
        var team = (_m_mockData.search('team_ct') !== -1) ? 'ct' : 't';
        var list = _getLoadoutWeapons(team);
        return list[_r(0, list.length)];
    }

    function _GetRandomPlayerStatsJSO(xuid) {
        var oPlayerStats = {
            "damage": 0,
            "kills": 0,
            "assists": 0,
            "deaths": 0,
            "adr": 0,
            "kdr": 0,
            "3k": 0,
            "4k": 0,
            "5k": 0,
            "headshotkills": 0,
            "hsp": 0,
            "worth": 0,
            "killreward": 0,
            "cashearned": 99,
            "livetime": 0,
            "objective": 0,
            "utilitydamage": 0,
            "enemiesflashed": 0
        };

        Object.keys(oPlayerStats).forEach(stat => {
            oPlayerStats[stat] = _r();
        });

        return oPlayerStats;
    }

    function _r(min = 0, max = 100) {
        return Math.floor(Math.random() * ((max - min) + min) + 0.5);
    }

    function _GetRandomXP() {
        var ret = {
            "xp_earned": {
                "2": _r(0, 1000),
                "6": _r(0, 1000),
            },
            "current_level": _r(0, 39),
            "current_xp": _r(0, 4999),
        };

        return ret;
    }

    function _GetRandomSkillGroup() {
        var oldrank = _r(1, 18);
        var newrank = oldrank + _r(-1, 1);

        var ret = {
            "old_rank": oldrank,
            "new_rank": newrank,
            "num_wins": _r(10, 1000)
        };

        return ret;
    }

    function _GetRandomPlayerModel(team) {
        var PlayerModels = {
            "ct": [
                "models/player/custom_player/legacy/ctm_fbi.mdl",
                "models/player/custom_player/legacy/ctm_st6.mdl",
                "models/player/custom_player/legacy/ctm_gign.mdl",
                "models/player/custom_player/legacy/ctm_sas.mdl",
                "models/player/custom_player/legacy/ctm_idf.mdl",
                "models/player/custom_player/legacy/ctm_swat.mdl",
                "models/player/custom_player/legacy/ctm_st6_variantg.mdl",
                "models/player/custom_player/legacy/ctm_fbi_variantb.mdl",
                "models/player/custom_player/legacy/ctm_st6_variante.mdl",
                "models/player/custom_player/legacy/ctm_swat_variantj.mdl",
                "models/player/custom_player/legacy/ctm_swat_variantk.mdl",
                "models/player/custom_player/legacy/ctm_swat_variante.mdl",
                "models/player/custom_player/legacy/ctm_fbi_variantf.mdl",
                "models/player/custom_player/legacy/ctm_st6_variantj.mdl",
            ],
            "t": [
                "models/player/custom_player/legacy/tm_leet.mdl",
                "models/player/custom_player/legacy/tm_phoenix.mdl",
                "models/player/custom_player/legacy/tm_balkan_variantj.mdl",
                "models/player/custom_player/legacy/tm_balkan_varianth.mdl",
                "models/player/custom_player/legacy/tm_balkan_variantg.mdl",
                "models/player/custom_player/legacy/tm_balkan_variantf.mdl",
                "models/player/custom_player/legacy/tm_balkan_variante.mdl",
                "models/player/custom_player/legacy/tm_balkan_variantk.mdl",
                "models/player/custom_player/legacy/tm_balkan_variantl.mdl",
                "models/player/custom_player/legacy/tm_balkan_variantm.mdl",
                "models/player/custom_player/legacy/tm_jumpsuit_variantb.mdl",
                "models/player/custom_player/legacy/tm_jumpsuit_variantc.mdl",
            ],
        };

        if (PlayerModels[team].length > 0)
            return PlayerModels[team][_r(0, PlayerModels[team].length)];
        return PlayerModels[team][0];
    }

    var MOCK_TABLE = {
        defaults: {
            [k_GetPlayerName]: "Player",
            [k_XpDataJSO]: _GetRandomXP,
            [k_GetPlayerStatsJSO]: _GetRandomPlayerStatsJSO,
            [k_SkillgroupDataJSO]: _GetRandomSkillGroup,
            [k_GetPlayerModel]: _GetRandomPlayerModel
        },
        mock_group1: {
            [k_GetPlayerName]: "Mock Player",
            [k_XpDataJSO]: _GetRandomXP,
            [k_GetPlayerStatsJSO]: _GetRandomPlayerStatsJSO,
            [k_SkillgroupDataJSO]: _GetRandomSkillGroup,
            [k_GetPlayerModel]: _GetRandomPlayerModel
        },
        // Additional mock groups can be defined here...
    };

    // Public API
    return {
        SetMockData: function (dummydata) {
            _SetMockData(dummydata);
        },
        GetMockData: function () {
            return _GetMockData();
        },
        GetMatchEndWinDataJSO: function () {
            return _APIAccessor(GameStateAPI.GetMatchEndWinDataJSO(), k_GetMatchEndWinDataJSO);
        },
        GetScoreDataJSO: function () {
            return _APIAccessor(GameStateAPI.GetScoreDataJSO(), k_GetScoreDataJSO);
        },
        GetPlayerName: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerName(xuid), k_GetPlayerName, xuid);
        },
        IsFakePlayer: function (xuid) {
            return _APIAccessor(GameStateAPI.IsFakePlayer(xuid), k_IsFakePlayer, xuid);
        },
        GetXPDataJSO: function (xuid) {
            return _APIAccessor(GameStateAPI.GetXpDataJSO(xuid), k_XpDataJSO, xuid);
        },
        GetGameModeInternalName: function () {
            return _APIAccessor(GameStateAPI.GetGameModeInternalName(), k_GetGameModeInternalName);
        },
        GetGameModeName: function () {
            return _APIAccessor(GameStateAPI.GetGameModeName(), k_GetGameModeName);
        },
        GetSkillgroupDataJSO: function (xuid) {
            return _APIAccessor(GameStateAPI.GetSkillgroupDataJSO(xuid), k_SkillgroupDataJSO, xuid);
        },
        GetDropListJSO: function () {
            return _APIAccessor(GameStateAPI.GetDropListJSO(), k_DropListJSO);
        },
        GetTimeDataJSO: function () {
            return _APIAccessor(GameStateAPI.GetTimeDataJSO(), k_GetTimeDataJSO);
        },
        GetNextMatchVotingData: function () {
            return _APIAccessor(GameStateAPI.GetNextMatchVotingData(), k_NextMatchVotingData);
        },
        GetPlayerStatsJSO: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerStatsJSO(xuid), k_GetPlayerStatsJSO, xuid);
        },
        GetPlayerDataJSO: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerDataJSO(xuid), k_GetPlayerDataJSO, xuid);
        },
        IsTournamentMatch: function () {
            return _APIAccessor(GameStateAPI.IsTournamentMatch(), k_IsTournamentMatch);
        },
        GetServerName: function () {
            return _APIAccessor(GameStateAPI.GetServerName(), k_GetServerName);
        },
        GetMapName: function () {
            return _APIAccessor(GameStateAPI.GetMapName(), k_GetMapName);
        },
        GetTournamentEventStage: function () {
            return _APIAccessor(GameStateAPI.GetTournamentEventStage(), k_GetTournamentEventStage);
        },
        GetGameModeImagePath: function () {
            return _APIAccessor(GameStateAPI.GetGameModeImagePath(), k_GetGameModeImagePath);
        },
        GetMapBSPName: function () {
            return _APIAccessor(GameStateAPI.GetMapBSPName(), k_GetMapBSPName);
        },
        GetPlayerTeamName: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerTeamName(xuid), k_GetPlayerTeamName, xuid);
        },
        GetPlayerTeamNumber: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerTeamNumber(xuid), k_GetPlayerTeamNumber, xuid);
        },
        GetTeamNextRoundLossBonus: function (teamIndex) {
            return _APIAccessor(GameStateAPI.GetTeamNextRoundLossBonus(teamIndex), k_GetTeamNextRoundLossBonus, teamIndex);
        },
        AreTeamsPlayingSwitchedSides: function () {
            return _APIAccessor(GameStateAPI.AreTeamsPlayingSwitchedSides(), k_AreTeamsPlayingSwitchedSides);
        },
        AreTeamsPlayingSwitchedSidesInRound: function () {
            return _APIAccessor(GameStateAPI.AreTeamsPlayingSwitchedSidesInRound(), k_AreTeamsPlayingSwitchedSidesInRound);
        },
        HasHalfTime: function () {
            return _APIAccessor(GameStateAPI.HasHalfTime(), k_HasHalfTime);
        },
        IsDemoOrHltv: function () {
            return _APIAccessor(GameStateAPI.IsDemoOrHltv(), k_IsDemoOrHltv);
        },
        IsHLTVAutodirectorOn: function () {
            return _APIAccessor(GameStateAPI.IsHLTVAutodirectorOn(), k_IsHLTVAutodirectorOn);
        },
        GetTeamLogoImagePath: function (teamIndex) {
            return _APIAccessor(GameStateAPI.GetTeamLogoImagePath(teamIndex), k_GetTeamLogoImagePath, teamIndex);
        },
        GetTeamLivingPlayerCount: function (teamIndex) {
            return _APIAccessor(GameStateAPI.GetTeamLivingPlayerCount(teamIndex), k_GetTeamLivingPlayerCount, teamIndex);
        },
        GetTeamTotalPlayerCount: function (teamIndex) {
            return _APIAccessor(GameStateAPI.GetTeamTotalPlayerCount(teamIndex), k_GetTeamTotalPlayerCount, teamIndex);
        },
        GetTeamClanName: function (teamIndex) {
            return _APIAccessor(GameStateAPI.GetTeamClanName(teamIndex), k_GetTeamClanName, teamIndex);
        },
        IsXuidValid: function (xuid) {
            return _APIAccessor(GameStateAPI.IsXuidValid(xuid), k_IsXuidValid, xuid);
        },
        GetPlayerIndex: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerIndex(xuid), k_GetPlayerIndex, xuid);
        },
        GetLocalPlayerXuid: function () {
            return _APIAccessor(GameStateAPI.GetLocalPlayerXuid(), k_GetLocalPlayerXuid);
        },
        IsLocalPlayerHLTV: function () {
            return _APIAccessor(GameStateAPI.IsLocalPlayerHLTV(), k_IsLocalPlayerHLTV);
        },
        GetPlayerStatus: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerStatus(xuid), k_GetPlayerStatus, xuid);
        },
        GetPlayerCommendsLeader: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerCommendsLeader(xuid), k_GetPlayerCommendsLeader, xuid);
        },
        GetPlayerCommendsFriendly: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerCommendsFriendly(xuid), k_GetPlayerCommendsFriendly, xuid);
        },
        GetPlayerCommendsTeacher: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerCommendsTeacher(xuid), k_GetPlayerCommendsTeacher, xuid);
        },
        GetPlayerCompetitiveRanking: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerCompetitiveRanking(xuid), k_GetPlayerCompetitiveRanking, xuid);
        },
        GetPlayerXpLevel: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerXpLevel(xuid), k_GetPlayerXpLevel, xuid);
        },
        GetTeamGungameLeaderXuid: function (teamIndex) {
            return _APIAccessor(GameStateAPI.GetTeamGungameLeaderXuid(teamIndex), k_GetTeamGungameLeaderXuid, teamIndex);
        },
        GetPlayerScore: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerScore(xuid), k_GetPlayerScore, xuid);
        },
        GetPlayerMVPs: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerMVPs(xuid), k_GetPlayerMVPs, xuid);
        },
        GetPlayerKills: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerKills(xuid), k_GetPlayerKills, xuid);
        },
        GetPlayerAssists: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerAssists(xuid), k_GetPlayerAssists, xuid);
        },
        GetPlayerDeaths: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerDeaths(xuid), k_GetPlayerDeaths, xuid);
        },
        GetPlayerPing: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerPing(xuid), k_GetPlayerPing, xuid);
        },
        GetPlayerColor: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerColor(xuid), k_GetPlayerColor, xuid);
        },
        HasCommunicationAbuseMute: function (xuid) {
            return _APIAccessor(GameStateAPI.HasCommunicationAbuseMute(xuid), k_HasCommunicationAbuseMute, xuid);
        },
        IsSelectedPlayerMuted: function (xuid) {
            return _APIAccessor(GameStateAPI.IsSelectedPlayerMuted(xuid), k_IsSelectedPlayerMuted, xuid);
        },
        IsPlayerConnected: function (xuid) {
            return _APIAccessor(GameStateAPI.IsPlayerConnected(xuid), k_IsPlayerConnected, xuid);
        },
        ArePlayersEnemies: function (xuid1, xuid2) {
            return _APIAccessor(GameStateAPI.ArePlayersEnemies(xuid1, xuid2), k_ArePlayersEnemies, xuid1);
        },
        GetPlayerClanTag: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerClanTag(xuid), k_GetPlayerClanTag, xuid);
        },
        GetPlayerMoney: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerMoney(xuid), k_GetPlayerMoney, xuid);
        },
        GetPlayerActiveWeaponItemId: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerActiveWeaponItemId(xuid), k_GetPlayerActiveWeaponItemId, xuid);
        },
        GetPlayerGungameLevel: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerGungameLevel(xuid), k_GetPlayerGungameLevel, xuid);
        },
        GetPlayerItemCT: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerItemCT(xuid), k_GetPlayerItemCT, xuid);
        },
        GetPlayerItemTerrorist: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerItemTerrorist(xuid), k_GetPlayerItemTerrorist, xuid);
        },
        GetAccoladesJSO: function () {
            return _APIAccessor(GameStateAPI.GetAccoladesJSO(), k_AccoladesJSO);
        },
        GetCharacterDefaultCheerByXuid: function (xuid) {
            return _APIAccessor(GameStateAPI.GetCharacterDefaultCheerByXuid(xuid), k_GetCharacterDefaultCheerByXuid, xuid);
        },
        GetCooperativePlayerTeamName: function (xuid) {
            return _APIAccessor(GameStateAPI.GetCooperativePlayerTeamName(xuid), k_GetCooperativePlayerTeamName, xuid);
        },
        GetAllPlayersMatchDataJSO: function () {
            return _APIAccessor(GameStateAPI.GetAllPlayersMatchDataJSO(), k_GetAllPlayersMatchDataJSO);
        },
        GetPlayerCharacterItemID: function (xuid) {
            return _APIAccessor(GameStateAPI.GetPlayerCharacterItemID(xuid), k_GetPlayerCharacterItemID, xuid);
        },
        GetFauxItemIDFromDefAndPaintIndex: function (defIndex, paintIndex) {
            return _APIAccessor(GameStateAPI.GetFauxItemIDFromDefAndPaintIndex(defIndex, paintIndex), k_GetFauxItemIDFromDefAndPaintIndex, defIndex);
        }
    };
})();
