/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';
import * as audio from './audio.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;


function setupCanvas(canvasElement,analyserNodeRef){
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0.3,color:"purple"},{percent:0.5,color:"#966fd6"},{percent:0.7,color:"purple"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);
}

function draw(params={}){
  // 1 - populate the audioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
	
    
    let rot = 0;
    let vinylRadius = canvasHeight/2 - 75;
    let offset = 100;
    if(params.showFreq){
        analyserNode.getByteFrequencyData(audioData);
    }
    else{
        analyserNode.getByteTimeDomainData(audioData); // waveform data
    }
	
	
	// 2 - draw background
	ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    utils.myFillRect(ctx,0,0,canvasWidth,canvasHeight);
    ctx.restore();
    
    
	
    // 3 - draw gradient
	
        ctx.save();
        if(params.showGradient){
            ctx.fillStyle = gradient;
        }
        else{
            ctx.fillStyle = "black";
        }
        ctx.globalAlpha = .3;
        utils.myFillRect(ctx,0,0,canvasWidth,canvasHeight);
        ctx.restore();
    
    
    
    ctx.restore();
    
	// 4 - draw bars
	if(params.showBars){
         // vars for sound bars
        let barWidth = (canvasWidth)/audioData.length;
        let baseHeight=5;
        let localHeight = params.barHeight;
        if(audio.audioCtx.state == "suspended"){
            localHeight = 0;
        }
        
        // draw bars
        for(let i=5; i<audioData.length; i++)
        {   
            ctx.save();
            ctx.fillStyle = "#b4b9ea";
            ctx.translate(canvasWidth/2-offset, canvasHeight/2);
            ctx.rotate((Math.PI * 2 * (i / (audioData.length-40)))+ (rot-=.00002));
            ctx.beginPath();
            utils.myFillRect(ctx,0,vinylRadius,barWidth-2, baseHeight+(audioData[i]*.6*localHeight));
            ctx.closePath();
            ctx.restore();
        } 
	
	}
    

        
        // 5 - draw album cover
        let thumbImg = document.createElement('img');
            if(params.showCircles){
                thumbImg.src = params.albumCover;
            }
            else{
                thumbImg.src = 'media/default-cover.png';
            }
        thumbImg.onload = function() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvasWidth/2 - offset, canvasHeight/2, vinylRadius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            
            //trick for rotating the image around center
            let cx = ((canvasWidth/2)-offset-vinylRadius) + 0.5 * vinylRadius*2;
            let cy = ((canvasHeight/2)-vinylRadius) + 0.5 * vinylRadius*2;

            ctx.translate(cx, cy);
            ctx.rotate(params.rotation);
            ctx.translate(-cx, -cy);
            
            ctx.globalAlpha = 1;
            
            ctx.drawImage(thumbImg, (canvasWidth/2)-offset-vinylRadius, (canvasHeight/2)-vinylRadius, vinylRadius*2, vinylRadius*2);
            ctx.beginPath();
            ctx.arc(canvasWidth/2-offset, canvasHeight/2, vinylRadius, 0, Math.PI * 2, true);
            ctx.clip();
            ctx.closePath();
            ctx.restore();
        };

    
    // draw record player
    
    let mult = 1.15;
    let current = 0;
    if(audio.audioCtx.state == "suspended"){
        current = params.currentTime/1000;
    }
    else{
        current = (utils.tick()/1000);
    }
    
    let end = audio.getDuration();
    let prog = current/end;
    let quake = params.earthquake*10;
    
    //don't move the needle if nothing is playing
    if(prog > 1){
        prog = 0;
        current = 0;
    }
    //richter scale
    prog += (Math.random() * quake*2) - quake;
    
    //this is the black circle the needle spins on
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(750*mult,150*mult,75*mult,0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    
    //this is for drawing the inner circle
    ctx.save();
    if(params.showGradient){
        ctx.fillStyle = gradient;
    }
    else{
        ctx.fillStyle = "black";
    }
    ctx.rotate(0);
    ctx.beginPath();
    ctx.arc(canvasWidth/2-offset,canvasHeight/2,50,0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(canvasWidth/2-offset,canvasHeight/2,10,0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
    
    ///this is th arm and it's a lot of math
    ctx.save();
    ctx.rotate((-Math.PI/3) + (.262 * prog));
    ctx.fillStyle = "gray";
    utils.myFillRect(ctx,0 + (200 * prog),712*mult - (100 * prog),350*mult,25*mult);
    ctx.rotate(Math.PI/6);
    utils.myFillRect(ctx,220*mult + (120 * prog),613*mult - (187 * prog),150*mult,25*mult);
    utils.myFillRect(ctx,120*mult + (120 * prog),588*mult - (187 * prog),150*mult,75*mult);
    ctx.fillStyle="black";
    ctx.font = "30px Arial";
    ctx.fillText(Math.floor(current/60) + ":" + utils.twoDigitize(Math.floor(current%60)) + "/" + Math.floor(end/60) + ":" + utils.twoDigitize(Math.floor(end%60)), 160 + (120 * prog),730 - (187 * prog));
    ctx.restore();
    

    
    
    
    
    // 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
	// the variable `data` below is a reference to that array 
	let imageData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width;
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for (let i = 0; i < length; i += 4){
		// C) randomly change every 20th pixel to red
	   if(params.showNoise && Math.random() < 0.05){
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
			// data[i+3] is the alpha channel
			data[i] = data[i+1] = data[i+2] = 0;// zero out the red and green and blue channels
            data[i+1] = 200;
            data[i] = 200;
		} // end if
        if(params.showInvert){
            let red = data[i], green = data[i+1], blue = data[i+2];
            data[i] = 255 - red;
            data[i+1] = 255 - green;
            data[i+2] = 255 - blue;
        }
	} // end for
    if(params.showEmboss){
        for(let i = 0; i < length; i++){
            if (i%4 == 3){
                continue;
            } 
            data[i] = 127 + 2*data[i] - data[i+4] - data[i + width*4];
        }
    }
	// D) copy image data back to canvas
    ctx.putImageData(imageData,0,0);
}

export {setupCanvas,draw};