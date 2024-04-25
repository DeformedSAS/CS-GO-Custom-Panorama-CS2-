"use-strict";

var TeamColor = (function(){

	var _GetColorString = function ( color )
	{
		var list = color.split(' ');
		return list.join(',');
	}
	
	var colorRGB = {
		default: '100,100,100',
		yellow: _GetColorString( GameInterfaceAPI.GetSettingString( "cl_teammate_color_1" )),
		purple: _GetColorString( GameInterfaceAPI.GetSettingString( "cl_teammate_color_2" )),
		green: _GetColorString( GameInterfaceAPI.GetSettingString( "cl_teammate_color_3" )),
		blue: _GetColorString( GameInterfaceAPI.GetSettingString( "cl_teammate_color_4" )),
		orange: _GetColorString( GameInterfaceAPI.GetSettingString( "cl_teammate_color_5" ))
	}
	
	var _GetTeamColor = function ( teamColorInx )
	{
		if ( teamColorInx < -1 )
			return colorRGB['yellow'];
		else if ( teamColorInx == -1 )
			return colorRGB['default'];
		else if ( teamColorInx == 0 )
			return colorRGB['yellow'];
		else if ( teamColorInx == 1 )
			return colorRGB['purple'];
		else if ( teamColorInx == 2 )
			return colorRGB['green'];
		else if ( teamColorInx == 3 )
			return colorRGB['blue'];
		else if ( teamColorInx == 4 )
			return colorRGB['orange'];

		return colorRGB['default'];
	}

	var _GetTeamColorLetter = function ( teamColorInx )
	{
		if ( teamColorInx == -1 )
			return "";
		else if ( teamColorInx == 0 )
			return "Y";
		else if ( teamColorInx == 1 )
			return "P";
		else if ( teamColorInx == 2 )
			return "G";
		else if ( teamColorInx == 3 )
			return "B";
		else if ( teamColorInx == 4 )
			return "O";
		else if ( teamColorInx == 10 )
			return "<img src='target_skull.png' height='8'/>";

		return "";

		  
		                                                                                                          
		                             
		 
			                  
				          
			                      
				             
			                      
				             
			                      
				             
			                      
				             
			                      
				             
		 
		    
		 
			                  
				          
			                      
				             
			                      
				             
			                      
				             
			                      
				             
			                      
				             
		 
		  
	}

	return {
		GetTeamColor        : _GetTeamColor,                      
		GetTeamColorLetter  : _GetTeamColorLetter                     
	}
})()