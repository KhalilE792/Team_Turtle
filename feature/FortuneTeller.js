let savingGoal;
let weeklySavings = 100;
const result = document.getElementById("result");

function getYears(){
    savingGoal = prompt("How much do you want to save by retirement?");
    if(!isNaN(savingGoal) && savingGoal > 0){
        result.innerText = "You can retire in " + calculateTime(parseInt(savingGoal)) + " years.";
    }
}

function calculateTime(savingGoal){
    return Math.floor((savingGoal/weeklySavings)/52);
}


