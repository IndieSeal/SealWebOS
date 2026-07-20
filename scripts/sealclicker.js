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

const generalUpgradeParent = document.getElementById("general_upgrades");
const autoclickerUpgradeParent = document.getElementById("autoclicker_upgrades");

const autoclickerUpgradeRowParent = document.getElementById("upgrade-visual-rows");

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
    constructor(name, description, icon, rowImg, rowIcon){
        this.name = name;
        this.description = description;
        this.icon = icon;

        this.rowImg = rowImg;
        this.rowIcon = rowIcon;
    }
}

class Upgrade{
    amount = 0;
    
    constructor(upgradeID, upgradeInformation, basePrice, priceMultiplier){
        this.upgradeID = upgradeID;
        this.upgradeInfo = upgradeInformation;

        this.basePrice = basePrice;
        this.priceMultiplier = priceMultiplier;

        this.onUpgradeBought = new CustomEvent("onUpgradeBought", {
            detail: {
                upgrade: this,
            },
        });
    }

    setup = () =>{
        this.upgradeNameElement = document.getElementById(this.upgradeID + UPGRADE_NAME_SUFFIX);
        this.upgradeIconElement = document.getElementById(this.upgradeID + UPGRADE_ICON_SUFFIX);

        this.buyElement = document.getElementById(this.upgradeID + UPGRADE_BUY_SUFFIX);
        this.costElement = document.getElementById(this.upgradeID + UPGRADE_COST_SUFFIX);
        this.amountElement = document.getElementById(this.upgradeID + UPGRADE_AMOUNT_SUFFIX);
        
        this.buyElement.addEventListener("click", this.onBuyElementClicked);
        this.updateUI();
    }

    onBuyElementClicked = () =>{
        this.buyUpgrade();
        this.updateUI();
    }

    updateUI(){
        if(this.costElement != undefined) this.costElement.innerHTML = `${this.getPrice().toLocaleString('en-US')}`;
        if(this.amountElement != undefined) this.amountElement.innerHTML = `${this.amount.toLocaleString('en-US')}`;

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

        this.autoclickerPrefab = `
            <button class="autoclicker_upgrade" id="${upgradeID}_buy">
                <img class="icon" id="${upgradeID}_icon" src="./imgs/SealClicker/Click.png">
                <div class="column" style="margin-left: 15px;">
                    <b id="${upgradeID}_name" style="font-size: 1.5rem;">My name</b>
                    <div class="row" style="justify-content: flex-start; width: 100%;">
                        <img class="small_icon" src="./imgs/SealClicker/Food.png">
                        <p class="autoclicker_cost" id="${upgradeID}_cost">0</p>
                    </div>
                </div>
                <p class="quantity" id="${upgradeID}_amount">--</p>
            </button>
        `;

        this.htmlRowPrefab = `
            <div class="windows upgrade-rows" id="${upgradeID}_upgrade-row" style="background-image: url('./imgs/SealClicker/Seal1.jpg');">
                <!-- Content added through 'sealclicker.js' -->
            </div>
        `;

        autoclickerUpgradeRowParent.insertAdjacentHTML('beforeend', this.htmlRowPrefab);

        this.htmlRowItemPrefab = `
            <img src='${upgradeInformation.rowIcon}' style="width: 64px; height: 64px;">
        `;

        autoclickerUpgradeParent.insertAdjacentHTML('beforeend', this.autoclickerPrefab);

        this.upgradeRowElement = document.getElementById(upgradeID + UPGRADE_ROW_SUFFIX);
        this.pointsPerSecond = pointsPerSecond;

        allAutoclickers.push(this);

        setTimeout(() => this.loop(), MILLIS_PER_SECOND);

        this.onUpgradeBought = new CustomEvent("onUpgradeBought", {
            detail: {
                upgrade: this,
            },
        });
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
        this.upgradeRowElement.insertAdjacentHTML('beforeend', this.htmlRowItemPrefab);
    }
}

class MultiplierUpgrade extends Upgrade{
    multipliers = 1;
    
