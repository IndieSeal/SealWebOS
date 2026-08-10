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

    let settingsNameElement = document.getElementsByClassName('settingsName')[0];
    let audioSliderElement = document.getElementsByClassName('audioSlider')[0];
    let audioValueElement = document.getElementsByClassName('audioSetting-value')[0];

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
    if(category != undefined){
        category.audioList.push(audio);

        console.log("pushed into category!");
    }
    else{
        let newCategory = new Category(categoryName);
        categories.push(newCategory);

        newCategory.addAudio(audio);
        console.log(`added a new category! Which is: ${categoryName}`);
    }
}

class Category{
    volume = 1;
    audioList = [];

    constructor(categoryName, slider = undefined){
        this.name = categoryName;

        if(slider != undefined) {
            this.slider = slider;
            this.slider.addEventListener('input', (e) => this.changeVolume(e.target.value));
        }
    }

    addAudio = (audio) => {
        this.audioList.push(audio);
    }

    changeVolume = (volume) => {
        this.audioList.forEach(audio => audio.volume = volume);
    }
}