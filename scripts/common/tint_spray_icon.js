                                                             
'use strict';

var TintSprayIcon = ( function ()
{
	var _Tint = function( itemId, elImage )
	{
		if ( InventoryAPI.DoesItemMatchDefinitionByName( itemId, 'spraypaint' ) || InventoryAPI.DoesItemMatchDefinitionByName( itemId, 'spray' ) )
		{
			var colorTint = InventoryAPI.GetSprayTintColorCode( itemId );
			
			if ( colorTint )
			{
				elImage.style.washColor = colorTint;
				                                   
			}
			else
			{
				elImage.style.washColor = 'none';
			}
		}
		else
		{
			elImage.style.washColor = 'none';
		}
	};

	                                                                                 
	   
	                                              
	    
	   	                                                                                                                        
	   	                                                                                       
	   		                                                                       
	   
	   	                                                                                                                                          
	   	 
	   		                                                                                           
	   	 
	     

	return{
		CheckIsSprayAndTint : _Tint                                   
		                            
	};
})();