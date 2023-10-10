let chipEight = new Chip8();

let canvas = document.getElementById("myCanvas");

let scale = 10;
const canvasWidth = 64 * scale;
const canvasHeight = 32 * scale;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let ctx = canvas.getContext("2d", { alpha: false });
let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
let data = imageData.data;

// Function to set indiviual pixels
// Data store color values in one contigous array
// 4 indexes for RGBA
// order is left to right and top to bottom
function setPixel(place, scale, colorValue) {
  let index = 4 * scale * (Math.floor(place / 64) * canvasWidth + (place % 64));
  let adjustValue = (canvasWidth - scale) * 4;

  for (let i = 0; i < scale; i++) {
    for (let j = 0; j < scale; j++) {
      data[index] = colorValue;
      data[index + 1] = colorValue;
      data[index + 2] = colorValue;
      index += 4;
    }
    index += adjustValue;
  }
}

function updateDisplay() {
  for (let i = 0; i < 64 * 32; i++) {
    if (chipEight.framebuffer[i]) {
      setPixel(i, 10, 128);
    } else {
      setPixel(i, 10, 0);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

function soundTest(cycle) {
  // one context per document
  let context = new (window.AudioContext || window.webkitAudioContext)();
  let osc = context.createOscillator(); // instantiate an oscillator

  osc.type = "triangle"; // this is the default - also square, sawtooth, triangle
  osc.frequency.value = 440; // Hz
  osc.connect(context.destination); // connect it to the destination
  osc.start(); // start the oscillator
  osc.stop(context.currentTime + 0.016 * cycle); // stop 2 seconds after the current time
}

function mouseUp() {
  chipEight.key = "";
}

function mouseDown() {
  chipEight.key = event.target.value;
}

async function test() {
  chipEight.PC[0] = 0x200;
  while (chipEight.PC[0] <= chipEight.memory.length) {
	if(chipEight.hasExited){
	  return;
	}

    let opcode = chipEight.getOpcode();
    chipEight.executeOpcode(opcode);
	
	if(chipEight.continueStep){
      chipEight.PC[0] += 2;
	}

    updateDisplay();
    await wait(1);

    timer();
  }
}

function timer() {
  if (!(chipEight.delay_reg[0] || chipEight.sound_reg[0])) {
    return;
  }

  let date = Date.now();
  if (date - chipEight.prevTime >= 10) {
    chipEight.prevTime = date;
  } else {
    return;
  }

  if (chipEight.delay_reg[0]) {
    chipEight.delay_reg[0] -= 1;
  }

  if (chipEight.sound_reg[0]) {
    chipEight.sound_reg[0] -= 1;

    if (!chipEight.soundPlayed) {
	  if(chipEight.hasSound){
      	soundTest(chipEight.sound_reg[0]);
	  }
      chipEight.soundPlayed = true;
    }
  } else {
    chipEight.soundPlayed = false;
  }

  return;
}

function resetEmulator() {
  chipEight.hasExited = true;
	
  let romBtn = document.getElementsByClassName("romBtn");
  for(let i = 0; i < romBtn.length; i++){
    romBtn[i].disabled = false;
  }

  for(let i = 0; i < chipEight.framebuffer.length; i++){
    chipEight.framebuffer[i] = false;
  }

  for(let i = 0x200; i < 4096; i++){
	chipEight.memory[i] = 0;
  }
}

async function loadPong(button) {
  resetEmulator();
  button.disabled = true;
  let response = await fetch("./PONG");
  let result = await response.arrayBuffer();
  let romData = new Uint8Array(result);

  for (let i = 0; i < romData.length; i++) {
    chipEight.memory[0x0200 + i] = romData[i];
  }

  await wait(100);
 
  chipEight.hasExited = false;
  test();
}

async function loadTetris(button) {
  resetEmulator();
  button.disabled = true;
  let response = await fetch("./TETRIS");
  let result = await response.arrayBuffer();
  let romData = new Uint8Array(result);

  for (let i = 0; i < romData.length; i++) {
    chipEight.memory[0x0200 + i] = romData[i];
  }
  
  await wait(100);
  
  chipEight.hasExited = false;
  test();
}

window.addEventListener("keydown", (e) => {
  let key = e.key;
  if (key.length == 1) {
    if (("0" <= key && key <= "9") || ("a" <= key && key <= "f")) {
      chipEight.key = parseInt(key, 16);
    }
  }
});

window.addEventListener("keyup", (e) => {
  chipEight.key = "";
});

function toggleSound(){
	let soundButton = document.getElementById("soundButton");
	if(chipEight.hasSound){
		chipEight.hasSound = false;
		soundButton.innerHTML = "Sound: Off"
	} else {
		chipEight.hasSound = true;
		soundButton.innerHTML = "Sound: On"
	}
}
