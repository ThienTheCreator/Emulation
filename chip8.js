// 4096 bytes of memory
let memory = new Uint8Array(4096);

// 16 8-bit registers
let V = new Uint8Array(16);

let stack = new Uint16Array(16);

// Special registers
let I         = new Uint16Array(1); // Windof like an address pointer
let PC        = new Uint16Array(1); // Program counter
let SP        = new Uint8Array(1);  // Stack pointer
let delay_reg = new Uint8Array(1);  // Delay timer
let sound_red = new Uint8Array(1);  // Sound timer

let framebuffer = Array(32).fill().map(() => Array(64).fill(false));

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

async function time() {
	for(let i = 0;i < 32; i++){
		for(let j = 0; j < 64; j++){
			setPixel(i, j, 10, data);
			ctx.putImageData(imageData, 0, 0);	
			await wait(100);
		}
	}
}

time();
