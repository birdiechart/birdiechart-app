export interface HoleData {
  hole_number: number
  par: number
  tees: {
    championship: number
    tournament: number
    club: number
    medal: number
    course: number   // course-named tee (Palmetto, Marshwood, etc.)
    island: number
    skidaway: number
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
  { value: 'course',       label: 'Course',       color: '#15803d' },
  { value: 'island',       label: 'Island',       color: '#0e7490' },
  { value: 'skidaway',     label: 'Skidaway',     color: '#7c3aed' },
] as const

export type TeeOption = typeof TEE_OPTIONS[number]['value']

// ─── CONFIRMED FROM 2024 SCORECARDS ────────────────────────────────────────
// "course" tee = course-named tee (Palmetto, Marshwood, Magnolia, etc.)
// ───────────────────────────────────────────────────────────────────────────

export const LANDINGS_COURSES: LandingsCourse[] = [
  {
    name: 'Palmetto',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 394, tournament: 371, club: 340, medal: 310, course: 280, island: 264, skidaway: 219 } },
      { hole_number: 2,  par: 5, tees: { championship: 535, tournament: 507, club: 484, medal: 453, course: 436, island: 394, skidaway: 353 } },
      { hole_number: 3,  par: 3, tees: { championship: 203, tournament: 167, club: 159, medal: 145, course: 136, island: 100, skidaway: 100 } },
      { hole_number: 4,  par: 4, tees: { championship: 485, tournament: 449, club: 423, medal: 396, course: 353, island: 303, skidaway: 253 } },
      { hole_number: 5,  par: 3, tees: { championship: 198, tournament: 169, club: 156, medal: 138, course: 118, island: 111, skidaway: 91  } },
      { hole_number: 6,  par: 4, tees: { championship: 453, tournament: 410, club: 390, medal: 358, course: 347, island: 275, skidaway: 228 } },
      { hole_number: 7,  par: 5, tees: { championship: 531, tournament: 491, club: 457, medal: 449, course: 420, island: 357, skidaway: 310 } },
      { hole_number: 8,  par: 4, tees: { championship: 343, tournament: 323, club: 304, medal: 284, course: 267, island: 190, skidaway: 175 } },
      { hole_number: 9,  par: 4, tees: { championship: 406, tournament: 378, club: 365, medal: 332, course: 306, island: 281, skidaway: 228 } },
      { hole_number: 10, par: 5, tees: { championship: 530, tournament: 512, club: 495, medal: 449, course: 430, island: 390, skidaway: 355 } },
      { hole_number: 11, par: 4, tees: { championship: 412, tournament: 374, club: 343, medal: 325, course: 298, island: 265, skidaway: 230 } },
      { hole_number: 12, par: 3, tees: { championship: 187, tournament: 183, club: 156, medal: 144, course: 130, island: 110, skidaway: 95  } },
      { hole_number: 13, par: 4, tees: { championship: 392, tournament: 385, club: 362, medal: 334, course: 310, island: 280, skidaway: 245 } },
      { hole_number: 14, par: 5, tees: { championship: 495, tournament: 480, club: 427, medal: 406, course: 375, island: 340, skidaway: 305 } },
      { hole_number: 15, par: 3, tees: { championship: 165, tournament: 155, club: 138, medal: 127, course: 115, island: 100, skidaway: 88  } },
      { hole_number: 16, par: 4, tees: { championship: 456, tournament: 429, club: 394, medal: 344, course: 315, island: 285, skidaway: 250 } },
      { hole_number: 17, par: 4, tees: { championship: 434, tournament: 422, club: 392, medal: 355, course: 320, island: 290, skidaway: 255 } },
      { hole_number: 18, par: 4, tees: { championship: 426, tournament: 382, club: 367, medal: 341, course: 310, island: 275, skidaway: 240 } },
    ],
  },
  {
    name: 'Marshwood',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 431, tournament: 414, club: 383, medal: 369, course: 339, island: 294, skidaway: 265 } },
      { hole_number: 2,  par: 5, tees: { championship: 551, tournament: 522, club: 504, medal: 465, course: 409, island: 350, skidaway: 350 } },
      { hole_number: 3,  par: 4, tees: { championship: 395, tournament: 363, club: 327, medal: 319, course: 279, island: 249, skidaway: 195 } },
      { hole_number: 4,  par: 3, tees: { championship: 203, tournament: 183, club: 173, medal: 141, course: 135, island: 105, skidaway: 105 } },
      { hole_number: 5,  par: 5, tees: { championship: 567, tournament: 544, club: 519, medal: 477, course: 413, island: 390, skidaway: 350 } },
      { hole_number: 6,  par: 4, tees: { championship: 346, tournament: 339, club: 312, medal: 271, course: 233, island: 207, skidaway: 175 } },
      { hole_number: 7,  par: 4, tees: { championship: 384, tournament: 352, club: 337, medal: 333, course: 288, island: 258, skidaway: 215 } },
      { hole_number: 8,  par: 3, tees: { championship: 209, tournament: 187, club: 173, medal: 161, course: 143, island: 110, skidaway: 110 } },
      { hole_number: 9,  par: 4, tees: { championship: 449, tournament: 425, club: 393, medal: 360, course: 306, island: 276, skidaway: 240 } },
      { hole_number: 10, par: 4, tees: { championship: 425, tournament: 397, club: 367, medal: 340, course: 310, island: 275, skidaway: 255 } },
      { hole_number: 11, par: 4, tees: { championship: 451, tournament: 422, club: 387, medal: 361, course: 320, island: 285, skidaway: 245 } },
      { hole_number: 12, par: 3, tees: { championship: 177, tournament: 157, club: 139, medal: 123, course: 110, island: 93,  skidaway: 85  } },
      { hole_number: 13, par: 5, tees: { championship: 504, tournament: 494, club: 482, medal: 421, course: 380, island: 345, skidaway: 325 } },
      { hole_number: 14, par: 4, tees: { championship: 383, tournament: 355, club: 345, medal: 307, course: 270, island: 240, skidaway: 192 } },
      { hole_number: 15, par: 5, tees: { championship: 521, tournament: 501, club: 483, medal: 471, course: 410, island: 370, skidaway: 335 } },
      { hole_number: 16, par: 3, tees: { championship: 163, tournament: 147, club: 133, medal: 115, course: 100, island: 85,  skidaway: 85  } },
      { hole_number: 17, par: 4, tees: { championship: 334, tournament: 317, club: 301, medal: 282, course: 250, island: 220, skidaway: 190 } },
      { hole_number: 18, par: 4, tees: { championship: 411, tournament: 390, club: 367, medal: 346, course: 305, island: 270, skidaway: 227 } },
    ],
  },
  {
    name: 'Magnolia',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 344, tournament: 320, club: 298, medal: 276, course: 241, island: 211, skidaway: 195 } },
      { hole_number: 2,  par: 5, tees: { championship: 561, tournament: 524, club: 490, medal: 482, course: 433, island: 372, skidaway: 367 } },
      { hole_number: 3,  par: 3, tees: { championship: 154, tournament: 132, club: 125, medal: 118, course: 100, island: 74,  skidaway: 74  } },
      { hole_number: 4,  par: 4, tees: { championship: 405, tournament: 384, club: 375, medal: 351, course: 324, island: 287, skidaway: 248 } },
      { hole_number: 5,  par: 4, tees: { championship: 381, tournament: 362, club: 353, medal: 327, course: 297, island: 272, skidaway: 193 } },
      { hole_number: 6,  par: 5, tees: { championship: 486, tournament: 481, club: 472, medal: 432, course: 412, island: 367, skidaway: 299 } },
      { hole_number: 7,  par: 4, tees: { championship: 399, tournament: 378, club: 368, medal: 344, course: 312, island: 282, skidaway: 224 } },
      { hole_number: 8,  par: 3, tees: { championship: 185, tournament: 176, club: 157, medal: 140, course: 101, island: 101, skidaway: 101 } },
      { hole_number: 9,  par: 4, tees: { championship: 433, tournament: 427, club: 408, medal: 343, course: 316, island: 284, skidaway: 235 } },
      { hole_number: 10, par: 4, tees: { championship: 395, tournament: 371, club: 362, medal: 341, course: 310, island: 275, skidaway: 250 } },
      { hole_number: 11, par: 5, tees: { championship: 555, tournament: 543, club: 501, medal: 486, course: 440, island: 400, skidaway: 365 } },
      { hole_number: 12, par: 4, tees: { championship: 439, tournament: 406, club: 368, medal: 330, course: 295, island: 260, skidaway: 225 } },
      { hole_number: 13, par: 4, tees: { championship: 423, tournament: 384, club: 374, medal: 323, course: 290, island: 255, skidaway: 220 } },
      { hole_number: 14, par: 3, tees: { championship: 172, tournament: 155, club: 146, medal: 130, course: 115, island: 100, skidaway: 88  } },
      { hole_number: 15, par: 4, tees: { championship: 382, tournament: 350, club: 335, medal: 290, course: 260, island: 230, skidaway: 200 } },
      { hole_number: 16, par: 5, tees: { championship: 544, tournament: 535, club: 509, medal: 490, course: 445, island: 405, skidaway: 370 } },
      { hole_number: 17, par: 3, tees: { championship: 219, tournament: 174, club: 165, medal: 134, course: 118, island: 104, skidaway: 90  } },
      { hole_number: 18, par: 4, tees: { championship: 418, tournament: 398, club: 368, medal: 358, course: 320, island: 285, skidaway: 248 } },
    ],
  },
  {
    name: 'Deer Creek',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 396, tournament: 383, club: 355, medal: 336, course: 301, island: 271, skidaway: 211 } },
      { hole_number: 2,  par: 3, tees: { championship: 189, tournament: 181, club: 160, medal: 132, course: 113, island: 113, skidaway: 106 } },
      { hole_number: 3,  par: 5, tees: { championship: 551, tournament: 525, club: 470, medal: 427, course: 398, island: 348, skidaway: 316 } },
      { hole_number: 4,  par: 4, tees: { championship: 385, tournament: 353, club: 320, medal: 307, course: 284, island: 284, skidaway: 229 } },
      { hole_number: 5,  par: 4, tees: { championship: 320, tournament: 284, club: 264, medal: 244, course: 212, island: 212, skidaway: 169 } },
      { hole_number: 6,  par: 5, tees: { championship: 580, tournament: 551, club: 508, medal: 475, course: 422, island: 384, skidaway: 384 } },
      { hole_number: 7,  par: 4, tees: { championship: 396, tournament: 368, club: 358, medal: 347, course: 307, island: 277, skidaway: 187 } },
      { hole_number: 8,  par: 3, tees: { championship: 201, tournament: 172, club: 152, medal: 126, course: 116, island: 96,  skidaway: 96  } },
      { hole_number: 9,  par: 4, tees: { championship: 480, tournament: 408, club: 373, medal: 343, course: 304, island: 304, skidaway: 243 } },
      { hole_number: 10, par: 4, tees: { championship: 449, tournament: 386, club: 352, medal: 339, course: 310, island: 275, skidaway: 239 } },
      { hole_number: 11, par: 4, tees: { championship: 388, tournament: 355, club: 333, medal: 311, course: 280, island: 250, skidaway: 215 } },
      { hole_number: 12, par: 3, tees: { championship: 188, tournament: 158, club: 134, medal: 111, course: 100, island: 88,  skidaway: 88  } },
      { hole_number: 13, par: 4, tees: { championship: 443, tournament: 411, club: 396, medal: 381, course: 340, island: 305, skidaway: 270 } },
      { hole_number: 14, par: 5, tees: { championship: 582, tournament: 479, club: 460, medal: 428, course: 390, island: 355, skidaway: 315 } },
      { hole_number: 15, par: 4, tees: { championship: 442, tournament: 406, club: 373, medal: 362, course: 320, island: 285, skidaway: 250 } },
      { hole_number: 16, par: 4, tees: { championship: 405, tournament: 363, club: 351, medal: 315, course: 280, island: 245, skidaway: 210 } },
      { hole_number: 17, par: 3, tees: { championship: 197, tournament: 187, club: 163, medal: 149, course: 130, island: 115, skidaway: 100 } },
      { hole_number: 18, par: 5, tees: { championship: 593, tournament: 544, club: 488, medal: 448, course: 405, island: 370, skidaway: 335 } },
    ],
  },
  {
    name: 'Terrapin',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 425, tournament: 387, club: 358, medal: 336, course: 297, island: 276, skidaway: 205 } },
      { hole_number: 2,  par: 4, tees: { championship: 403, tournament: 381, club: 346, medal: 321, course: 303, island: 251, skidaway: 207 } },
      { hole_number: 3,  par: 3, tees: { championship: 149, tournament: 143, club: 129, medal: 122, course: 115, island: 115, skidaway: 84  } },
      { hole_number: 4,  par: 4, tees: { championship: 405, tournament: 377, club: 352, medal: 331, course: 303, island: 266, skidaway: 221 } },
      { hole_number: 5,  par: 5, tees: { championship: 518, tournament: 511, club: 487, medal: 464, course: 443, island: 401, skidaway: 277 } },
      { hole_number: 6,  par: 4, tees: { championship: 409, tournament: 372, club: 349, medal: 328, course: 273, island: 273, skidaway: 168 } },
      { hole_number: 7,  par: 4, tees: { championship: 406, tournament: 377, club: 354, medal: 330, course: 322, island: 282, skidaway: 185 } },
      { hole_number: 8,  par: 3, tees: { championship: 192, tournament: 178, club: 163, medal: 154, course: 135, island: 102, skidaway: 102 } },
      { hole_number: 9,  par: 5, tees: { championship: 504, tournament: 496, club: 440, medal: 430, course: 350, island: 350, skidaway: 350 } },
      { hole_number: 10, par: 4, tees: { championship: 345, tournament: 330, club: 320, medal: 307, course: 280, island: 250, skidaway: 215 } },
      { hole_number: 11, par: 4, tees: { championship: 394, tournament: 363, club: 340, medal: 333, course: 305, island: 270, skidaway: 235 } },
      { hole_number: 12, par: 3, tees: { championship: 200, tournament: 183, club: 163, medal: 142, course: 125, island: 110, skidaway: 95  } },
      { hole_number: 13, par: 4, tees: { championship: 452, tournament: 419, club: 359, medal: 337, course: 305, island: 270, skidaway: 235 } },
      { hole_number: 14, par: 5, tees: { championship: 547, tournament: 533, club: 511, medal: 480, course: 440, island: 400, skidaway: 365 } },
      { hole_number: 15, par: 4, tees: { championship: 381, tournament: 355, club: 335, medal: 319, course: 285, island: 250, skidaway: 218 } },
      { hole_number: 16, par: 4, tees: { championship: 411, tournament: 378, club: 351, medal: 331, course: 295, island: 260, skidaway: 225 } },
      { hole_number: 17, par: 3, tees: { championship: 184, tournament: 158, club: 157, medal: 139, course: 120, island: 105, skidaway: 90  } },
      { hole_number: 18, par: 5, tees: { championship: 512, tournament: 496, club: 476, medal: 443, course: 405, island: 370, skidaway: 335 } },
    ],
  },
  {
    name: 'Oakridge',
    location: 'The Landings, Savannah, GA',
    holes: [
      { hole_number: 1,  par: 4, tees: { championship: 415, tournament: 395, club: 381, medal: 342, course: 302, island: 272, skidaway: 225 } },
      { hole_number: 2,  par: 4, tees: { championship: 441, tournament: 417, club: 404, medal: 376, course: 312, island: 312, skidaway: 240 } },
      { hole_number: 3,  par: 3, tees: { championship: 186, tournament: 169, club: 156, medal: 144, course: 130, island: 81,  skidaway: 81  } },
      { hole_number: 4,  par: 5, tees: { championship: 519, tournament: 504, club: 482, medal: 459, course: 381, island: 381, skidaway: 315 } },
      { hole_number: 5,  par: 3, tees: { championship: 200, tournament: 162, club: 150, medal: 134, course: 125, island: 121, skidaway: 121 } },
      { hole_number: 6,  par: 4, tees: { championship: 354, tournament: 331, club: 311, medal: 283, course: 259, island: 259, skidaway: 205 } },
      { hole_number: 7,  par: 5, tees: { championship: 501, tournament: 476, club: 444, medal: 418, course: 403, island: 363, skidaway: 315 } },
      { hole_number: 8,  par: 4, tees: { championship: 337, tournament: 313, club: 289, medal: 256, course: 247, island: 247, skidaway: 191 } },
      { hole_number: 9,  par: 4, tees: { championship: 378, tournament: 355, club: 341, medal: 294, course: 279, island: 244, skidaway: 239 } },
      { hole_number: 10, par: 4, tees: { championship: 435, tournament: 417, club: 378, medal: 348, course: 315, island: 280, skidaway: 245 } },
      { hole_number: 11, par: 4, tees: { championship: 406, tournament: 387, club: 373, medal: 341, course: 305, island: 270, skidaway: 235 } },
      { hole_number: 12, par: 3, tees: { championship: 176, tournament: 155, club: 144, medal: 132, course: 115, island: 100, skidaway: 88  } },
      { hole_number: 13, par: 5, tees: { championship: 505, tournament: 473, club: 457, medal: 428, course: 390, island: 355, skidaway: 315 } },
      { hole_number: 14, par: 4, tees: { championship: 338, tournament: 325, club: 313, medal: 289, course: 260, island: 230, skidaway: 200 } },
      { hole_number: 15, par: 5, tees: { championship: 476, tournament: 465, club: 433, medal: 423, course: 385, island: 350, skidaway: 315 } },
      { hole_number: 16, par: 3, tees: { championship: 140, tournament: 124, club: 116, medal: 109, course: 100, island: 90,  skidaway: 80  } },
      { hole_number: 17, par: 4, tees: { championship: 405, tournament: 384, club: 374, medal: 283, course: 270, island: 240, skidaway: 205 } },
      { hole_number: 18, par: 4, tees: { championship: 391, tournament: 368, club: 361, medal: 317, course: 285, island: 255, skidaway: 220 } },
    ],
  },
]
