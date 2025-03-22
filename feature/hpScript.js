const MAX_HEALTH = 7;
let current_health = MAX_HEALTH;

function loseHealth(){
    if(current_health > 0){
        current_health -= 1;
        changeState();
    }
}

function gainHealth(){
    if(current_health < MAX_HEALTH){
        current_health += 1;
        changeState();
    }
}

function changeState(){
    if(current_health < 3){/**change moneygatchi picture to low health sprite */}
    else if(current_health < 6){/**swap to medium health sprite */}
    else{/**set to high health sprite */}
}