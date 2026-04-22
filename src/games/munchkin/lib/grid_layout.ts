export type GridDensity = 'loose' | 'normal' | 'dense'

export type GridLayout = {
  cols: number
  rows: number
  density: GridDensity
}

export function gridLayoutFor(count: number): GridLayout {
  if (count <= 2) {
    return { cols: Math.max(1, count), rows: 1, density: 'loose' }
  }

  if (count <= 4) {
    return { cols: 2, rows: 2, density: 'loose' }
  }

  if (count <= 6) {
    return { cols: 3, rows: 2, density: 'normal' }
  }

  return { cols: 4, rows: 2, density: 'dense' }
}
