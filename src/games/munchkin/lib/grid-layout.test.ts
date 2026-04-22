import { describe, it, expect } from 'vitest'
import { gridLayoutFor } from './grid-layout'

describe('gridLayoutFor', () => {
  it('n=1 → 1 col x 1 row, loose', () => {
    expect(gridLayoutFor(1)).toEqual({ cols: 1, rows: 1, density: 'loose' })
  })

  it('n=2 → 2 col x 1 row, loose', () => {
    expect(gridLayoutFor(2)).toEqual({ cols: 2, rows: 1, density: 'loose' })
  })

  it('n=3 → 2x2, loose', () => {
    expect(gridLayoutFor(3)).toEqual({ cols: 2, rows: 2, density: 'loose' })
  })

  it('n=4 → 2x2, loose', () => {
    expect(gridLayoutFor(4)).toEqual({ cols: 2, rows: 2, density: 'loose' })
  })

  it('n=5 → 3x2, normal', () => {
    expect(gridLayoutFor(5)).toEqual({ cols: 3, rows: 2, density: 'normal' })
  })

  it('n=6 → 3x2, normal', () => {
    expect(gridLayoutFor(6)).toEqual({ cols: 3, rows: 2, density: 'normal' })
  })

  it('n=7 → 4x2, dense', () => {
    expect(gridLayoutFor(7)).toEqual({ cols: 4, rows: 2, density: 'dense' })
  })

  it('n=8 → 4x2, dense', () => {
    expect(gridLayoutFor(8)).toEqual({ cols: 4, rows: 2, density: 'dense' })
  })
})
