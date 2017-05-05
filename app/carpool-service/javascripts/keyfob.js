const rpio = require('rpio');                                                     
const sleep = require('sleep'); 

const S0_GPIO = 38                                                              
const S1_GPIO = 40

rpio.open(S0_GPIO, rpio.OUTPUT, rpio.LOW);
rpio.open(S1_GPIO, rpio.OUTPUT, rpio.LOW);

/**                                                                             
 * Press the SW4 button to lock the car.                                        
 * S1=L, S0=H to select Y1 (SW4).                                               
 */                                                                             
exports.lock = function() {                                                               
    rpio.write(S1_GPIO, rpio.LOW);                                              
    rpio.write(S0_GPIO, rpio.HIGH);                                             
    releaseButton();                                                            
}                                                                               
                                                                                
/**                                                                             
 * Press the SW4 button to lock the car.                                        
 * S1=H, S0=L to select Y2 (SW3).                                               
 */                                                                             
exports.unlock = function() {                                                             
    rpio.write(S1_GPIO, rpio.HIGH);                                             
    rpio.write(S0_GPIO, rpio.LOW);                                              
    releaseButton();                                                            
}                                                                               
                                                                                
/**                                                                             
 * Drive S1, S0 to LOW to unselect all.                                            
 */                                                                             
function releaseButton() {                                                      
    sleep.msleep(100);                                                          
    rpio.write(S1_GPIO, rpio.LOW);                                              
    rpio.write(S0_GPIO, rpio.LOW);                                              
}        
