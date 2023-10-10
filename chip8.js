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

    this.key = "";

    this.spriteSetup();

    this.SP[0] = 0;
    this.prevTime = 0;
	this.hasSound = false;  
    this.soundPlayed = false;
	this.continueStep = true;
	this.hasExited = false;
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

  getOpcode() {
    let opcode = new Uint16Array(1);
    let i = chipEight.PC[0];
    
    opcode[0] = (chipEight.memory[i] << 8) + chipEight.memory[i + 1];

    return opcode[0];
  }

  // more detail opcode from site below
  // http://devernay.free.fr/hacks/chip8/C8TECH10.HTM
  // VF is V[15]
  executeOpcode(opcode) {
	this.continueStep = true;

    // clears display
    if (opcode == 0x00e0) {
      for (let i = 0; i < 64 * 32; i++) {
        this.framebuffer[i] = false;
      }
    }

    if (opcode == 0x00ee) {
      this.PC[0] = this.stack[this.SP[0]];
      this.SP[0] -= 1;
    }

    if ((opcode & 0xf000) == 0x1000) {
      let nnn = opcode & 0x0fff;

      this.PC[0] = nnn;
	  this.continueStep = false;
    }

    if ((opcode & 0xf000) == 0x2000) {
      this.SP[0] += 1;
      this.stack[this.SP[0]] = this.PC[0];

      let nnn = opcode & 0x0fff;
      this.PC[0] = nnn;
	  this.continueStep = false;
    }

    if ((opcode & 0xf000) == 0x3000) {
      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      if (this.V[x] == kk) {
        this.PC[0] += 2;
      }
    }

    if ((opcode & 0xf000) == 0x4000) {
      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      if (this.V[x] != kk) {
        this.PC[0] += 2;
      }
    }

    if ((opcode & 0xf00f) == 0x5000) {
      let x = (opcode & 0x0f00) >> 8;
      let y = (opcode & 0x00f0) >> 4;

      if (this.V[x] == this.V[y]) {
        this.PC[0] += 2;
      }
    }

    if ((opcode & 0xf000) == 0x6000) {
      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      this.V[x] = kk;
    }

    if ((opcode & 0xf000) == 0x7000) {
      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

	  if(this.V[x] + kk > 255){
		this.V[x] = this.V[x] + kk - 256;
	  } else {
        this.V[x] = this.V[x] + kk;
	  }
    }

    if ((opcode & 0xf000) == 0x8000) {
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
          this.V[x] = this.V[x] + this.V[y] - 256;
        } else {
          this.V[15] = 0;
          this.V[x] = this.V[x] + this.V[y];
        }
      }

      if (fourthVal == 0x5) {
        if (this.V[x] >= this.V[y]) {
          this.V[15] = 1;
		  this.V[x] = this.V[x] - this.V[y];
        } else {
          this.V[15] = 0;
		  this.V[x] = this.V[x] - this.V[y] + 256;
        }
      }

      if (fourthVal == 0x6) {
        if (this.V[x] & 1) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = this.V[x] >> 1;
      }

      if (fourthVal == 0x7) {
        if (this.V[y] >= this.V[x]) {
          this.V[15] = 1;
          this.V[x] = this.V[y] - this.V[x];
        } else {
          this.V[15] = 0;
		  this.V[x] = this.V[y] - this.V[x] + 256; 
        }
      }

      if (fourthVal == 0xe) {
        if (this.V[x] >> 7) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = (this.V[x] << 1) & 0xffff;
      }
    }

    if ((opcode & 0xf00f) == 0x9000) {
      let x = (opcode & 0x0f00) >> 8;
      let y = (opcode & 0x00f0) >> 4;

      if (this.V[x] != this.V[y]) {
        this.PC[0] += 2;
      }
    }

    if ((opcode & 0xf000) == 0xa000) {
      let nnn = opcode & 0x0fff;

      this.I[0] = nnn;
    }

    if ((opcode & 0xf000) == 0xb000) {
      let nnn = opcode & 0x0fff;

      this.PC[0] = nnn + this.V[0];
	  this.continueStep = false;
    }

    if ((opcode & 0xf000) == 0xc000) {
      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      this.V[x] = Math.floor(Math.random() * 256) & kk;
    }

    if ((opcode & 0xf000) == 0xd000) {
      let x = (opcode & 0x0f00) >> 8;
      let y = (opcode & 0x00f0) >> 4;
      let n = opcode & 0x000f;

      let col = this.V[x];
      let row = this.V[y];

      this.V[15] = 0;
      for (let i = 0; i < n; i++) {
        let byte = this.memory[this.I[0] + i];
        for (let j = 0; j < 8; j++) {
          let bit = (byte & (1 << (7 - j))) >> (7 - j);

          let tempRow = (row + i) % 32;
          let tempCol = (col + j) % 64;

		  let tempPixel = this.framebuffer[tempRow * 64 + tempCol];
          this.framebuffer[tempRow * 64 + tempCol] ^= bit;
          if (tempPixel == true && this.framebuffer[tempRow * 64 + tempCol] == 0) {
            this.V[15] = 1;
          }
        }
      }
    }

    if ((opcode & 0xf0ff) == 0xe09e) {
      let x = (opcode & 0x0f00) >> 8;

      if (this.V[x] == this.key) {
        chipEight.PC[0] += 2;
      }
    }

    if ((opcode & 0xf0ff) == 0xe0a1) {
      let x = (opcode & 0x0f00) >> 8;

      if (this.V[x] != this.key) {
        chipEight.PC[0] += 2;
      }
    }

    if ((opcode & 0xf0ff) == 0xf007) {
      let x = (opcode & 0x0f00) >> 8;

      this.V[x] = this.delay_reg[0];
    }

    if ((opcode & 0xf0ff) == 0xf00a) {
      let x = (opcode & 0x0f00) >> 8;
      
	  if(this.key){		
		this.V[x] = this.key;
	  }else{
        this.continueStep = false;
	  }
    }

    if ((opcode & 0xf0ff) == 0xf015) {
      let x = (opcode & 0x0f00) >> 8;

      this.delay_reg[0] = this.V[x];
    }

    if ((opcode & 0xf0ff) == 0xf018) {
      let x = (opcode & 0x0f00) >> 8;

      this.sound_reg[0] = this.V[x];
    }

    if ((opcode & 0xf0ff) == 0xf01e) {
      let x = (opcode & 0x0f00) >> 8;

      this.I[0] = this.I[0] + this.V[x];
    }

    if ((opcode & 0xf0ff) == 0xf029) {
      let x = (opcode & 0x0f00) >> 8;
      this.I[0] = this.V[x] * 5;
    }

    if ((opcode & 0xf0ff) == 0xf033) {
      let x = (opcode & 0x0f00) >> 8;

      this.memory[this.I[0]] = Math.floor(this.V[x] / 100) % 10;
      this.memory[this.I[0] + 1] = Math.floor(this.V[x] / 10) % 10;
      this.memory[this.I[0] + 2] = this.V[x] % 10;
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
}
