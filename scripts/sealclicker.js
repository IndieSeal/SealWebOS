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
var baseClickPoints = 1;

function onSealClicked(){
    setNewRandomImage();
    sumPoints(baseClickPoints);
}

const scoreText = document.getElementById("sealclicker-score");
var points = 0;

const UPGRADE_NAME_SUFFIX = "_name";
const UPGRADE_ICON_SUFFIX = "_icon";
const UPGRADE_ROW_SUFFIX = "_upgrade-row";

const UPGRADE_BUY_SUFFIX = "_buy";
const UPGRADE_COST_SUFFIX = "_cost";
const UPGRADE_AMOUNT_SUFFIX = "_amount";

const MILLIS_PER_SECOND = 1000;
const UPDATES_PER_SECOND = 10;

var allAutoclickers = [];
var allGeneralUpgrades = [];

class UpgradeInformation{
    constructor(name, description, icon, rowIcon){
        this.name = name;
        this.description = description;
        this.icon = icon;

        this.rowIcon = rowIcon;
    }
}

class Upgrade{
    amount = 0;
    
    constructor(upgradeID, upgradeInformation, basePrice, priceMultiplier){
        this.upgradeID = upgradeID;
        this.upgradeInfo = upgradeInformation;

        this.upgradeNameElement = document.getElementById(upgradeID + UPGRADE_NAME_SUFFIX);
        this.upgradeIconElement = document.getElementById(upgradeID + UPGRADE_ICON_SUFFIX);

        this.buyElement = document.getElementById(upgradeID + UPGRADE_BUY_SUFFIX);
        this.costElement = document.getElementById(upgradeID + UPGRADE_COST_SUFFIX);
        this.amountElement = document.getElementById(upgradeID + UPGRADE_AMOUNT_SUFFIX);

        this.basePrice = basePrice;
        this.priceMultiplier = priceMultiplier;

        this.onUpgradeBought = new CustomEvent("onUpgradeBought", {
            detail: {
                upgrade: undefined,
            },
        });
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
        if(this.amountElement != undefined) this.amountElement.innerHTML = `${this.amount}`;

        if(this.upgradeNameElement != undefined) this.upgradeNameElement.innerHTML = `${this.upgradeInfo.name}`;
        if(this.upgradeIconElement != undefined) this.upgradeIconElement.src = `${this.upgradeInfo.icon}`;
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

        onUpgradeBought(this);

        return true;
    }
}

class AutoclickerUpgrade extends Upgrade{
    multipliers = 1;
    
    constructor(upgradeID, upgradeInformation, basePrice, priceMultiplier, pointsPerSecond){
        super(upgradeID, upgradeInformation, basePrice, priceMultiplier);

        this.upgradeRowElement = document.getElementById(upgradeID + UPGRADE_ROW_SUFFIX);
        this.pointsPerSecond = pointsPerSecond;

        allAutoclickers.push(this);

        setTimeout(() => this.loop(), MILLIS_PER_SECOND);

        this.onUpgradeBought = new CustomEvent("onUpgradeBought", {
            detail: {
                upgrade: this,
            },
        });

        this.htmlRowPrefab = `
            <img src='${upgradeInformation.rowIcon}' style="width: 64px; height: 64px;">
        `;
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

    buyUpgrade(){
        if(!super.buyUpgrade()) return;

        this.upgradeRowElement.style.display = 'flex';
        this.upgradeRowElement.insertAdjacentHTML('beforeend', this.htmlRowPrefab);
        console.log("Spawn element");
    }
}

class MultiplierUpgrade extends Upgrade{
    multipliers = 1;
    
    constructor(upgradeID, upgradeInformation, basePrice, onBuyFunction, conditionFunction){
        super(upgradeID, upgradeInformation, basePrice, 1);

        allGeneralUpgrades.push(this);
        
        this.onBuyFunction = onBuyFunction;
        this.conditionFunction = conditionFunction;

        this.isUnlocked = false;

        setTimeout(() => this.loop(), MILLIS_PER_SECOND);

        this.onUpgradeBought = new CustomEvent("onUpgradeBought", {
            detail: {
                upgrade: this,
            },
        });
    }

    buyUpgrade(){
        if(!this.canBuy()) return false;

        this.buyElement.style.display = "none";
        this.onBuyFunction();

        super.buyUpgrade();
        return true;
    }

