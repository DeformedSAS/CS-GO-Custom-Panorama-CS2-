"use strict";

function OnReload()
{
                                       
}

function TestJS()
{
                       
    var parent = $.GetContextPanel().GetParent();

                             

                            
                           

                        
                       

                                                                 
                                                                           

                                                      
                                                                                                                
                                                                                           
                                                 

                                                                                
                                               
                                                                                                         
                                             
                                                                            

                                         
                                                  

                                                                          
                                                                    

                                       
                                                                  

                                                                                                            
                                                 

                                                
                                                                  
                                   
                                   
                                                                                    
                                                           
                                                                      
                 
                                                                                                                                                     
                                                                                                                                               
                                                                                                                                                                
                                                                                                                                        
                                                                                                                      
                                                                                
                                                                                                                     

                                                                       
                                                                                                       
                                    
                                                                         

                                                                                                                          
                                                                                        
                                                                    

                                                      
                                                                                                                           

                                                                                    
                                                                               

                                                                                                 
                                                     
                                     

                                                 
                                                                                                                        
                                                                                 
                                                                                                                                
                                                                        

                                                                               
                                                                               
                                   
                                                                                                       
                                                                                                                                                                                                                         
                                                                        

                                                                                  
                                                                                    
                                                         

                                           
                                                   
                                                                                                                
                                                                                                  
                                                                                            

              
    parent.ResetAnimation( false );

                                         
                                                     
                                          
                                                             
                                                                         
    parent.EquipPlayerFromLoadout( 'ct', 'rifle3' );

    parent.ResetActivityModifiers();
    parent.PlayActivity( 'ACT_CSGO_UIPLAYER_WALKUP', true );
}

function TestJSTwitch()
{
                             
    var parent = $.GetContextPanel().GetParent();

    parent.ResetAnimation( false );
    parent.ResetActivityModifiers();
    parent.PlayActivity( 'ACT_CSGO_UIPLAYER_WALKUP', true );
}

function ParticleTest()
{
                             
    var parent = $.GetContextPanel().GetParent();
    
    parent.SetParticleSystemOffsetPosition( 0.0, 0.0, 0.0 );

    parent.AddParticleSystem( 'weapon_confetti_omni', 'weapon_hand_R', true );

                                                                 
                                                                

                                                                       
                                                                         

                                                           
 }
 