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

    var lsID = `audio_${name}`;
    
    let settingsNameElement = instance.getElementsByClassName('settingsName')[0];
    let audioSliderElement = instance.getElementsByClassName('audioSlider')[0];
    let audioValueElement = instance.getElementsByClassName('audioSetting-value')[0];

    var volume = localStorage.getItem(lsID) ?? audioRef.volume;
    
    settingsNameElement.innerHTML = `${name}`;
    audioValueElement.innerHTML = `${volume * 100}%`;
    audioSliderElement.value = volume;  
    audioRef.volume = volume;  
    
    audioSliderElement.addEventListener('input', (e) => updateAudioSetting(e, lsID, audioValueElement, audioRef));
}

function updateAudioSetting(e, lsID, audioValElement, audioRef){
    let value = e.target.value;

    localStorage.setItem(lsID, value);

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
        this.lsID = `audioCategory_${this.name}`;
        
        this.volume = localStorage.getItem(this.lsID) ?? this.volume;

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
        this.updateCategoryAudioSetting();
    }

    updateCategoryAudioSetting = () => {
        this.volume = this.audioSliderElement.value;
        localStorage.setItem(this.lsID, this.volume);

        this.audioList.forEach(audio => audio.changeVolume(this.volume));
        this.audioValueElement.innerHTML = `${Math.round(this.volume * 100)}%`;
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

    var lsID = `toggle_${name}`;

    // it returns a string so I have to do a check dang, everything in this language is dynamic, BUT NOT THIS? really?
    let exists = localStorage.getItem(lsID);
    var checkedValue = undefined;

    if(exists) checkedValue = exists == 'true' ? true : false;
    else checkedValue = defaultValue;
    
    let settingsNameElement = instance.getElementsByClassName('settingsName')[0];
    let checkboxElement = instance.getElementsByClassName('checkbox')[0];
    let checkboxValueElement = instance.getElementsByClassName('audioSetting-value')[0];

    settingsNameElement.innerHTML = `${name}`;
    checkboxElement.checked = checkedValue;

    checkboxValueElement.innerHTML = `${ checkedValue ? 'Active' : 'Disabled' }`;
    
    callback(checkedValue);
    checkboxElement.addEventListener('click', (e) => updateToggleSetting(e, lsID, checkboxElement, checkboxValueElement, callback));
}

function updateToggleSetting(e, lsID, checkboxElement, checkboxValueElement, callback){
    let value = checkboxElement.checked;

    checkboxValueElement.innerHTML = `${ checkboxElement.checked ? 'Active' : 'Disabled' }`;
    callback(value);

    localStorage.setItem(lsID, value);
}