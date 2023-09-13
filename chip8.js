class Chip8 {
  constructor() {
    // 4096 bytes of memory
    this.memory = new Uint8Array(4096);

    // 16 8-bit registers
    this.V = new Uint8Array(16);

    this.stack = new Uint16Array(16);

    // Special registers
    this.I = new Uint16Array(1); // Windof like an address pointer
    this.PC = new Uint16Array(1); // Program counter
    this.SP = new Uint8Array(1); // Stack pointer
    this.delay_reg = new Uint8Array(1); // Delay timer
    this.sound_red = new Uint8Array(1); // Sound timer

    this.framebuffer = Array(32)
      .fill()
      .map(() => Array(64).fill(false));
  }

  spriteSetup() {
    this.memory[0] = 0b11110000;
    this.memory[1] = 0b10010000;
    this.memory[2] = 0b10010000;
    this.memory[3] = 0b10010000;
    this.memory[4] = 0b11110000;

    this.memory[5] = 0b00100000;
    this.memory[6] = 0b01100000;
    this.memory[7] = 0b00100000;
    this.memory[8] = 0b00100000;
    this.memory[9] = 0b01110000;

    this.memory[10] = 0b11110000;
    this.memory[11] = 0b00010000;
    this.memory[12] = 0b11110000;
    this.memory[13] = 0b10000000;
    this.memory[14] = 0b11110000;

    this.memory[15] = 0b11110000;
    this.memory[16] = 0b00010000;
    this.memory[17] = 0b11110000;
    this.memory[18] = 0b00010000;
    this.memory[19] = 0b11110000;

    this.memory[20] = 0b10010000;
    this.memory[21] = 0b10010000;
    this.memory[22] = 0b11110000;
    this.memory[23] = 0b00010000;
    this.memory[24] = 0b00010000;

    this.memory[25] = 0b11110000;
    this.memory[26] = 0b10000000;
    this.memory[27] = 0b11110000;
    this.memory[28] = 0b00010000;
    this.memory[29] = 0b11110000;

    this.memory[30] = 0b11110000;
    this.memory[31] = 0b10000000;
    this.memory[32] = 0b11110000;
    this.memory[33] = 0b10010000;
    this.memory[34] = 0b11110000;

    this.memory[35] = 0b11110000;
    this.memory[36] = 0b00010000;
    this.memory[37] = 0b00100000;
    this.memory[38] = 0b01000000;
    this.memory[39] = 0b01000000;

    this.memory[40] = 0b11110000;
    this.memory[41] = 0b10010000;
    this.memory[42] = 0b11110000;
    this.memory[43] = 0b10010000;
    this.memory[44] = 0b11110000;

    this.memory[45] = 0b11110000;
    this.memory[46] = 0b10010000;
    this.memory[47] = 0b11110000;
    this.memory[48] = 0b00010000;
    this.memory[49] = 0b11110000;

    this.memory[50] = 0b11110000;
    this.memory[51] = 0b10010000;
    this.memory[52] = 0b11110000;
    this.memory[53] = 0b10010000;
    this.memory[54] = 0b10010000;

    this.memory[55] = 0b11100000;
    this.memory[56] = 0b10010000;
    this.memory[57] = 0b11100000;
    this.memory[58] = 0b10010000;
    this.memory[59] = 0b11100000;

    this.memory[60] = 0b11110000;
    this.memory[61] = 0b10000000;
    this.memory[62] = 0b10000000;
    this.memory[63] = 0b10000000;
    this.memory[64] = 0b11110000;

    this.memory[65] = 0b11100000;
    this.memory[66] = 0b10010000;
    this.memory[67] = 0b10010000;
    this.memory[68] = 0b10010000;
    this.memory[69] = 0b11100000;

    this.memory[70] = 0b11110000;
    this.memory[71] = 0b10000000;
    this.memory[72] = 0b11110000;
    this.memory[73] = 0b10000000;
    this.memory[74] = 0b11110000;

    this.memory[75] = 0b11110000;
    this.memory[76] = 0b10000000;
    this.memory[77] = 0b11110000;
    this.memory[78] = 0b10000000;
    this.memory[79] = 0b10000000;
  }


  // more detail instruction from site below
  // http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
  instructions(instruction) {
    if (instruction == 0x00e0) {
      // clears display
      for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 64; j++) {
          this.framebuffer[i][j] = 0;
        }
      }
    }

    if (instruction == 0x00ee) {
      this.PC = this.stack[this.SP];
      this.SP -= 1;
    }

    if (instruction & 0x1000) {
      let nnn = instruction & 0x0111;

      this.PC = nnn;
    }

    if (instruction & 0x2000) {
      this.SP += 1;
      this.stack[this.SP] = this.PC;

      let nnn = instruction & 0x0111;
      this.PC = nnn;
    }
    
	if(instruction & 0x3000){
	  let x = (instruction & 0x0100) >> 8;
	  let kk = instruction & 0x0011;
	  
	  if(this.V[x] == kk) {
		this.PC += 2;
	  }
    }
	
	if(instruction & 0x4000){
	  let x = (instruction & 0x0100) >> 8;
	  let kk = instruction & 0x0011;
	  
	  if(this.V[x] != kk) {
		this.PC += 2;
	  }
    }
	
	if(instruction & 0x5000){
	  let x = (instruction & 0x0100) >> 8;
	  let y = (instruction & 0x0010) >> 4;
	  
	  if(this.V[x] == this.V[y]) {
		this.PC += 2;
	  }
    }

	if(instruction & 0x6000){
	  let x = (instruction & 0x0100) >> 8;
	  let kk = instruction & 0x0011;
	  
	  this.V[x] = kk;
    }

	if(instruction & 0x7000){
	  let x = (instruction & 0x0100) >> 8;
	  let kk = instruction & 0x0011;
	
	  this.V[x] = this.[x] + kk;
    }
  }
}

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
function setPixel(row, col, scale, data) {
  let index = 4 * scale * (row * canvasWidth + col);
  let adjustValue = (canvasWidth - scale) * 4;

  for (let i = 0; i < scale; i++) {
    for (let j = 0; j < scale; j++) {
      data[index] = 128;
      data[index + 1] = 128;
      data[index + 2] = 128;
      index += 4;
    }
    index += adjustValue;
  }
}

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

function soundTest() {
  // one context per document
  var context = new (window.AudioContext || window.webkitAudioContext)();
  var osc = context.createOscillator(); // instantiate an oscillator
  osc.type = "sine"; // this is the default - also square, sawtooth, triangle
  osc.frequency.value = 440; // Hz
  osc.connect(context.destination); // connect it to the destination
  osc.start(); // start the oscillator
  osc.stop(context.currentTime + 0.2); // stop 2 seconds after the current time
}

function main() {
  chipEight.spriteSetup();
  chipEight.instructions(0x3100);
}

main();
