import { instantiateBeforeEnd } from "./mathf.js";

const audioSettingsHolder = document.getElementById('setting-audioGeneral');
const audioSliderPrefab = `
    <div class="audioSetting">
        <p class="settingsName">Setting Name</p>
        <div class="sliderHolder">
            <input class="audioSlider" type="range" min="0" max="1" step="0.01" value="0.05">
            <p class="audioSetting-value">100%</p>
        </div>
    </div>
`;

export function createAudioSetting(audioRef, name){
    let instance = instantiateBeforeEnd(audioSliderPrefab, audioSettingsHolder);

    let settingsNameElement = instance.getElementsByClassName('settingsName')[0];
    let audioSliderElement = instance.getElementsByClassName('audioSlider')[0];
    let audioValueElement = instance.getElementsByClassName('audioSetting-value')[0];

    settingsNameElement.innerHTML = `${name}`;
    audioValueElement.innerHTML = `${audioRef.volume * 100}%`;
    audioSliderElement.value = audioRef.volume;    
    
    audioSliderElement.addEventListener('input', (e) => updateAudioSetting(e, audioValueElement, audioRef));
}

function updateAudioSetting(e, audioValElement, audioRef){
    let value = e.target.value;

    audioRef.volume = value;
    audioValElement.innerHTML = `${Math.round(value * 100)}%`;
}

var categories = [];
export function addCategoryAudio(categoryName, audio){
    let category = categories.find(cat => cat.name == categoryName);
    if(category == undefined) category = new Category(categoryName);
    
    let catAudio = new CategoryAudio(audio);
    category.addAudio(catAudio);
    
    return catAudio;
}

class Category{
    volume = 1;
    audioList = [];

    constructor(categoryName){
        categories.push(this);
        
        this.name = categoryName;

        this.instance = instantiateBeforeEnd(audioSliderPrefab, audioSettingsHolder);

        this.settingsNameElement = this.instance.getElementsByClassName('settingsName')[0];
        this.audioSliderElement = this.instance.getElementsByClassName('audioSlider')[0];
        this.audioValueElement = this.instance.getElementsByClassName('audioSetting-value')[0];

        this.settingsNameElement.innerHTML = `${this.name}`;
        this.audioValueElement.innerHTML = `${this.volume * 100}%`;
        this.audioSliderElement.value = this.volume;

        this.audioSliderElement.addEventListener('input', (e) => this.updateCategoryAudioSetting());
    }

    addAudio = (audio) => {
        this.audioList.push(audio);
    }

    updateCategoryAudioSetting = () => {
        let value = this.audioSliderElement.value;

        this.audioList.forEach(audio => audio.changeVolume(value));
        this.audioValueElement.innerHTML = `${Math.round(value * 100)}%`;
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

const toggleSettingsHolder = document.getElementById('setting-optionsGeneral');
const togglePrefab = `
    <div class="audioSetting">
        <p class="settingsName">Setting Name</p>
        <div class="sliderHolder">
            <input class="checkbox" type="checkbox">
            <p class="audioSetting-value">100%</p>
        </div>
    </div>
`;

export function createToggleSetting(defaultValue, name, callback){
    let instance = instantiateBeforeEnd(togglePrefab, toggleSettingsHolder);

    let settingsNameElement = instance.getElementsByClassName('settingsName')[0];
    let checkboxElement = instance.getElementsByClassName('checkbox')[0];
    let checkboxValueElement = instance.getElementsByClassName('audioSetting-value')[0];

    settingsNameElement.innerHTML = `${name}`;
    checkboxElement.checked = defaultValue;
    checkboxValueElement.innerHTML = `${ checkboxElement.checked ? 'Active' : 'Disabled' }`;
    
    checkboxElement.addEventListener('click', (e) => updateToggleSetting(e, checkboxElement, checkboxValueElement, callback));
}

function updateToggleSetting(e, checkboxElement, checkboxValueElement, callback){
    let value = checkboxElement.checked;

    checkboxValueElement.innerHTML = `${ checkboxElement.checked ? 'Active' : 'Disabled' }`;
    callback(value);
}