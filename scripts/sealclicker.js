import { pingpong } from "./mathf.js";

//omg regions exist in js, i'm blessed dude, i can re-use so many concepts from c# it's crazy haha

//#region Interactable Seal

const tooltipElement = document.getElementById("sealclicker-tooltip");

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
var baseClickPoints = 1;

function onSealClicked(){
    setNewRandomImage();
    sumPoints(baseClickPoints);
}

const scoreText = document.getElementById("sealclicker-score");
var points = 0;

const UPGRADE_BUY_SUFFIX = "_buy";
const UPGRADE_COST_SUFFIX = "_cost";
const UPGRADE_AMOUNT_SUFFIX = "_amount";

const MILLIS_PER_SECOND = 1000;
const UPDATES_PER_SECOND = 10;

var allAutoclickers = [];
var allGeneralUpgrades = [];

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
        if(this.costElement != undefined) this.costElement.innerHTML = `${this.getPrice()}`;
        if(this.costElement != undefined) this.amountElement.innerHTML = `${this.amount}`;
    }

    getPrice = function(){
        let nextCost = this.basePrice * (this.priceMultiplier ** this.amount);
        return Math.floor(nextCost);
    }
    
    canBuy = function(){
        return points >= this.getPrice();
    }

    buyUpgrade(){
        if(!this.canBuy()) return false;

        sumPoints(-this.getPrice());
        this.amount++;

        onUpgradeBought();

        return false;
    }
}

class AutoclickerUpgrade extends Upgrade{
    multipliers = 1;
    
    constructor(upgradeID, basePrice, priceMultiplier, pointsPerSecond){
        super(upgradeID, basePrice, priceMultiplier);

        this.pointsPerSecond = pointsPerSecond;

        //this.productionPerElement = document.getElementById(upgradeID + UPGRADE_PRODUCTION_PERLEVEL_SUFFIX);
        //this.productionElement = document.getElementById(upgradeID + UPGRADE_PRODUCTION_SUFFIX);

        allAutoclickers.push(this);

        setTimeout(() => this.loop(), MILLIS_PER_SECOND);
    }

    updateUI(){
        super.updateUI();

        //this.productionPerElement.innerHTML = `Production per level: ${this.pointsPerSecond.toFixed(2)}`;
        //this.productionElement.innerHTML = `Current production: ${this.getProduction().toFixed(2)}`;
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
    
    constructor(upgradeID, basePrice, conditionFunction){
        super(upgradeID, basePrice, 1);

        allGeneralUpgrades.push(this);
        
        this.conditionFunction = conditionFunction;
    }

    buyUpgrade(){
        if(!this.canBuy()) return false;

        this.buyElement.style.display = "none";
        this.conditionFunction();

        super.buyUpgrade();
        return true;
    }
}

function sumPoints(newPoints){
    points += newPoints;
    scoreText.innerHTML = `Points: ${Math.floor(points)}`;
}

function onUpgradeBought()
{
    let score = 0;
    allAutoclickers.forEach(element => {
        score += element.getProduction();
    });

    totalScorePerSecond.innerHTML = `per second: ${score.toFixed(1)}`;
}

const totalScorePerSecond = document.getElementById("sealclicker-score_persecond");

var autoclickUpgrade = new AutoclickerUpgrade("autoclicker", 10, 1.2, 0.3);
autoclickUpgrade.setup();

var autoclickUpgrade2 = new AutoclickerUpgrade("autoclicker2", 100, 1.2, 3);
autoclickUpgrade2.setup();

var generalUpgrade = new MultiplierUpgrade("general", 100, () => {
    baseClickPoints *= 2;
    autoclickUpgrade.multipliers *= 2;
});
generalUpgrade.setup();

var generalUpgrade2 = new MultiplierUpgrade("general2", 1000, () => {
    autoclickUpgrade2.multipliers *= 2;
});
generalUpgrade2.setup();

allAutoclickers.forEach(autoclicker => {
        autoclicker.buyElement.addEventListener('mouseleave', () => {
        tooltipElement.style.display = "none";
    });
    autoclicker.buyElement.addEventListener('mouseenter', () => {
        tooltipElement.style.display = "flex";

        let tooltipRect = tooltipElement.getBoundingClientRect();
        let rect = autoclicker.buyElement.getBoundingClientRect();
                
        tooltipElement.style.left = `${rect.left + window.scrollX - tooltipRect.width}px`;
        tooltipElement.style.top = `${rect.bottom + window.scrollY - (tooltipRect.height / 2) - (rect.height / 2)}px`;        
    });
});

allGeneralUpgrades.forEach(upgrade => {
    upgrade.buyElement.addEventListener('mouseleave', () => {
        tooltipElement.style.display = "none";
    });
    upgrade.buyElement.addEventListener('mouseenter', () => {
        tooltipElement.style.display = "flex";

        let tooltipRect = tooltipElement.getBoundingClientRect();
        let rect = document.getElementsByClassName("general_upgrades")[0].getBoundingClientRect();
                
        tooltipElement.style.left = `${rect.left + window.scrollX - tooltipRect.width}px`;
        tooltipElement.style.top = `${rect.bottom + window.scrollY - (tooltipRect.height / 2) - (rect.height / 2)}px`;        
    });
});