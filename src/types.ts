export type PlayerType = {
  radius: number;
  baseRadius: number;
  x: number;
  y: number;
  speed: number;
  dx: number;
  color: string;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
  modifySize: (amount: number) => "dead" | "alive";
};

export type EntityType = {
  type: "WATER" | "GEM" | "FIRE" | "AIR" | "EARTH" | "SNOW" | "SUN" | "OIL";
  radius: number;
  x: number;
  y: number;
  color: string;
  markedForDeletion: boolean;
  getEffectiveRadius: () => number;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
};
