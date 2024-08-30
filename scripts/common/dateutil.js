'use strict';


    	              										    				  
    	    												    				        
    	         											    				        
    	             										     				             
    	            										      				  
    	             										      				 
    	           											      				   
    	            										      				  
    	                    								      				 
    	                									    				            
    	                                                	      				 
    	            										    				  
    	                  									      				 
    	                  									      				  
    	                    								      				 
    	                    								      				  
    	              										      				  
    	                									      				  
    	           											      				   
    	         											                 	                                     
    	         											                 	     
    	         											                  	                  

var DateUtil = ( function()
{

	function _PopulateDateFormatStrings ( panel, date )
	{

		        
		var monthPaddedNumber = ( '0' + ( date.getMonth() + 1 ) ).slice( -2 );

		               
		panel.SetDialogVariable( 'M', date.getMonth() + 1 );

		                           
		panel.SetDialogVariable( 'MM', monthPaddedNumber );

		              
		panel.SetDialogVariable( 'MMM', $.Localize( 'MonthName' + monthPaddedNumber + '_Short' ) );

		             
		panel.SetDialogVariable( 'MMMM', $.Localize( 'MonthName' + monthPaddedNumber + '_Long' ) );


		      
		  
		                      
		panel.SetDialogVariable( 'd', $.Localize( date.getDate() ) );

		              
		var dayPaddedNumber = ( '0' + ( date.getDate() ) ).slice( -2 );
		panel.SetDialogVariable( 'dd', $.Localize( dayPaddedNumber ) );

		                     
		panel.SetDialogVariable( 'ddd', $.Localize( 'LOC_Date_DayShort' + date.getDay() ));

		                       
		panel.SetDialogVariable( 'dddd', $.Localize( 'LOC_Date_Day' + date.getDay() ));
	}


	


	return {
		PopulateDateFormatStrings:	_PopulateDateFormatStrings
		
	}


})();

(function()
{
})();