    loop = function(){
        setTimeout(() => this.loop(), MILLIS_PER_SECOND/UPDATES_PER_SECOND);

        if(!this.isUnlocked && this.conditionFunction() == true){
            this.buyElement.style.display = "flex";
            this.isUnlocked = true;
        }
    }
}

function sumPoints(newPoints){
    points += newPoints;
    scoreText.innerHTML = `Points: ${Math.floor(points)}`;
}

function onUpgradeBought(upgrade)
{
    let score = 0;
    allAutoclickers.forEach(element => {
        score += element.getProduction();
    });

    totalScorePerSecond.innerHTML = `per second: ${score.toFixed(1)}`;
    document.dispatchEvent(upgrade.onUpgradeBought);
}

const totalScorePerSecond = document.getElementById("sealclicker-score_persecond");

var autoclickerInfo = new UpgradeInformation("Harp Seal", "This little guy will help you collect fish from the North Atlantic!", './imgs/scorch_02.png', './imgs/AppIcons/AboutMe.png');
var autoclickUpgrade = new AutoclickerUpgrade("autoclicker", autoclickerInfo, 10, 1.2, 0.3);
autoclickUpgrade.setup();

var generalUpgradeInfo = new UpgradeInformation("Basic Autofeeder", "This machine will feed seals automatically, making them <b>twice as efficient</b>.", './imgs/scorch_02.png', '');

var generalUpgrade = new MultiplierUpgrade("general", generalUpgradeInfo, 100,
    () => {
        baseClickPoints *= 2;
        autoclickUpgrade.multipliers *= 2;
    }, () => points >= 10);
generalUpgrade.setup();

//#region Tooltip Interactions

const tooltipElement = document.getElementById("sealclicker-tooltip");

const tooltipNameElement = document.getElementById("item-name");
const tooltipDescriptionElement = document.getElementById("item-description");
const tooltipCostElement = document.getElementById("item-cost");

const tooltipIconElement = document.getElementById("item-icon");

const tooltipExtraDescElement = document.getElementById("item-extra");

allAutoclickers.forEach(autoclicker => {
    autoclicker.buyElement.addEventListener('mouseleave', () => {
        onTooltipExitItem(autoclicker);
    });
    document.addEventListener('onUpgradeBought', (e) => {
        onTooltipEnterAutoclicker(e.detail.upgrade);
    });
    autoclicker.buyElement.addEventListener('mouseenter', () => {
        onTooltipEnterItem(autoclicker);
        onTooltipEnterAutoclicker(autoclicker);
        
        let tooltipRect = tooltipElement.getBoundingClientRect();
        let rect = autoclicker.buyElement.getBoundingClientRect();
                
        tooltipElement.style.left = `${rect.left + window.scrollX - tooltipRect.width}px`;
        tooltipElement.style.top = `${rect.bottom + window.scrollY - (tooltipRect.height / 2) - (rect.height / 2)}px`;        
    });
});

allGeneralUpgrades.forEach(upgrade => {
    upgrade.buyElement.addEventListener('mouseleave', () => {
        onTooltipExitItem(upgrade);
    });
    upgrade.buyElement.addEventListener('mouseenter', () => {
        onTooltipEnterItem(upgrade);
        
        let tooltipRect = tooltipElement.getBoundingClientRect();
        let rect = document.getElementsByClassName("general_upgrades")[0].getBoundingClientRect();
                
        tooltipElement.style.left = `${rect.left + window.scrollX - tooltipRect.width}px`;
        tooltipElement.style.top = `${rect.bottom + window.scrollY - (tooltipRect.height / 2) - (rect.height / 2)}px`;        
    });
});

function onTooltipEnterAutoclicker(autoclicker){
    let isAutoclicker = autoclicker instanceof AutoclickerUpgrade;
    if(!isAutoclicker) return;
    
    tooltipExtraDescElement.innerHTML = `Production per level: ${autoclicker.pointsPerSecond.toFixed(2)}<br>Current production: ${autoclicker.getProduction().toFixed(2)}`
}

function onTooltipEnterItem(upgrade){
    tooltipElement.style.display = "flex";

    let upgradeInfo = upgrade.upgradeInfo;
    tooltipNameElement.innerHTML = upgradeInfo.name;
    tooltipDescriptionElement.innerHTML = upgradeInfo.description;
    tooltipCostElement.innerHTML = upgrade.getPrice();

    tooltipIconElement.src = upgradeInfo.icon;
}

function onTooltipExitItem(upgrade){
    tooltipElement.style.display = "none";
    tooltipExtraDescElement.innerHTML = "";
}

//#endregion