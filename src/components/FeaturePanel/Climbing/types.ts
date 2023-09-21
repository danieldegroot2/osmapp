export type PointType = 'belay' | 'bolt' | 'piton';

export type PathPoints = Array<{
  x: number;
  y: number;
  type?: PointType;
  note?: string;
}>;

export type ClimbingRoute = {
  difficulty?: string;
  length?: string;
  name?: string;
  description?: string;
  path: PathPoints;
};
