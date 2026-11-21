// Scene definitions for Spot the Difference: three original hand-drawn scenes,
// each with eight fair-but-hidden differences. Coordinates live in scene space
// (600 x 480), the same space both panels render from. A difference entry names
// where a click counts (x, y, radius) and a short label shown when it is found.

export const SCENE_W = 600;
export const SCENE_H = 480;

export const SCENES = [
  {
    id: 'harbor',
    name: 'Moonlit Harbor',
    subtitle: 'A quiet fishing harbor under a full moon',
    timeLimit: 150,
    differences: [
      { id: 'star', x: 118, y: 52, r: 22, label: 'A missing star' },
      { id: 'lamp', x: 512, y: 96, r: 24, label: 'The lighthouse lamp color' },
      { id: 'roof', x: 210, y: 268, r: 30, label: 'A recolored roof' },
      { id: 'gull', x: 330, y: 120, r: 24, label: 'An extra seagull' },
      { id: 'boat', x: 430, y: 392, r: 30, label: 'A boat that moved' },
      { id: 'window', x: 300, y: 300, r: 20, label: 'A dark window' },
      { id: 'buoy', x: 150, y: 420, r: 22, label: 'A missing buoy' },
      { id: 'smoke', x: 388, y: 232, r: 24, label: 'Missing chimney smoke' },
    ],
  },
  {
    id: 'garden',
    name: 'Clockwork Garden',
    subtitle: 'A walled garden where the clock tower keeps garden time',
    timeLimit: 150,
    differences: [
      { id: 'hands', x: 300, y: 92, r: 30, label: 'The clock hands moved' },
      { id: 'tulip', x: 120, y: 372, r: 26, label: 'A recolored tulip' },
      { id: 'butterfly', x: 470, y: 180, r: 24, label: 'A missing butterfly' },
      { id: 'bee', x: 205, y: 205, r: 22, label: 'An extra bee' },
      { id: 'fountain', x: 300, y: 330, r: 28, label: 'The fountain water color' },
      { id: 'bird', x: 520, y: 250, r: 24, label: 'A missing bird' },
      { id: 'cloud', x: 90, y: 88, r: 28, label: 'An extra cloud' },
      { id: 'cushion', x: 452, y: 408, r: 26, label: 'A recolored bench cushion' },
    ],
  },
  {
    id: 'festival',
    name: 'Lantern Festival',
    subtitle: 'Paper lanterns over a night market street',
    timeLimit: 150,
    differences: [
      { id: 'lantern', x: 300, y: 130, r: 28, label: 'A lantern changed color' },
      { id: 'firework', x: 480, y: 70, r: 28, label: 'A missing firework' },
      { id: 'cat', x: 545, y: 268, r: 24, label: 'An extra cat on the roof' },
      { id: 'banner', x: 150, y: 190, r: 26, label: 'A banner lost its stripes' },
      { id: 'awning', x: 420, y: 300, r: 28, label: 'A recolored stall awning' },
      { id: 'bulb', x: 210, y: 150, r: 20, label: 'A dark festival bulb' },
      { id: 'balloon', x: 70, y: 250, r: 24, label: 'An extra balloon' },
      { id: 'kite', x: 395, y: 60, r: 22, label: 'A missing paper kite' },
    ],
  },
];

export function sceneById(id) {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
