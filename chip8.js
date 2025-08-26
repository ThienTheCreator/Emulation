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
    this.hasDisplayUpdate = false;

    this.key = "";

    this.spriteSetup();

    this.SP[0] = -1;
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
    if (opcode == 0x00e0) {
      // 00E0 - CLS
      // clears display

      for (let i = 0; i < 64 * 32; i++) {
        this.framebuffer[i] = false;
		this.hasDisplayUpdate = true;
      }
    } else if (opcode == 0x00ee) {
      // 00EE - RET
      // return from subroutine

      this.PC[0] = this.stack[this.SP[0]];
      this.SP[0] -= 1;
    } else if ((opcode & 0xf000) == 0x1000) {
      // 1nnn - JP addr
      // jump to nnn address

      let nnn = opcode & 0x0fff;

      this.PC[0] = nnn - 2;
    } else if ((opcode & 0xf000) == 0x2000) {
      // 2nnn - CALL addr
      // call subroutine at nnn

      this.SP[0] += 1;
      this.stack[this.SP[0]] = this.PC[0];

      let nnn = opcode & 0x0fff;
      this.PC[0] = nnn - 2;
    } else if ((opcode & 0xf000) == 0x3000) {
      // 3xkk - SE Vx, byte
      // skip if Vx equals kk

      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      if (this.V[x] == kk) {
        this.PC[0] += 2;
      }
    } else if ((opcode & 0xf000) == 0x4000) {
      // 4xkk - SNE Vx, byte
      // skip if Vx not equal kk

      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      if (this.V[x] != kk) {
        this.PC[0] += 2;
      }
    } else if ((opcode & 0xf00f) == 0x5000) {
      // 5xy0 - SE Vx, Vy
      // skip if Vx equal Vy

      let x = (opcode & 0x0f00) >> 8;
      let y = (opcode & 0x00f0) >> 4;

      if (this.V[x] == this.V[y]) {
        this.PC[0] += 2;
      }
    } else if ((opcode & 0xf000) == 0x6000) {
      // 6xkk - LD Vx, byte
      // set Vx = kk

      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      this.V[x] = kk;
    } else if ((opcode & 0xf000) == 0x7000) {
      // 7xkk - ADD Vx, byte
      // Set Vx = Vx + kk

      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      this.V[x] = this.V[x] + kk;
    } else if ((opcode & 0xf000) == 0x8000) {
      let x = (opcode & 0x0f00) >> 8;
      let y = (opcode & 0x00f0) >> 4;
      let fourthVal = opcode & 0x000f;

      if (fourthVal == 0x0) {
        // 8xy0 - LD Vx, Vy
        // Set Vx = Vy

        this.V[x] = this.V[y];
      } else if (fourthVal == 0x1) {
        // 8xy1 - OR Vx, Vy
        // Set Vx = Vx OR Vy

        this.V[x] = this.V[x] | this.V[y];
      } else if (fourthVal == 0x2) {
        // 8xy2 - AND Vx, Vy
        // Set Vx = Vx AND Vy

        this.V[x] = this.V[x] & this.V[y];
      } else if (fourthVal == 0x3) {
        // 8xy3 - XOR Vx, Vy
        // Set Vx = Vx XOR Vy

        this.V[x] = this.V[x] ^ this.V[y];
      } else if (fourthVal == 0x4) {
        // 8xy4 - ADD Vx, Vy
        // Set Vx = Vx + Vy, set VF = carry

        if (this.V[x] + this.V[y] > 255) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = this.V[x] + this.V[y];
      } else if (fourthVal == 0x5) {
        // 8xy5 - SUB Vx, Vy
        // Set Vx = Vx - Vy, set VF = NOT borrow

        if (this.V[x] >= this.V[y]) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = this.V[x] - this.V[y];
      } else if (fourthVal == 0x6) {
        // 8xy6 - SHR Vx {, Vy}
        // Vx = Vx / 2, set VF if odd or last bit is 1

        if (this.V[x] & 1) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = this.V[x] >> 1;
      } else if (fourthVal == 0x7) {
        // 8xy7 - SUBN Vx, Vy
        // Set Vx = Vy - Vx, set VF = NOT borrow

        if (this.V[y] >= this.V[x]) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = this.V[y] - this.V[x];
      } else if (fourthVal == 0xe) {
        // 8xyE - SHL Vx {, Vy}
        // Vx = Vx * 2, set VF if first bit, highest value, is 1

        if (this.V[x] >> 7) {
          this.V[15] = 1;
        } else {
          this.V[15] = 0;
        }

        this.V[x] = (this.V[x] << 1) & 0xffff;
      }
    } else if ((opcode & 0xf00f) == 0x9000) {
      // 9xy0 - SNE Vx, Vy
      // skip if Vx not equal Vy

      let x = (opcode & 0x0f00) >> 8;
      let y = (opcode & 0x00f0) >> 4;

      if (this.V[x] != this.V[y]) {
        this.PC[0] += 2;
      }
    } else if ((opcode & 0xf000) == 0xa000) {
      // Annn - LD I, addr
      // Set I = nnn

      let nnn = opcode & 0x0fff;

      this.I[0] = nnn;
    } else if ((opcode & 0xf000) == 0xb000) {
      // Bnnn - JP V0, addr
      // Jump to address nnn + V0

      let nnn = opcode & 0x0fff;

      this.PC[0] = nnn + this.V[0] - 2;
    } else if ((opcode & 0xf000) == 0xc000) {
      // Cxkk - RND Vx, byte
      // Set Vx = random byte AND kk

      let x = (opcode & 0x0f00) >> 8;
      let kk = opcode & 0x00ff;

      this.V[x] = Math.floor(Math.random() * 256) & kk;
    } else if ((opcode & 0xf000) == 0xd000) {
      // Dxyn - DRW Vx, Vy, nibble
      // Display n-byte sprite starting at (Vx, Vy), set VF = collision

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
          
		  if (
            tempPixel == true &&
            this.framebuffer[tempRow * 64 + tempCol] == 0
          ) {
            this.V[15] = 1;
          }
        }
      }

      this.hasDisplayUpdate = true;
	
    } else if ((opcode & 0xf0ff) == 0xe09e) {
      // Ex9E - SKP Vx
      // skip if key press is Vx

      let x = (opcode & 0x0f00) >> 8;

      if (this.V[x] == this.key) {
        chipEight.PC[0] += 2;
      }
    } else if ((opcode & 0xf0ff) == 0xe0a1) {
      // ExA1 - SKNP Vx
      // skip if key press is not Vx

      let x = (opcode & 0x0f00) >> 8;

      if (this.V[x] != this.key) {
        chipEight.PC[0] += 2;
      }
    } else if ((opcode & 0xf0ff) == 0xf007) {
      // Fx07 - LD Vx, DT
      // Set Vx = delay timer

      let x = (opcode & 0x0f00) >> 8;

      this.V[x] = this.delay_reg[0];
    } else if ((opcode & 0xf0ff) == 0xf00a) {
      // Fx0A - LD Vx, K
      // Wait for key press

      let x = (opcode & 0x0f00) >> 8;

      if (this.key) {
        this.V[x] = this.key;
      } else {
        this.PC[0] -= 2;
      }
    } else if ((opcode & 0xf0ff) == 0xf015) {
      // Fx15 - LD DT, Vx
      // Set delay timer = Vx

      let x = (opcode & 0x0f00) >> 8;

      this.delay_reg[0] = this.V[x];
    } else if ((opcode & 0xf0ff) == 0xf018) {
      // Fx18 - LD ST, Vx
      // Set sound timer = Vx

      let x = (opcode & 0x0f00) >> 8;

      this.sound_reg[0] = this.V[x];
    } else if ((opcode & 0xf0ff) == 0xf01e) {
      // Fx1E - ADD I, Vx
      // Set I = I + Vx

      let x = (opcode & 0x0f00) >> 8;

      this.I[0] = this.I[0] + this.V[x];
    } else if ((opcode & 0xf0ff) == 0xf029) {
      // Fx29 - LD F, Vx
      // Set I = location of sprite digit Vx

      let x = (opcode & 0x0f00) >> 8;

      this.I[0] = this.V[x] * 5;
    } else if ((opcode & 0xf0ff) == 0xf033) {
      // Fx33 - LD B, Vx
      // Store BCD of Vx in memory at I, I+1, I+2

      let x = (opcode & 0x0f00) >> 8;

      this.memory[this.I[0]] = Math.floor(this.V[x] / 100) % 10;
      this.memory[this.I[0] + 1] = Math.floor(this.V[x] / 10) % 10;
      this.memory[this.I[0] + 2] = this.V[x] % 10;
    } else if ((opcode & 0xf0ff) == 0xf055) {
      // Fx55 - LD [I], Vx
      // Store registers V0 through Vx in memory at I

      let x = (opcode & 0x0f00) >> 8;

      for (let i = 0; i <= x; i++) {
        this.memory[this.I[0] + i] = this.V[i];
      }
    } else if ((opcode & 0xf0ff) == 0xf065) {
      // Fx65 - LD Vx, [I]
      // Read registers V0 through Vx from memory at I

      let x = (opcode & 0x0f00) >> 8;

      for (let i = 0; i <= x; i++) {
        this.V[i] = this.memory[this.I[0] + i];
      }
    }

    this.PC[0] += 2;
  }
}
