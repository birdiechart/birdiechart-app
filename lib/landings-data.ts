export interface HoleData {
  hole_number: number
  par: number
  tees: {
    championship: number
    tournament: number
    club: number
    medal: number
  }
}

export interface LandingsCourse {
  name: string
  location: string
  holes: HoleData[]
}

export const TEE_OPTIONS = [
  { value: 'championship', label: 'Championship', color: '#111827' },
  { value: 'tournament',   label: 'Tournament',   color: '#1B3A6B' },
  { value: 'club',         label: 'Club',         color: '#6b7280' },
  { value: 'medal',        label: 'Medal',        color: '#b45309' },
] as const

export type TeeOption = typeof TEE_OPTIONS[number]['value']

// ─── CONFIRMED FROM 2024 SCORECARDS ────────────────────────────────────────
// Marshwood & Magnolia: placeholders — update when scorecards are received
// ───────────────────────────────────────────────────────────────────────────

export const LANDINGS_COURSES: LandingsCourse[] = [
  {
    name: 'Palmetto',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 394, tournament: 371, club: 340, medal: 310 } },
      { hole_number: 2,  par: 5, tees: { championship: 535, tournament: 507, club: 484, medal: 453 } },
      { hole_number: 3,  par: 3, tees: { championship: 203, tournament: 167, club: 159, medal: 145 } },
      { hole_number: 4,  par: 4, tees: { championship: 485, tournament: 449, club: 423, medal: 396 } },
      { hole_number: 5,  par: 3, tees: { championship: 198, tournament: 169, club: 156, medal: 138 } },
      { hole_number: 6,  par: 4, tees: { championship: 453, tournament: 410, club: 390, medal: 358 } },
      { hole_number: 7,  par: 5, tees: { championship: 531, tournament: 491, club: 457, medal: 449 } },
      { hole_number: 8,  par: 4, tees: { championship: 343, tournament: 323, club: 304, medal: 284 } },
      { hole_number: 9,  par: 4, tees: { championship: 406, tournament: 378, club: 365, medal: 332 } },
      { hole_number: 10, par: 5, tees: { championship: 530, tournament: 512, club: 495, medal: 449 } },
      { hole_number: 11, par: 4, tees: { championship: 412, tournament: 374, club: 343, medal: 325 } },
      { hole_number: 12, par: 3, tees: { championship: 187, tournament: 183, club: 156, medal: 144 } },
      { hole_number: 13, par: 4, tees: { championship: 392, tournament: 385, club: 362, medal: 334 } },
      { hole_number: 14, par: 5, tees: { championship: 495, tournament: 480, club: 427, medal: 406 } },
      { hole_number: 15, par: 3, tees: { championship: 165, tournament: 155, club: 138, medal: 127 } },
      { hole_number: 16, par: 4, tees: { championship: 456, tournament: 429, club: 394, medal: 344 } },
      { hole_number: 17, par: 4, tees: { championship: 434, tournament: 422, club: 392, medal: 355 } },
      { hole_number: 18, par: 4, tees: { championship: 426, tournament: 382, club: 367, medal: 341 } },
    ],
  },
  {
    name: 'Marshwood',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 431, tournament: 414, club: 383, medal: 369 } },
      { hole_number: 2,  par: 5, tees: { championship: 551, tournament: 522, club: 504, medal: 465 } },
      { hole_number: 3,  par: 4, tees: { championship: 395, tournament: 363, club: 327, medal: 319 } },
      { hole_number: 4,  par: 3, tees: { championship: 203, tournament: 183, club: 173, medal: 141 } },
      { hole_number: 5,  par: 5, tees: { championship: 567, tournament: 544, club: 519, medal: 477 } },
      { hole_number: 6,  par: 4, tees: { championship: 346, tournament: 339, club: 312, medal: 271 } },
      { hole_number: 7,  par: 4, tees: { championship: 384, tournament: 352, club: 337, medal: 333 } },
      { hole_number: 8,  par: 3, tees: { championship: 209, tournament: 187, club: 173, medal: 161 } },
      { hole_number: 9,  par: 4, tees: { championship: 449, tournament: 425, club: 393, medal: 360 } },
      { hole_number: 10, par: 4, tees: { championship: 425, tournament: 397, club: 367, medal: 340 } },
      { hole_number: 11, par: 4, tees: { championship: 451, tournament: 422, club: 387, medal: 361 } },
      { hole_number: 12, par: 3, tees: { championship: 177, tournament: 157, club: 139, medal: 123 } },
      { hole_number: 13, par: 5, tees: { championship: 504, tournament: 494, club: 482, medal: 421 } },
      { hole_number: 14, par: 4, tees: { championship: 383, tournament: 355, club: 345, medal: 307 } },
      { hole_number: 15, par: 5, tees: { championship: 521, tournament: 501, club: 483, medal: 471 } },
      { hole_number: 16, par: 3, tees: { championship: 163, tournament: 147, club: 133, medal: 115 } },
      { hole_number: 17, par: 4, tees: { championship: 334, tournament: 317, club: 301, medal: 282 } },
      { hole_number: 18, par: 4, tees: { championship: 411, tournament: 390, club: 367, medal: 346 } },
    ],
  },
  {
    name: 'Magnolia',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 344, tournament: 320, club: 298, medal: 276 } },
      { hole_number: 2,  par: 5, tees: { championship: 561, tournament: 524, club: 490, medal: 482 } },
      { hole_number: 3,  par: 3, tees: { championship: 154, tournament: 132, club: 125, medal: 118 } },
      { hole_number: 4,  par: 4, tees: { championship: 405, tournament: 384, club: 375, medal: 351 } },
      { hole_number: 5,  par: 4, tees: { championship: 381, tournament: 362, club: 353, medal: 327 } },
      { hole_number: 6,  par: 5, tees: { championship: 486, tournament: 481, club: 472, medal: 432 } },
      { hole_number: 7,  par: 4, tees: { championship: 399, tournament: 378, club: 368, medal: 344 } },
      { hole_number: 8,  par: 3, tees: { championship: 185, tournament: 176, club: 157, medal: 140 } },
      { hole_number: 9,  par: 4, tees: { championship: 433, tournament: 427, club: 408, medal: 343 } },
      { hole_number: 10, par: 4, tees: { championship: 395, tournament: 371, club: 362, medal: 341 } },
      { hole_number: 11, par: 5, tees: { championship: 555, tournament: 543, club: 501, medal: 486 } },
      { hole_number: 12, par: 4, tees: { championship: 439, tournament: 406, club: 368, medal: 330 } },
      { hole_number: 13, par: 4, tees: { championship: 423, tournament: 384, club: 374, medal: 323 } },
      { hole_number: 14, par: 3, tees: { championship: 172, tournament: 155, club: 146, medal: 130 } },
      { hole_number: 15, par: 4, tees: { championship: 382, tournament: 350, club: 335, medal: 290 } },
      { hole_number: 16, par: 5, tees: { championship: 544, tournament: 535, club: 509, medal: 490 } },
      { hole_number: 17, par: 3, tees: { championship: 219, tournament: 174, club: 165, medal: 134 } },
      { hole_number: 18, par: 4, tees: { championship: 418, tournament: 398, club: 368, medal: 358 } },
    ],
  },
  {
    name: 'Deer Creek',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 396, tournament: 383, club: 355, medal: 336 } },
      { hole_number: 2,  par: 3, tees: { championship: 189, tournament: 181, club: 160, medal: 132 } },
      { hole_number: 3,  par: 5, tees: { championship: 551, tournament: 525, club: 470, medal: 427 } },
      { hole_number: 4,  par: 4, tees: { championship: 385, tournament: 353, club: 320, medal: 307 } },
      { hole_number: 5,  par: 4, tees: { championship: 320, tournament: 284, club: 264, medal: 244 } },
      { hole_number: 6,  par: 5, tees: { championship: 580, tournament: 551, club: 508, medal: 475 } },
      { hole_number: 7,  par: 4, tees: { championship: 396, tournament: 368, club: 358, medal: 347 } },
      { hole_number: 8,  par: 3, tees: { championship: 201, tournament: 172, club: 152, medal: 126 } },
      { hole_number: 9,  par: 4, tees: { championship: 480, tournament: 408, club: 373, medal: 343 } },
      { hole_number: 10, par: 4, tees: { championship: 449, tournament: 386, club: 352, medal: 339 } },
      { hole_number: 11, par: 4, tees: { championship: 388, tournament: 355, club: 333, medal: 311 } },
      { hole_number: 12, par: 3, tees: { championship: 188, tournament: 158, club: 134, medal: 111 } },
      { hole_number: 13, par: 4, tees: { championship: 443, tournament: 411, club: 396, medal: 381 } },
      { hole_number: 14, par: 5, tees: { championship: 582, tournament: 479, club: 460, medal: 428 } },
      { hole_number: 15, par: 4, tees: { championship: 442, tournament: 406, club: 373, medal: 362 } },
      { hole_number: 16, par: 4, tees: { championship: 405, tournament: 363, club: 351, medal: 315 } },
      { hole_number: 17, par: 3, tees: { championship: 197, tournament: 187, club: 163, medal: 149 } },
      { hole_number: 18, par: 5, tees: { championship: 593, tournament: 544, club: 488, medal: 448 } },
    ],
  },
  {
    name: 'Terrapin',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 425, tournament: 387, club: 358, medal: 336 } },
      { hole_number: 2,  par: 4, tees: { championship: 403, tournament: 381, club: 346, medal: 321 } },
      { hole_number: 3,  par: 3, tees: { championship: 149, tournament: 143, club: 129, medal: 122 } },
      { hole_number: 4,  par: 4, tees: { championship: 405, tournament: 377, club: 352, medal: 331 } },
      { hole_number: 5,  par: 5, tees: { championship: 518, tournament: 511, club: 487, medal: 464 } },
      { hole_number: 6,  par: 4, tees: { championship: 409, tournament: 372, club: 349, medal: 328 } },
      { hole_number: 7,  par: 4, tees: { championship: 406, tournament: 377, club: 354, medal: 330 } },
      { hole_number: 8,  par: 3, tees: { championship: 192, tournament: 178, club: 163, medal: 154 } },
      { hole_number: 9,  par: 5, tees: { championship: 504, tournament: 496, club: 440, medal: 430 } },
      { hole_number: 10, par: 4, tees: { championship: 345, tournament: 330, club: 320, medal: 307 } },
      { hole_number: 11, par: 4, tees: { championship: 394, tournament: 363, club: 340, medal: 333 } },
      { hole_number: 12, par: 3, tees: { championship: 200, tournament: 183, club: 163, medal: 142 } },
      { hole_number: 13, par: 4, tees: { championship: 452, tournament: 419, club: 359, medal: 337 } },
      { hole_number: 14, par: 5, tees: { championship: 547, tournament: 533, club: 511, medal: 480 } },
      { hole_number: 15, par: 4, tees: { championship: 381, tournament: 355, club: 335, medal: 319 } },
      { hole_number: 16, par: 4, tees: { championship: 411, tournament: 378, club: 351, medal: 331 } },
      { hole_number: 17, par: 3, tees: { championship: 184, tournament: 158, club: 157, medal: 139 } },
      { hole_number: 18, par: 5, tees: { championship: 512, tournament: 496, club: 476, medal: 443 } },
    ],
  },
  {
    name: 'Oakridge',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 415, tournament: 395, club: 381, medal: 342 } },
      { hole_number: 2,  par: 4, tees: { championship: 441, tournament: 417, club: 404, medal: 376 } },
      { hole_number: 3,  par: 3, tees: { championship: 186, tournament: 169, club: 156, medal: 144 } },
      { hole_number: 4,  par: 5, tees: { championship: 519, tournament: 504, club: 482, medal: 459 } },
      { hole_number: 5,  par: 3, tees: { championship: 200, tournament: 162, club: 150, medal: 134 } },
      { hole_number: 6,  par: 4, tees: { championship: 354, tournament: 331, club: 311, medal: 283 } },
      { hole_number: 7,  par: 5, tees: { championship: 501, tournament: 476, club: 444, medal: 418 } },
      { hole_number: 8,  par: 4, tees: { championship: 337, tournament: 313, club: 289, medal: 256 } },
      { hole_number: 9,  par: 4, tees: { championship: 378, tournament: 355, club: 341, medal: 294 } },
      { hole_number: 10, par: 4, tees: { championship: 435, tournament: 417, club: 378, medal: 348 } },
      { hole_number: 11, par: 4, tees: { championship: 406, tournament: 387, club: 373, medal: 341 } },
      { hole_number: 12, par: 3, tees: { championship: 176, tournament: 155, club: 144, medal: 132 } },
      { hole_number: 13, par: 5, tees: { championship: 505, tournament: 473, club: 457, medal: 428 } },
      { hole_number: 14, par: 4, tees: { championship: 338, tournament: 325, club: 313, medal: 289 } },
      { hole_number: 15, par: 5, tees: { championship: 476, tournament: 465, club: 433, medal: 423 } },
      { hole_number: 16, par: 3, tees: { championship: 140, tournament: 124, club: 116, medal: 109 } },
      { hole_number: 17, par: 4, tees: { championship: 405, tournament: 384, club: 374, medal: 283 } },
      { hole_number: 18, par: 4, tees: { championship: 391, tournament: 368, club: 361, medal: 317 } },
    ],
  },
]
