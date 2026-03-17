export interface HoleData {
  hole_number: number
  par: number
  tees: {
    gold: number    // championship (back)
    blue: number    // men's
    white: number   // middle
    red: number     // forward/women's
  }
}

export interface LandingsCourse {
  name: string
  location: string
  holes: HoleData[]
}

// NOTE: Gold tee yardages are confirmed. Blue/White/Red are placeholders —
// replace with real scorecard values when available.
export const LANDINGS_COURSES: LandingsCourse[] = [
  {
    name: 'Palmetto',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { gold: 394, blue: 370, white: 345, red: 310 } },
      { hole_number: 2,  par: 5, tees: { gold: 535, blue: 510, white: 480, red: 440 } },
      { hole_number: 3,  par: 3, tees: { gold: 203, blue: 185, white: 165, red: 140 } },
      { hole_number: 4,  par: 4, tees: { gold: 485, blue: 455, white: 425, red: 380 } },
      { hole_number: 5,  par: 3, tees: { gold: 198, blue: 180, white: 160, red: 135 } },
      { hole_number: 6,  par: 4, tees: { gold: 453, blue: 425, white: 395, red: 355 } },
      { hole_number: 7,  par: 5, tees: { gold: 531, blue: 505, white: 475, red: 435 } },
      { hole_number: 8,  par: 4, tees: { gold: 343, blue: 320, white: 298, red: 265 } },
      { hole_number: 9,  par: 4, tees: { gold: 406, blue: 380, white: 355, red: 315 } },
      { hole_number: 10, par: 5, tees: { gold: 530, blue: 505, white: 475, red: 435 } },
      { hole_number: 11, par: 4, tees: { gold: 412, blue: 385, white: 360, red: 320 } },
      { hole_number: 12, par: 3, tees: { gold: 187, blue: 170, white: 150, red: 125 } },
      { hole_number: 13, par: 4, tees: { gold: 392, blue: 368, white: 343, red: 305 } },
      { hole_number: 14, par: 5, tees: { gold: 495, blue: 470, white: 440, red: 400 } },
      { hole_number: 15, par: 3, tees: { gold: 165, blue: 148, white: 130, red: 108 } },
      { hole_number: 16, par: 4, tees: { gold: 456, blue: 428, white: 398, red: 358 } },
      { hole_number: 17, par: 4, tees: { gold: 434, blue: 408, white: 380, red: 340 } },
      { hole_number: 18, par: 4, tees: { gold: 426, blue: 400, white: 373, red: 333 } },
    ],
  },
  {
    name: 'Marshwood',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { gold: 431, blue: 405, white: 378, red: 338 } },
      { hole_number: 2,  par: 5, tees: { gold: 551, blue: 523, white: 492, red: 450 } },
      { hole_number: 3,  par: 4, tees: { gold: 395, blue: 370, white: 345, red: 308 } },
      { hole_number: 4,  par: 3, tees: { gold: 203, blue: 185, white: 165, red: 140 } },
      { hole_number: 5,  par: 5, tees: { gold: 567, blue: 538, white: 506, red: 463 } },
      { hole_number: 6,  par: 4, tees: { gold: 346, blue: 323, white: 300, red: 268 } },
      { hole_number: 7,  par: 4, tees: { gold: 384, blue: 360, white: 336, red: 300 } },
      { hole_number: 8,  par: 3, tees: { gold: 209, blue: 190, white: 170, red: 145 } },
      { hole_number: 9,  par: 4, tees: { gold: 449, blue: 421, white: 393, red: 352 } },
      { hole_number: 10, par: 4, tees: { gold: 425, blue: 398, white: 371, red: 332 } },
      { hole_number: 11, par: 4, tees: { gold: 451, blue: 423, white: 395, red: 354 } },
      { hole_number: 12, par: 3, tees: { gold: 177, blue: 160, white: 142, red: 118 } },
      { hole_number: 13, par: 5, tees: { gold: 504, blue: 478, white: 448, red: 408 } },
      { hole_number: 14, par: 4, tees: { gold: 383, blue: 359, white: 335, red: 298 } },
      { hole_number: 15, par: 5, tees: { gold: 521, blue: 495, white: 465, red: 425 } },
      { hole_number: 16, par: 3, tees: { gold: 163, blue: 147, white: 130, red: 108 } },
      { hole_number: 17, par: 4, tees: { gold: 334, blue: 313, white: 292, red: 260 } },
      { hole_number: 18, par: 4, tees: { gold: 411, blue: 386, white: 360, red: 321 } },
    ],
  },
  {
    name: 'Magnolia',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { gold: 344, blue: 322, white: 300, red: 268 } },
      { hole_number: 2,  par: 5, tees: { gold: 561, blue: 533, white: 500, red: 458 } },
      { hole_number: 3,  par: 3, tees: { gold: 154, blue: 138, white: 122, red: 100 } },
      { hole_number: 4,  par: 4, tees: { gold: 405, blue: 380, white: 354, red: 316 } },
      { hole_number: 5,  par: 4, tees: { gold: 381, blue: 357, white: 333, red: 297 } },
      { hole_number: 6,  par: 5, tees: { gold: 486, blue: 461, white: 433, red: 395 } },
      { hole_number: 7,  par: 4, tees: { gold: 399, blue: 374, white: 349, red: 311 } },
      { hole_number: 8,  par: 3, tees: { gold: 185, blue: 168, white: 149, red: 124 } },
      { hole_number: 9,  par: 4, tees: { gold: 433, blue: 406, white: 379, red: 339 } },
      { hole_number: 10, par: 4, tees: { gold: 395, blue: 370, white: 345, red: 308 } },
      { hole_number: 11, par: 5, tees: { gold: 555, blue: 527, white: 495, red: 453 } },
      { hole_number: 12, par: 4, tees: { gold: 439, blue: 412, white: 384, red: 344 } },
      { hole_number: 13, par: 4, tees: { gold: 423, blue: 397, white: 370, red: 331 } },
      { hole_number: 14, par: 3, tees: { gold: 172, blue: 155, white: 138, red: 114 } },
      { hole_number: 15, par: 4, tees: { gold: 382, blue: 358, white: 334, red: 298 } },
      { hole_number: 16, par: 5, tees: { gold: 544, blue: 516, white: 485, red: 443 } },
      { hole_number: 17, par: 3, tees: { gold: 219, blue: 199, white: 177, red: 150 } },
      { hole_number: 18, par: 4, tees: { gold: 418, blue: 392, white: 365, red: 326 } },
    ],
  },
  {
    name: 'Deer Creek',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { gold: 396, blue: 371, white: 346, red: 309 } },
      { hole_number: 2,  par: 3, tees: { gold: 189, blue: 171, white: 152, red: 127 } },
      { hole_number: 3,  par: 5, tees: { gold: 551, blue: 523, white: 491, red: 449 } },
      { hole_number: 4,  par: 4, tees: { gold: 385, blue: 361, white: 337, red: 301 } },
      { hole_number: 5,  par: 4, tees: { gold: 320, blue: 300, white: 280, red: 250 } },
      { hole_number: 6,  par: 5, tees: { gold: 580, blue: 550, white: 517, red: 473 } },
      { hole_number: 7,  par: 4, tees: { gold: 396, blue: 371, white: 346, red: 309 } },
      { hole_number: 8,  par: 3, tees: { gold: 201, blue: 183, white: 162, red: 136 } },
      { hole_number: 9,  par: 4, tees: { gold: 480, blue: 450, white: 420, red: 376 } },
      { hole_number: 10, par: 4, tees: { gold: 449, blue: 421, white: 393, red: 352 } },
      { hole_number: 11, par: 4, tees: { gold: 388, blue: 364, white: 339, red: 303 } },
      { hole_number: 12, par: 3, tees: { gold: 188, blue: 170, white: 151, red: 126 } },
      { hole_number: 13, par: 4, tees: { gold: 443, blue: 415, white: 387, red: 347 } },
      { hole_number: 14, par: 5, tees: { gold: 582, blue: 552, white: 519, red: 475 } },
      { hole_number: 15, par: 4, tees: { gold: 442, blue: 414, white: 386, red: 346 } },
      { hole_number: 16, par: 4, tees: { gold: 405, blue: 380, white: 354, red: 316 } },
      { hole_number: 17, par: 3, tees: { gold: 197, blue: 179, white: 159, red: 133 } },
      { hole_number: 18, par: 5, tees: { gold: 593, blue: 562, white: 528, red: 483 } },
    ],
  },
  {
    name: 'Terrapin',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { gold: 425, blue: 398, white: 371, red: 332 } },
      { hole_number: 2,  par: 4, tees: { gold: 403, blue: 378, white: 352, red: 315 } },
      { hole_number: 3,  par: 3, tees: { gold: 149, blue: 134, white: 119, red: 98  } },
      { hole_number: 4,  par: 4, tees: { gold: 405, blue: 380, white: 354, red: 316 } },
      { hole_number: 5,  par: 5, tees: { gold: 518, blue: 491, white: 461, red: 421 } },
      { hole_number: 6,  par: 4, tees: { gold: 409, blue: 384, white: 358, red: 320 } },
      { hole_number: 7,  par: 4, tees: { gold: 406, blue: 381, white: 355, red: 317 } },
      { hole_number: 8,  par: 3, tees: { gold: 192, blue: 174, white: 155, red: 129 } },
      { hole_number: 9,  par: 5, tees: { gold: 504, blue: 478, white: 449, red: 410 } },
      { hole_number: 10, par: 4, tees: { gold: 345, blue: 323, white: 301, red: 269 } },
      { hole_number: 11, par: 4, tees: { gold: 394, blue: 369, white: 344, red: 307 } },
      { hole_number: 12, par: 3, tees: { gold: 200, blue: 182, white: 161, red: 135 } },
      { hole_number: 13, par: 4, tees: { gold: 452, blue: 424, white: 395, red: 354 } },
      { hole_number: 14, par: 5, tees: { gold: 547, blue: 519, white: 488, red: 446 } },
      { hole_number: 15, par: 4, tees: { gold: 381, blue: 357, white: 333, red: 297 } },
      { hole_number: 16, par: 4, tees: { gold: 411, blue: 386, white: 360, red: 321 } },
      { hole_number: 17, par: 3, tees: { gold: 184, blue: 167, white: 148, red: 123 } },
      { hole_number: 18, par: 5, tees: { gold: 512, blue: 486, white: 456, red: 417 } },
    ],
  },
  {
    name: 'Oakridge',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { gold: 415, blue: 389, white: 362, red: 324 } },
      { hole_number: 2,  par: 4, tees: { gold: 441, blue: 413, white: 385, red: 345 } },
      { hole_number: 3,  par: 3, tees: { gold: 186, blue: 169, white: 150, red: 125 } },
      { hole_number: 4,  par: 5, tees: { gold: 519, blue: 492, white: 462, red: 422 } },
      { hole_number: 5,  par: 3, tees: { gold: 200, blue: 182, white: 161, red: 135 } },
      { hole_number: 6,  par: 4, tees: { gold: 354, blue: 332, white: 309, red: 276 } },
      { hole_number: 7,  par: 5, tees: { gold: 501, blue: 475, white: 446, red: 407 } },
      { hole_number: 8,  par: 4, tees: { gold: 337, blue: 316, white: 294, red: 263 } },
      { hole_number: 9,  par: 4, tees: { gold: 378, blue: 354, white: 330, red: 295 } },
      { hole_number: 10, par: 4, tees: { gold: 435, blue: 408, white: 380, red: 340 } },
      { hole_number: 11, par: 4, tees: { gold: 406, blue: 381, white: 355, red: 317 } },
      { hole_number: 12, par: 3, tees: { gold: 176, blue: 160, white: 142, red: 118 } },
      { hole_number: 13, par: 5, tees: { gold: 505, blue: 479, white: 450, red: 411 } },
      { hole_number: 14, par: 4, tees: { gold: 338, blue: 317, white: 295, red: 264 } },
      { hole_number: 15, par: 5, tees: { gold: 476, blue: 452, white: 424, red: 387 } },
      { hole_number: 16, par: 3, tees: { gold: 140, blue: 126, white: 112, red: 92  } },
      { hole_number: 17, par: 4, tees: { gold: 405, blue: 380, white: 354, red: 316 } },
      { hole_number: 18, par: 4, tees: { gold: 391, blue: 367, white: 342, red: 306 } },
    ],
  },
]

export const TEE_OPTIONS = [
  { value: 'gold',  label: 'Gold',  color: '#C9A84C' },
  { value: 'blue',  label: 'Blue',  color: '#1B3A6B' },
  { value: 'white', label: 'White', color: '#9ca3af' },
  { value: 'red',   label: 'Red',   color: '#dc2626' },
] as const

export type TeeOption = typeof TEE_OPTIONS[number]['value']
