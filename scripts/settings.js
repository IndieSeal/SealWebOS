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
    }

    applyResetSettings = () => {
        this.setValue(this.defaultValue);
    }
}

class SliderSetting extends Setting{
    constructor(name, category, defaultValue, min, max, step, value){
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

        let instance = instantiateBeforeEnd(this.sliderPrefab, getCategory(category));
        this.element = instance.getElementsByClassName('audioSlider')[0];
        this.valueElement = instance.getElementsByClassName('audioSetting-value')[0];

        this.element.addEventListener('input', this.onSliderChanged);
    }

    onSliderChanged(e){
        let value = e.target.value;
        this.setValue(value);
    }

    setValue(val){
        super.setValue(val);

        audioValElement.innerHTML = `${Math.round(val * 100)}%`;
    }
}

class AudioSetting extends SliderSetting{
    constructor(name, category, audioRef){
        super(name, category, audioRef.volume, 0, 1, 0.01, audioRef.volume);

        this.audioRef = audioRef;
    }

    setValue(val){
        super.setValue(val);

        this.audioRef.volume = val;
    }
}

export function createAudioSetting(audioRef, name, categoryName = "Audio"){
    let instance = instantiateBeforeEnd(audioSliderPrefab, getCategory(categoryName));

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

var audioCategories = [];
export function addCategoryAudio(categoryName, audio){
    let category = audioCategories.find(cat => cat.name == categoryName);
    if(category == undefined) category = new AudioCategory(categoryName);
    
    let catAudio = new CategoryAudio(audio);
    category.addAudio(catAudio);
    
    return catAudio;
}

class AudioCategory{
    volume = 1;
    audioList = [];

    constructor(audioCategoryName, categoryName = "Audio"){
        audioCategories.push(this);
        
        this.name = audioCategoryName;
        this.lsID = `audioCategory_${this.name}`;
        
        this.volume = localStorage.getItem(this.lsID) ?? this.volume;

        this.instance = instantiateBeforeEnd(audioSliderPrefab, getCategory(categoryName));

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

const togglePrefab = `
    <div class="audioSetting">
        <p class="settingsName">Setting Name</p>
        <div class="sliderHolder">
            <input class="checkbox" type="checkbox">
            <p class="audioSetting-value">100%</p>
        </div>
    </div>
`;

class ToggleSetting extends Setting{
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

        this.instance = instantiateBeforeEnd(this.togglePrefab, getCategory(category));
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

/* This should be working now, I just want to do some more testing, and optimize the code even further.
let toggleSet = new ToggleSetting('Debug Toggle', 'Options', 'false', (val) => {
    console.log(`I am a toggle, and my value isssss... ${val}`)
});
*/

export function createToggleSetting(defaultValue, name, callback, categoryName = "Options"){
    let instance = instantiateBeforeEnd(togglePrefab, getCategory(categoryName));

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