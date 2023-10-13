# Chip 8
I wanted to code an emulator and chip 8 was a project to start with. I use JavaScript as the programing lanuage because the emulation did not seem to need a lot of resources. I included two roms which are PONG and TETRIS. 

## The main guide:
http://devernay.free.fr/hacks/chip8/C8TECH10.HTM

## Specifications
4KB (4,096 bytes) memory
16 8-bit general purpose registers
16-bit program counter
8-bit stack counter
16 16-bit stack 
One tone sound
hex input keyboard
64 by 32 pixel display

## Implementations Details
There were a few logic error in the code which took some time to fix after going through the code a few times. The emulator feels slow maybe due to its design combined with have been written in JavaScript. If I were to code another emulator maybe use another language like C. Had to use Uint8Array and Uint16Array in JavaScript to get 8-bit and 16-bit values. 
