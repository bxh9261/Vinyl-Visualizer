/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as canvas from './canvas.js';
import * as audio from './audio.js';
import * as utils from './utils.js';

const drawParams = {
    albumCover : "media/california.png",
    showGradient : true,
    showBars : true,
    showCircles : true,
    showNoise : false,
    showInvert : false,
    showEmboss : false,
    rotation : 0,
    rotationSpeed : 0.01,
    earthquake : 0,
    showFreq : true,
    barHeight : 1,
    currentTime : 0
};

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1  :  "media/cynical.mp3"
});

function init(){
    audio.setupWebaudio(DEFAULTS.sound1);
	console.log("init called");
	console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	setupUI(canvasElement);
    canvas.setupCanvas(canvasElement,audio.analyserNode);
    loop();
}

function setupUI(canvasElement){
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#fsButton");
  const gradientCB = document.querySelector("#gradientCB");
  const barsCB = document.querySelector("#barsCB");
  const circlesCB = document.querySelector("#circlesCB");
  const noiseCB = document.querySelector("#noiseCB");
  const invertCB = document.querySelector("#invertCB");
  const embossCB = document.querySelector("#embossCB");
  const freqRB = document.querySelector("#freq");
  const waveRB = document.querySelector("#wave");
	
  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };
    
  gradientCB.onclick = e => {
    drawParams.showGradient = gradientCB.checked;
  };
    
  barsCB.onclick = e => {
    drawParams.showBars = barsCB.checked;
  };
    
  circlesCB.onclick = e => {
    drawParams.showCircles = circlesCB.checked;
  };
    
  noiseCB.onclick = e => {
    drawParams.showNoise = noiseCB.checked;
  };
    
  invertCB.onclick = e => {
    drawParams.showInvert = invertCB.checked;
  };
    
  embossCB.onclick = e => {
    drawParams.showEmboss = embossCB.checked;
  };
    
  freqRB.onclick = e => {
      drawParams.showFreq = true;
  };
  
  waveRB.onclick = e => {
      drawParams.showFreq = false;
  };
    
    const playButton = document.querySelector("#playButton");
    
playButton.onclick = e => {
    
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);
    
    if (audio.audioCtx.state == "suspended"){
        utils.setDTToValue(drawParams.currentTime);
        audio.audioCtx.resume();
        playButton.innerHTML = "Pause";
    }
    else{
        drawParams.currentTime = utils.tick();
        audio.audioCtx.suspend();
        playButton.innerHTML = "Play";
    }
    
    if(e.target.dataset.playing == "no"){
        audio.playCurrentSound();
        e.target.dataset.playing == "yes";
    }
    else{
        audio.pauseCurrentSound();
        e.target.dataset.playing = "no";
    }
};
    
    let volumeSlider = document.querySelector("#volumeSlider");
    
    //add .oninput to the event slider
    volumeSlider.oninput = e => {
        // set the gain
        audio.setVolume(e.target.value);
    };
    
    //set value of label to matcch itinial value of slider
    volumeSlider.dispatchEvent(new Event("input"));
    
    let rotSlider = document.querySelector("#rotSlider");
    
    rotSlider.oninput = e => {
        // set the gain
        drawParams.rotationSpeed = e.target.value / 100;
    };
    
    let earSlider = document.querySelector("#earSlider");
    
    earSlider.oninput = e => {
        // shake it up
        drawParams.earthquake = e.target.value / 100;
    };
    
    let barSlider = document.querySelector("#barSlider");
    
    barSlider.oninput = e => {
        // change bar height
        drawParams.barHeight = e.target.value;
    };
        
    let basSlider = document.querySelector("#basSlider");
    
    basSlider.oninput = e => {
        // change bass (0-1000)
        audio.setBass(e.target.value * 500);
    };
    
    let treSlider = document.querySelector("#treSlider");
    
    treSlider.oninput = e => {
        // change treble (0-1000)
        audio.setTreble(e.target.value * 500);
    };
    
    //set value of label to matcch itinial value of slider
    //volumeSlider.dispatchEvent(new Event("input"));
    
    let trackSelect = document.querySelector("#trackSelect");
    
    trackSelect.onchange = e => {
        drawParams.currentTime = 0;
        audio.loadSoundFile(e.target.value.split(',')[0]);
        audio.requestDuration();
        drawParams.albumCover = e.target.value.split(',')[1];
        audio.audioCtx.suspend();
        playButton.innerHTML = "Play";
    };
    

} // end setupUI

function loop(){
	requestAnimationFrame(loop);
    drawParams.rotation+=drawParams.rotationSpeed;
    canvas.draw(drawParams);
}

export {init};