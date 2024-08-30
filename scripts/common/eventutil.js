                                                             

"use strict";

var EventUtil = ( function ()
{
	var _eventIdSet = new Set();

	                                                                                                                                
	   
	                                                                                                                                   
	                                                                                                                                    
	                       
	   
	                                                                                                                                   
	  
	var _officialEventIds = [

		                              
		5277,
		5278,
		5279,
		5281,
		5282,

		                    
		5356,             
		5339,         
		5338,         
		5376,                     

		                       
		5500,                               
		5506,                              
		5465,                     
		5464,                   

		                  
		5937,                       
		5967,                 

		                 
		4866,
		6207,
	];
	_officialEventIds.forEach( item => _eventIdSet.add( item.toString() ) );

	var _AnnotateOfficialEvents = function( jsonEvents )
	{
		for ( let event of jsonEvents )
		{
			if ( _eventIdSet.has( event.event_id ) )
			{
				event.is_official = true;
			}
		}

		return jsonEvents;
	}

	var _GetTournamentWinner = function( tournamentId, numTeams )
	{
		let ProEventJSO = TournamentsAPI.GetProEventDataJSO( tournamentId, numTeams );
		let oWinningTeam;

		if ( ProEventJSO
			&& ProEventJSO.hasOwnProperty( 'eventdata' )
			&& ProEventJSO[ 'eventdata' ].hasOwnProperty( tournamentId ) )
		{
			oWinningTeam = ProEventJSO[ 'eventdata' ][ tournamentId ][ 0 ];
		}

		return oWinningTeam;
	};

	return{
		AnnotateOfficialEvents: _AnnotateOfficialEvents,
		GetTournamentWinner: _GetTournamentWinner
	};
} )();


