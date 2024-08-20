#include <stdio.h>

int main(void) {
	char fonts[][8] = {
		{ 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00},   // empty
		{ 0x00, 0x00, 0x00, 0x00, 0x00, 0x0C, 0x0C, 0x00},   // U+002E (.)
		{ 0x00, 0x0C, 0x0C, 0x00, 0x00, 0x0C, 0x0C, 0x06},   // U+003B (;)
		{ 0x00, 0x00, 0x1E, 0x33, 0x03, 0x33, 0x1E, 0x00},   // U+0063 (c)
		{ 0x00, 0x00, 0x1E, 0x33, 0x33, 0x33, 0x1E, 0x00},   // U+006F (o)
		{ 0x3C, 0x66, 0x03, 0x03, 0x03, 0x66, 0x3C, 0x00},   // U+0043 (C)
		{ 0x3F, 0x66, 0x66, 0x3E, 0x06, 0x06, 0x0F, 0x00},   // U+0050 (P)
		{ 0x1C, 0x36, 0x63, 0x63, 0x63, 0x36, 0x1C, 0x00},   // U+004F (O)
		{ 0x1E, 0x33, 0x30, 0x18, 0x0C, 0x00, 0x0C, 0x00},   // U+003F (?)
		{ 0x3E, 0x63, 0x7B, 0x7B, 0x7B, 0x03, 0x1E, 0x00},   // U+0040 (@)
		{ 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff}   // full
	};

	printf("P3\n%d %d\n255\n", 8*10, 8);
	for (int y = 0; y < 8; y++) {
		for (int i = 0; i < 10; i++) {
			for (int x = 0; x < 8; x++) {
				if (fonts[i][y] >> x & 1) {
					printf("255 255 255 ");
				} else {
					printf("0 0 0 ");
				}
			}
			printf("\n");
		}
	}
	return 0;
}
