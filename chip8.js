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

function spriteSetup(){
	memory[0]  = 0b11110000;
	memory[1]  = 0b10010000;
	memory[2]  = 0b10010000;
	memory[3]  = 0b10010000;
	memory[4]  = 0b11110000;
	
	memory[5]  = 0b00100000;
	memory[6]  = 0b01100000;
	memory[7]  = 0b00100000;
	memory[8]  = 0b00100000;
	memory[9]  = 0b01110000;

	memory[10] = 0b11110000;
	memory[11] = 0b00010000;
	memory[12] = 0b11110000;
	memory[13] = 0b10000000;
	memory[14] = 0b11110000; 
	
	memory[15] = 0b11110000;
	memory[16] = 0b00010000;
	memory[17] = 0b11110000;
	memory[18] = 0b00010000;
	memory[19] = 0b11110000;
	
	memory[20] = 0b10010000;
	memory[21] = 0b10010000;
	memory[22] = 0b11110000;
	memory[23] = 0b00010000;
	memory[24] = 0b00010000;

	memory[25] = 0b11110000;
	memory[26] = 0b10000000;
	memory[27] = 0b11110000;
	memory[28] = 0b00010000;
	memory[29] = 0b11110000;

	memory[30] = 0b11110000;
	memory[31] = 0b10000000;
	memory[32] = 0b11110000;
	memory[33] = 0b10010000;
	memory[34] = 0b11110000;
	
	memory[35] = 0b11110000;
	memory[36] = 0b00010000;
	memory[37] = 0b00100000;
	memory[38] = 0b01000000;
	memory[39] = 0b01000000;

	memory[40] = 0b11110000;
	memory[41] = 0b10010000;
	memory[42] = 0b11110000;
	memory[43] = 0b10010000;
	memory[44] = 0b11110000;
	
	memory[45] = 0b11110000;
	memory[46] = 0b10010000;
	memory[47] = 0b11110000;
	memory[48] = 0b00010000;
	memory[49] = 0b11110000;

	memory[50] = 0b11110000;
	memory[51] = 0b10010000;
	memory[52] = 0b11110000;
	memory[53] = 0b10010000;
	memory[54] = 0b10010000;
	
	memory[55] = 0b11100000;
	memory[56] = 0b10010000;
	memory[57] = 0b11100000;
	memory[58] = 0b10010000;
	memory[59] = 0b11100000;

	memory[60] = 0b11110000;
	memory[61] = 0b10000000;
	memory[62] = 0b10000000;
	memory[63] = 0b10000000;
	memory[64] = 0b11110000;

	memory[65] = 0b11100000;
	memory[66] = 0b10010000;
	memory[67] = 0b10010000;
	memory[68] = 0b10010000;
	memory[69] = 0b11100000;

	memory[70] = 0b11110000;
	memory[71] = 0b10000000;
	memory[72] = 0b11110000;
	memory[73] = 0b10000000;
	memory[74] = 0b11110000;

	memory[75] = 0b11110000;
	memory[76] = 0b10000000;
	memory[77] = 0b11110000;
	memory[78] = 0b10000000;
	memory[79] = 0b10000000;
}
spriteSetup();

