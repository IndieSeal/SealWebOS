import { pingpong } from "./mathf.js";

//omg regions exist in js, i'm blessed dude, i can re-use so many concepts from c# it's crazy haha

//#region Interactable Seal

const sealImageDisplay = document.getElementById("sealclicker-sealdisplay");
const imagesInFolder = 10;
var latestIndex = 0;

setNewRandomImage();
function setNewRandomImage(){
    let rand = Math.random() * imagesInFolder;
    let randomIndex = Math.ceil(rand);
    if(randomIndex == latestIndex) randomIndex = pingpong(1, imagesInFolder, randomIndex + 1);
    
    let image = `./imgs/SealClicker/Seal${randomIndex}.jpg`;
    sealImageDisplay.src = image;
    latestIndex = randomIndex;
    
    sealImageDisplay.classList.add("click");
    setTimeout(() => sealImageDisplay.classList.remove("click"), 100);
}

sealImageDisplay.addEventListener("click", onSealClicked)

//#endregion

// USEFUL: https://www.kongregate.com/en/pages/the-math-of-idle-games-part-i

function onSealClicked(){
    setNewRandomImage();
    sumPoints(1);
}

const scoreText = document.getElementById("sealclicker-score");
var points = 0;

const UPGRADE_BUY_SUFFIX = "_buy";
const UPGRADE_COST_SUFFIX = "_cost";
const UPGRADE_AMOUNT_SUFFIX = "_amount";

const MILLIS_PER_SECOND = 1000;
const UPDATES_PER_SECOND = 10;

class Upgrade{
    amount = 0;
    
    constructor(upgradeID, basePrice, priceMultiplier){
        this.upgradeID = upgradeID;

        this.buyElement = document.getElementById(upgradeID + UPGRADE_BUY_SUFFIX);
        this.costElement = document.getElementById(upgradeID + UPGRADE_COST_SUFFIX);
        this.amountElement = document.getElementById(upgradeID + UPGRADE_AMOUNT_SUFFIX);

        this.basePrice = basePrice;
        this.priceMultiplier = priceMultiplier;
    }

    setup = () =>{
        this.buyElement.addEventListener("click", this.onBuyElementClicked);
        this.updateUI();
    }

    onBuyElementClicked = () =>{
        this.buyUpgrade();
        this.updateUI();
    }

    updateUI(){
        this.costElement.innerHTML = `Price: ${this.getPrice()}`;
        this.amountElement.innerHTML = `Level: ${this.amount}`;
    }

    getPrice = function(){
        let nextCost = this.basePrice * (this.priceMultiplier ** this.amount);
        return Math.floor(nextCost);
    }
    
    canBuy = function(){
        return points >= this.getPrice();
    }

    buyUpgrade = function(){
        if(!this.canBuy()) return;

        sumPoints(-this.getPrice());
        this.amount++;
    }
}

const UPGRADE_PRODUCTION_PERLEVEL_SUFFIX = "_production-per";
const UPGRADE_PRODUCTION_SUFFIX = "_production";

class AutoclickerUpgrade extends Upgrade{
    multipliers = 1;
    
    constructor(upgradeID, basePrice, priceMultiplier, pointsPerSecond){
        super(upgradeID, basePrice, priceMultiplier);

        this.pointsPerSecond = pointsPerSecond;

        this.productionPerElement = document.getElementById(upgradeID + UPGRADE_PRODUCTION_PERLEVEL_SUFFIX);
        this.productionElement = document.getElementById(upgradeID + UPGRADE_PRODUCTION_SUFFIX);

        setTimeout(() => this.loop(), MILLIS_PER_SECOND);
    }

    updateUI(){
        super.updateUI();

        this.productionPerElement.innerHTML = `Production per level: ${this.pointsPerSecond.toFixed(2)}`;
        this.productionElement.innerHTML = `Current production: ${this.getProduction().toFixed(2)}`;
    }

    getProduction = function(){
        let production = (this.pointsPerSecond * this.amount) * this.multipliers;
        return production;
    }

    loop = function(){
        setTimeout(() => this.loop(), MILLIS_PER_SECOND/UPDATES_PER_SECOND);

        this.onSecondPassed();
    }
    
    onSecondPassed(){
        sumPoints(this.getProduction()/UPDATES_PER_SECOND);
    }
}

class MultiplierUpgrade extends Upgrade{
    multipliers = 1;
    
    constructor(upgradeID, basePrice, priceMultiplier, conditionFunction){
        super(upgradeID, basePrice, priceMultiplier);

        this.conditionFunction = conditionFunction;

        setTimeout(() => this.loop(), MILLIS_PER_SECOND);
    }

    loop = function(){
        setTimeout(() => this.loop(), MILLIS_PER_SECOND/UPDATES_PER_SECOND);

        this.onSecondPassed();
    }
    
    onSecondPassed(){
        if(!this.conditionFunction()) return;

        console.log("Condition has been completed");
    }
}

function sumPoints(newPoints){
    points += newPoints;
    scoreText.innerHTML = `Points: ${Math.floor(points)}`;
}

var autoclickUpgrade = new AutoclickerUpgrade("autoclicker", 10, 1.2, 0.3);
autoclickUpgrade.setup();

