class Chip8 {
	constructor() {
// 4096 bytes of memory
this.memory = new Uint8Array(4096);

// 16 8-bit registers
this.V = new Uint8Array(16);

this.stack = new Uint16Array(16);

// Special registers
this.I         = new Uint16Array(1); // Windof like an address pointer
this.PC        = new Uint16Array(1); // Program counter
this.SP        = new Uint8Array(1);  // Stack pointer
this.delay_reg = new Uint8Array(1);  // Delay timer
this.sound_red = new Uint8Array(1);  // Sound timer

this.framebuffer = Array(32).fill().map(() => Array(64).fill(false));
	}
}

let chipEight = new Chip8();

let canvas = document.getElementById("myCanvas");

let scale = 10;
const canvasWidth  = 64 * scale;
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
function setPixel(row, col, scale, data){
	let index = 4 * scale * (row * canvasWidth + col);
	let adjustValue = (canvasWidth - scale) * 4;
	
	for(let i = 0; i < scale; i++){
		for(let j = 0; j < scale; j++){
			data[index] = 128;
			data[index + 1] = 128;
			data[index + 2] = 128;
			index += 4; 
		}
		index += adjustValue;
	}
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

function spriteSetup(){
	chipEight.memory[0]  = 0b11110000;
	chipEight.memory[1]  = 0b10010000;
	chipEight.memory[2]  = 0b10010000;
	chipEight.memory[3]  = 0b10010000;
	chipEight.memory[4]  = 0b11110000;

	chipEight.memory[5]  = 0b00100000;
	chipEight.memory[6]  = 0b01100000;
	chipEight.memory[7]  = 0b00100000;
	chipEight.memory[8]  = 0b00100000;
	chipEight.memory[9]  = 0b01110000;

	chipEight.memory[10] = 0b11110000;
	chipEight.memory[11] = 0b00010000;
	chipEight.memory[12] = 0b11110000;
	chipEight.memory[13] = 0b10000000;
	chipEight.memory[14] = 0b11110000; 
	
	chipEight.memory[15] = 0b11110000;
	chipEight.memory[16] = 0b00010000;
	chipEight.memory[17] = 0b11110000;
	chipEight.memory[18] = 0b00010000;
	chipEight.memory[19] = 0b11110000;
	
	chipEight.memory[20] = 0b10010000;
	chipEight.memory[21] = 0b10010000;
	chipEight.memory[22] = 0b11110000;
	chipEight.memory[23] = 0b00010000;
	chipEight.memory[24] = 0b00010000;

	chipEight.memory[25] = 0b11110000;
	chipEight.memory[26] = 0b10000000;
	chipEight.memory[27] = 0b11110000;
	chipEight.memory[28] = 0b00010000;
	chipEight.memory[29] = 0b11110000;

	chipEight.memory[30] = 0b11110000;
	chipEight.memory[31] = 0b10000000;
	chipEight.memory[32] = 0b11110000;
	chipEight.memory[33] = 0b10010000;
	chipEight.memory[34] = 0b11110000;
	
	chipEight.memory[35] = 0b11110000;
	chipEight.memory[36] = 0b00010000;
	chipEight.memory[37] = 0b00100000;
	chipEight.memory[38] = 0b01000000;
	chipEight.memory[39] = 0b01000000;

	chipEight.memory[40] = 0b11110000;
	chipEight.memory[41] = 0b10010000;
	chipEight.memory[42] = 0b11110000;
	chipEight.memory[43] = 0b10010000;
	chipEight.memory[44] = 0b11110000;
	
	chipEight.memory[45] = 0b11110000;
	chipEight.memory[46] = 0b10010000;
	chipEight.memory[47] = 0b11110000;
	chipEight.memory[48] = 0b00010000;
	chipEight.memory[49] = 0b11110000;

	chipEight.memory[50] = 0b11110000;
	chipEight.memory[51] = 0b10010000;
	chipEight.memory[52] = 0b11110000;
	chipEight.memory[53] = 0b10010000;
	chipEight.memory[54] = 0b10010000;
	
	chipEight.memory[55] = 0b11100000;
	chipEight.memory[56] = 0b10010000;
	chipEight.memory[57] = 0b11100000;
	chipEight.memory[58] = 0b10010000;
	chipEight.memory[59] = 0b11100000;

	chipEight.memory[60] = 0b11110000;
	chipEight.memory[61] = 0b10000000;
	chipEight.memory[62] = 0b10000000;
	chipEight.memory[63] = 0b10000000;
	chipEight.memory[64] = 0b11110000;

	chipEight.memory[65] = 0b11100000;
	chipEight.memory[66] = 0b10010000;
	chipEight.memory[67] = 0b10010000;
	chipEight.memory[68] = 0b10010000;
	chipEight.memory[69] = 0b11100000;

	chipEight.memory[70] = 0b11110000;
	chipEight.memory[71] = 0b10000000;
	chipEight.memory[72] = 0b11110000;
	chipEight.memory[73] = 0b10000000;
	chipEight.memory[74] = 0b11110000;

	chipEight.memory[75] = 0b11110000;
	chipEight.memory[76] = 0b10000000;
	chipEight.memory[77] = 0b11110000;
	chipEight.memory[78] = 0b10000000;
	chipEight.memory[79] = 0b10000000;
}
spriteSetup();

function soundTest() {
// one context per document
var context = new (window.AudioContext || window.webkitAudioContext)();
var osc = context.createOscillator(); // instantiate an oscillator
osc.type = 'sine'; // this is the default - also square, sawtooth, triangle
osc.frequency.value = 440; // Hz
osc.connect(context.destination); // connect it to the destination
osc.start(); // start the oscillator
osc.stop(context.currentTime + .2); // stop 2 seconds after the current time
}

function instructions(){
	let instruction = 0;
	if(instruction == 0x00E0) { // clears display
		for(let i = 0; i < 32; i++){
			for(let j = 0; j < 64; j++){
				framebuffer[i][j] = 0;
			}
		}
	}
	0x00EE // 
}

function main() {
	chipEight.stack[0] = 0;
	chipEight.SP[0] = chipEight.stack[0];
	chipEight.SP[0] = 1;
	console.log(chipEight.stack[0]);
}

main();
