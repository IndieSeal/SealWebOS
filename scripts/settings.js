import { instantiateBeforeEnd } from "./mathf.js";

const audioSliderPrefab = `
    <div class="audioSetting">
        <p class="settingsName">Setting Name</p>
        <div class="sliderHolder">
            <input class="audioSlider" type="range" min="0" max="1" step="0.01" value="0.05">
            <p class="audioSetting-value">100%</p>
        </div>
    </div>
`;

const settingsCategoryHolder = document.getElementById('settingsCategory-holder');
function getCategory(name){
    let id = `settingsCategory_${name}`;
    let category = document.getElementById(id);

    if(category == undefined){
        const categoryPrefab = `
            <div class="separate-box settingsBox">
                <h3>${name}</h3>
                <div class="settings-holder" id="${id}">
                    <!-- Content added through 'settings.js' -->
                </div>
            </div>
        `;
        
        let instance = instantiateBeforeEnd(categoryPrefab, settingsCategoryHolder);
        category = instance.getElementsByClassName('settings-holder')[0];
    }

    return category;
}

class Setting{
    onValueSet = undefined;

    constructor(name, category, defaultValue){
        this.lsID = `${category}_${name}`;
        this.defaultValue = defaultValue;

        this.value = localStorage.getItem(this.lsID) ?? this.defaultValue;

        this.categoryName = category;
        this.category = getCategory(this.categoryName);
    }

    setValue(val){
        this.value = val;
        localStorage.setItem(this.lsID, val);

        if(this.onValueSet != undefined) this.onValueSet(val);
    }

    applyResetSettings = () => {
        this.setValue(this.defaultValue);
    }
}

// I should add a sound for when you change the slider, so it feels JUICIER, you know?
export class SliderSetting extends Setting{
    constructor(name, category, defaultValue, min, max, step, value, setValueAtStart = false){
        super(name, category, defaultValue);

        this.sliderPrefab = `
            <div class="audioSetting">
                <p class="settingsName">${name}</p>
                <div class="sliderHolder">
                    <input class="audioSlider" type="range" min="${min}" max="${max}" step="${step}" value="${value}">
                    <p class="audioSetting-value">100%</p>
                </div>
            </div>
        `;

        this.instance = instantiateBeforeEnd(this.sliderPrefab, this.category);
        this.element = this.instance.getElementsByClassName('audioSlider')[0];
        this.valueElement = this.instance.getElementsByClassName('audioSetting-value')[0];

        this.element.addEventListener('input', this.onSliderChanged);

        if(setValueAtStart) this.setValue(this.value);
    }

    setValue(val){
        super.setValue(val);

        this.element.value = val;
        this.valueElement.innerHTML = `${Math.round(val * 100)}%`;
    }

    onSliderChanged = (e) => {
        let value = e.target.value;
        this.setValue(value);
    }
}

export class LiteralSliderSetting extends SliderSetting{
    constructor(name, category, defaultValue, min, max, step, value, setValueAtStart = false, finisher = 'x'){
        super(name, category, defaultValue, min, max, step, value, setValueAtStart);

        this.finisher = finisher;
    }

    setValue(val){
        super.setValue(val);
    
        this.valueElement.innerHTML = `${val}${this.finisher}`;
    }
}

export class AudioSetting extends SliderSetting{
    constructor(name, category, audioRef){
        super(name, category, audioRef.volume, 0, 1, 0.01, audioRef.volume);

        this.audioRef = audioRef;
        this.setValue(this.value);
    }

    setValue(val){
        super.setValue(val);

        this.audioRef.volume = val;
    }
}

var newAudioCategories = [];
export function addCategoryAudio(categoryName, audio){
    let category = newAudioCategories.find(cat => cat.name == categoryName);

    if(category == undefined){
        category = new MasterAudioCategorySetting(categoryName);
        newAudioCategories.push(category);
    }
    
    let catAudio = new CategoryAudio(audio);
    category.addAudio(catAudio);
    
    return catAudio;
}

export class MasterAudioCategorySetting extends SliderSetting{
    currentVolume = 1;
    audioList = [];

    constructor(name, category = "Audio"){
        super(name, category, 1, 0, 1, 0.01, 1, true);

        this.name = name;
        this.setValue(this.value);
    }
    
    setValue = (val) => {
        super.setValue(val);

        this.updateCategoryAudioSetting(val);
    }

    addAudio = (audio) => {
        this.audioList.push(audio);
        this.updateCategoryAudioSetting(this.currentVolume);
    }

    updateCategoryAudioSetting = (val) => {
        this.currentVolume = val;

        this.audioList.forEach(audio => audio.changeVolume(this.currentVolume));
        this.valueElement.innerHTML = `${Math.round(this.currentVolume * 100)}%`;
    }
}

class CategoryAudio{
    constructor(audioRef){
        this.audioRef = audioRef;
        this.baseVolume = audioRef.volume;

        this.latestVol = 1;
    }

    changeVolume = (vol) => {
        this.latestVol = vol;
        this.audioRef.volume = this.baseVolume * vol;
    }

    changeBaseVolume = (baseVol) => {
        this.baseVolume = baseVol;
        this.audioRef.volume = this.baseVolume * this.latestVol;
    }
}

export class ToggleSetting extends Setting{
    constructor(name, category, defaultValue, callback){
        super(name, category, defaultValue);

        this.togglePrefab = `
            <div class="audioSetting">
                <p class="settingsName">${name}</p>
                <div class="sliderHolder">
                    <input class="checkbox" type="checkbox">
                    <p class="audioSetting-value">${this.getStateName()}</p>
                </div>
            </div>
        `;

        this.callback = callback;

        this.instance = instantiateBeforeEnd(this.togglePrefab, this.category);
        this.checkboxElement = this.instance.getElementsByClassName('checkbox')[0];
        this.checkboxValueElement = this.instance.getElementsByClassName('audioSetting-value')[0];

        this.checkboxElement.addEventListener('click', this.updateToggleSetting);

        this.setValue(this.value);
    }

    updateToggleSetting = () => {
        this.setValue(this.checkboxElement.checked);
    }

    setValue(val){
        super.setValue(String(val));

        this.checkboxValueElement.innerHTML = this.getStateName();
        this.checkboxElement.checked = this.getCheckedStatus();

        this.callback(this.getCheckedStatus());
    }

    getCheckedStatus = () => {
        return this.value == 'true';
    }

    getStateName = () => {
        return this.getCheckedStatus() ? "Active" : "Disabled";
    }
}