    constructor(upgradeID, upgradeInformation, basePrice, onBuyFunction, conditionFunction){
        super(upgradeID, upgradeInformation, basePrice, 1);

        this.upgradePrefab = `
            <button class="general_upgrade" id="${upgradeID}_buy" style="display: none;">
                <img src="${upgradeInformation.icon}">
            </button>
        `;

        generalUpgradeParent.insertAdjacentHTML('beforeend', this.upgradePrefab);

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
    scoreText.innerHTML = `Points: ${Math.floor(points).toLocaleString('en-US')}`;
}

function onUpgradeBought(upgrade)
{
    let score = 0;
    allAutoclickers.forEach(element => {
        score += element.getProduction();
    });

    totalScorePerSecond.innerHTML = `per second: ${score.toLocaleString('en-US')}`;
    document.dispatchEvent(upgrade.onUpgradeBought);
}

const totalScorePerSecond = document.getElementById("sealclicker-score_persecond");

var normalSealInfo = new UpgradeInformation("Normal Seal", "This little guy will help you collect fish from the North Atlantic!", './imgs/SealClicker/NormalSeal.png', './imgs/SealClicker/Seal1.jpg', './imgs/AppIcons/AboutMe.png');
var normalSealUpgrade = new AutoclickerUpgrade("normalseal", normalSealInfo, 10, 1.15, 0.3);
normalSealUpgrade.setup();

var ribbonSealInfo = new UpgradeInformation("Ribbon Seal", "It has some quite cool stripes", './imgs/SealClicker/RibbonSeal.png', './imgs/SealClicker/Seal1.jpg', './imgs/AppIcons/AboutMe.png');
var ribbonSealUpgrade = new AutoclickerUpgrade("ribbonseal", ribbonSealInfo, 100, 1.15, 1);
ribbonSealUpgrade.setup();

var pocketSealInfo = new UpgradeInformation("Pocket Seal", "Straight out of a different universe", './imgs/SealClicker/PocketSeal.png', './imgs/SealClicker/Seal1.jpg', './imgs/AppIcons/AboutMe.png');
var pocketSealUpgrade = new AutoclickerUpgrade("pocketseal", pocketSealInfo, 1100, 1.15, 8);
pocketSealUpgrade.setup();

var realisticSealInfo = new UpgradeInformation("Realistic Seal", "A whole new dimension", './imgs/SealClicker/RealisticSeal.png', './imgs/SealClicker/Seal1.jpg', './imgs/AppIcons/AboutMe.png');
var realisticSealUpgrade = new AutoclickerUpgrade("realisticseal", realisticSealInfo, 12000, 1.15, 47);
realisticSealUpgrade.setup();

var outOfWorldSealInfo = new UpgradeInformation("Out of World Seal", "A whole new dimension", './imgs/SealClicker/OutOfWorldSeal.png', './imgs/SealClicker/Seal1.jpg', './imgs/AppIcons/AboutMe.png');
var outOfWorldSealUpgrade = new AutoclickerUpgrade("outofworldseal", outOfWorldSealInfo, 130000, 1.15, 260);
outOfWorldSealUpgrade.setup();

var mysticSealInfo = new UpgradeInformation("Mystic Seal", "The god of all seals", './imgs/SealClicker/MysticSeal.png', './imgs/SealClicker/Seal1.jpg', './imgs/AppIcons/AboutMe.png');
var mysticSealUpgrade = new AutoclickerUpgrade("mysticseal", mysticSealInfo, 1400000, 1.15, 1400);
mysticSealUpgrade.setup();

var generalUpgradeInfo = new UpgradeInformation("Basic Autofeeder", "This machine will feed seals automatically, making them <b>twice as efficient</b>.", './imgs/SealClicker/Seal1.jpg', '');
var generalUpgrade = new MultiplierUpgrade("general", generalUpgradeInfo, 100,
    () => {
        baseClickPoints *= 2;
        normalSealUpgrade.multipliers *= 2;
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
    
    tooltipExtraDescElement.innerHTML = `Production per level: ${autoclicker.pointsPerSecond.toLocaleString('en-US')}<br>Current production: ${autoclicker.getProduction().toLocaleString('en-US')}`
}

function onTooltipEnterItem(upgrade){
    tooltipElement.style.display = "flex";

    let upgradeInfo = upgrade.upgradeInfo;
    tooltipNameElement.innerHTML = upgradeInfo.name;
    tooltipDescriptionElement.innerHTML = upgradeInfo.description;
    tooltipCostElement.innerHTML = upgrade.getPrice().toLocaleString('en-US');

    tooltipIconElement.src = upgradeInfo.icon;
}

function onTooltipExitItem(upgrade){
    tooltipElement.style.display = "none";
    tooltipExtraDescElement.innerHTML = "";
}

//#endregion