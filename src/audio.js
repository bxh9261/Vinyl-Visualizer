// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode, speedNode, delayNode, distortionFilter, bassBiquadFilter, trebleBiquadFilter;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain : .5,
    numSamples : 256
});

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples/2);

//length in seconds of "Cynical"
let duration = 115.0;

// **Next are "public" methods - we are going to export all of these at the bottom of this file**

function setupWebaudio(filePath){
    // 1 - The || is because WebAudio has not been standardized across browsers yet
    const AudioContext =    window.AudioContext ||  window.webkitAudioContext;
    audioCtx = new AudioContext();
    audioCtx.suspend();
    
    // 2 - this creates an <audio> element
    element = new Audio();

    // 3 - have it point at a sound file
    loadSoundFile(filePath);

    // 4 - create an a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    // 5 - create an analyser node
    // note the UK spelling of "Analyser"
    analyserNode = audioCtx.createAnalyser();

    //set playback speed -- doesn't work
    //sourceNode.playbackRate.value = 2.0;
    
    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

    // 7 - create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;
    
    //bass booster
    bassBiquadFilter = audioCtx.createBiquadFilter();
    bassBiquadFilter.type = "lowshelf";
    
    //treble booster
    trebleBiquadFilter = audioCtx.createBiquadFilter();
    trebleBiquadFilter.type = "highshelf";
    
    // 8 - connect the nodes - we now have an audio graph
    sourceNode.connect(analyserNode);
    analyserNode.connect(trebleBiquadFilter);
    trebleBiquadFilter.connect(bassBiquadFilter);
    bassBiquadFilter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
}
// make sure that it's a Number rather than a String

function loadSoundFile(filePath){
    element.src = filePath;
}

function playCurrentSound(){
    element.play();
}

function pauseCurrentSound(){
    element.pause();
}

function setVolume(value){
    value = Number(value);
    gainNode.gain.value = value;
}

function setBass(value){
    bassBiquadFilter.frequency.value = value;
    bassBiquadFilter.gain.value = value/40;
}

function setTreble(value){
    trebleBiquadFilter.frequency.value = value;
    trebleBiquadFilter.gain.value = value/40;
}

//https://stackoverflow.com/questions/20771845/how-to-get-the-size-and-duration-of-an-mp3-file
function requestDuration(){
    const mp3file = element.src;
    const request = new XMLHttpRequest();
    request.open('GET', mp3file, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        audioCtx.decodeAudioData(request.response,
            function(buffer) {
                let dur = buffer.duration;
                console.log(dur);
                duration = dur;
            }
        );
    }
    request.send();
}

function getDuration(){
    return duration;
}

export{
    audioCtx,
    setupWebaudio,
    playCurrentSound,
    pauseCurrentSound,
    loadSoundFile,
    setVolume,
    analyserNode,
    getDuration,
    requestDuration,
    setTreble,
    setBass
}