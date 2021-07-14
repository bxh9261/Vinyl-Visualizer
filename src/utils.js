// Why are the all of these ES6 Arrow functions instead of regular JS functions?
// No particular reason, actually, just that it's good for you to get used to this syntax
// For Project 2 - any code added here MUST also use arrow function syntax

let lastUpdate = Date.now();
let myInterval = setInterval(tick, 0);
let dt = 0;

const makeColor = (red, green, blue, alpha = 1) => {
  return `rgba(${red},${green},${blue},${alpha})`;
};

const getRandom = (min, max) => {
  return Math.random() * (max - min) + min;
};

const getRandomColor = () => {
	const floor = 35; // so that colors are not too bright or too dark 
  const getByte = () => getRandom(floor,255-floor);
  return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

const getLinearGradient = (ctx,startX,startY,endX,endY,colorStops) => {
  let lg = ctx.createLinearGradient(startX,startY,endX,endY);
  for(let stop of colorStops){
    lg.addColorStop(stop.percent,stop.color);
  }
  return lg;
};


const goFullscreen = (element) => {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullscreen) {
		element.mozRequestFullscreen();
	} else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	}
	// .. and do nothing if the method is not supported
};

//keeps track of time, returns seconds since last call
function tick() {
    let now = Date.now();
    dt += now - lastUpdate;
    lastUpdate = now;

    return(dt);
}

//reset delta time
function setDTToZero(){
    dt = 0;
    lastUpdate = Date.now();
}

//set delta time to value
function setDTToValue(value){
    dt = value;
    lastUpdate = Date.now();
}

//numbers 0-9 become 00-09 for time display
function twoDigitize(seconds){
    if(seconds < 10){
        return "0" + seconds;
    }
    else{
        return "" + seconds;
    }
}

function myFillRect(ctx,x,y,w,h){
    ctx.rect(x,y,w,h);
    ctx.fill();
}

export {makeColor, getRandomColor, getLinearGradient, goFullscreen, tick, setDTToZero, twoDigitize, setDTToValue, myFillRect};