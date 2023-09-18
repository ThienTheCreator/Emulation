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
    this.sound_reg = new Uint8Array(1); // Sound timer

    this.framebuffer = Array(64 * 32).fill(false);

	this.spriteSetup();
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

  // more detail opcode from site below
  // http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
  // VF is V[15]
  instructions(opcode) {
	// clears display
    if (opcode == 0x00e0) {
      for (let i = 0; i < 64 * 32; i++) {
          this.framebuffer[i] = 0;
      }
    }

    if (opcode == 0x00ee) {
      this.PC = this.stack[this.SP];
      this.SP -= 1;
    }

    if (opcode >> 12 == 0x1) {
      let nnn = opcode & 0x0fff;

      this.PC = nnn;
    }

    if (opcode >> 12 == 0x2) {
      this.SP += 1;
      this.stack[this.SP] = this.PC;

      let nnn = opcode & 0x0fff;
      this.PC = nnn;
    }

    if (opcode >> 12 == 0x3) {
      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      if (this.V[x] == kk) {
        this.PC += 2;
      }
    }

    if (opcode >> 12 == 0x4) {
      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      if (this.V[x] != kk) {
        this.PC += 2;
      }
    }

    if (opcode >> 12 == 0x5) {
      let x = (opcode & 0x0f00) >> 8;
      let y = (opcode & 0x00f0) >> 4;

      if (this.V[x] == this.V[y]) {
        this.PC += 2;
      }
    }

    if (opcode >> 12 == 0x6) {
      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      this.V[x] = kk;
    }

    if (opcode >> 12 == 0x7) {
      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      this.V[x] = this.V[x] + kk;
    }

    if (opcode >> 12 == 0x8) {
      let x = (opcode & 0x0f00) >> 8;
      let y = (opcode & 0x00f0) >> 4;
      let fourthVal = opcode & 0x000f;

      if (fourthVal == 0x0) {
        this.V[x] = this.V[y];
      }

      if (fourthVal == 0x1) {
        this.V[x] = this.V[x] | this.V[y];
      }

      if (fourthVal == 0x2) {
        this.V[x] = this.V[x] & this.V[y];
      }

      if (fourthVal == 0x3) {
        this.V[x] = this.V[x] ^ this.V[y];
      }

      if (fourthVal == 0x4) {
        if (this.V[x] + this.V[y] > 255) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = this.V[x] + this.V[y];
      }

      if (fourthVal == 0x5) {
        if (this.V[x] > this.V[y]) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = this.V[x] - this.V[y];
      }

      if (fourthVal == 0x6) {
        if (this.V[x] & 1) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = this.V[x] / 2;
      }

      if (fourthVal == 0x7) {
        if (this.V[y] > this.V[x]) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = this.V[y] - this.V[x];
      }

      if (fourthVal == 0xe) {
        if (this.V[x] & 1) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = this.V[x] * 2;
      }
    }

    if ((opcode & 0xf00f) == 0x9000) {
      let x = (opcode & 0x0f00) >> 8;
      let y = (opcode & 0x00f0) >> 4;

      if (this.V[x] != this.V[y]) {
        this.PC += 2;
      }
    }

    if ((opcode & 0xf000) == 0xa000) {
      let nnn = opcode & 0x0fff;

      this.I[0] = nnn;
    }

    if ((opcode & 0xf000) == 0xb000) {
      let nnn = opcode & 0x0fff;

      this.PC[0] = nnn + this.V[0];
    }

    if ((opcode & 0xf000) == 0xc000) {
      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      this.V[x] = Math.floor(Math.random() * 256) + kk;
    }

    // TODO
    if ((opcode & 0xf000) == 0xd000) {
      let x = (opcode & 0x0f00) >> 8;
      let y = (opcode & 0x00f0) >> 4;
      let n = opcode & 0x000f;

	  let col = this.V[x];
	  let row = this.V[y];
		
	  this.V[15] = 0;
      for (let i = 0; i <= n; i++) {
		let byte = this.memory[this.I[0] + i];
		for(let j = 0; j < 8; j++){
			let bit = (byte & (1 << (7 - j))) >> (7 - j);
			
			let tempRow = (row + i) % 32;
			let tempCol = (col + j) % 64;

			this.framebuffer[tempRow * 64 + tempCol] ^= bit;
			if (bit != this.framebuffer[tempRow * 64 + tempCol]) {
				this.V[15] = 1;
			}
		}
	  }
    }

    // TODO
    if ((opcode & 0xf0ff) == 0xe09e) {
    }

    // TODO
    if ((opcode & 0xf0ff) == 0xe0a1) {
    }

    if ((opcode & 0xf0ff) == 0xf007) {
      let x = (opcode & 0x0f00) >> 8;

      this.V[x] = this.delay_reg[0];
    }

    // TODO
    if ((opcode & 0xf0ff) == 0xf00a) {
    }

    if ((opcode & 0xf0ff) == 0xf015) {
      let x = (opcode & 0x0f00) >> 8;

      this.delay_reg[0] = this.V[x];
    }

    if ((opcode & 0xf0ff) == 0xf018) {
      let x = (opcode & 0x0f00) >> 8;

      this.sound_reg = this.V[x];
    }

    if ((opcode & 0xf0ff) == 0xf01e) {
      let x = (opcode & 0x0f00) >> 8;

      this.I[0] += this.V[x];
    }

    // TODO
    if ((opcode & 0xf0ff) == 0xf029) {
      let x = (opcode & 0x0f00) >> 8;
    }

    if ((opcode & 0xf0ff) == 0xf033) {
      let x = (opcode & 0x0f00) >> 8;

      this.sound_reg = this.V[x];
    }

    if ((opcode & 0xf0ff) == 0xf055) {
      let x = (opcode & 0x0f00) >> 8;

      for (let i = 0; i <= x; i++) {
        this.memory[this.I[0] + i] = this.V[i];
      }
    }

    if ((opcode & 0xf0ff) == 0xf065) {
      let x = (opcode & 0x0f00) >> 8;

      for (let i = 0; i <= x; i++) {
        this.V[i] = this.memory[this.I[0] + i];
      }
    }
  }

  async loadPong() {
  	chipEight.spriteSetup();
	
	let response = await fetch('./PONG', {mode: 'no-cors'});
	let result = await response.arrayBuffer();
	let romData = new Uint8Array(result);
		console.log(romData.length)
	  for (let i = 0; i < romData.length; i++){
		this.memory[0x0200 + i] =  romData[i];
	  }

	console.log(this.memory)
  }
}

class CPU {
	
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
function setPixel(place, scale, colorValue) {
  let index = 4 * scale * (Math.floor(place / 64) * canvasWidth + place % 64);
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
	for(let i = 0; i < 64 * 32; i++) {
			if(chipEight.framebuffer[i]) {
				setPixel(i, 10, 128);	
			}else {
				setPixel(i, 10, 0);
			}
	}

	ctx.putImageData(imageData, 0, 0);
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

async function test() {
	for (let i = 0; i < 246; i += 2){
		let instruction = new Uint16Array(1);
		instruction[0] = chipEight.memory[0x200 + i] << 8 + chipEight.memory[0x200 + i + 1];
		console.log(instruction[0]);
		console.log(instruction[0].toString(16));

		chipEight.instructions(chipEight.memory[0x0200 + i] );
		updateDisplay();
		console.log("here")
		await wait(1000);
	}
}

function main() {
  chipEight.V[0] = 62;
  chipEight.V[1] = 0;
  chipEight.instructions(0xd014);
  updateDisplay();


  chipEight.loadPong();

  test();
}



main();
