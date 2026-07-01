import { getSequence } from './map'

describe('getSequence (LIS)', () => {
  it('returns empty for all-new items', () => {
    expect(getSequence([-1, -1, -1])).eql([])
  })

  it('handles reused item at relative oldIdx 0 (regression for arrI !== 0)', () => {
    // newSequence = [1, 0, 2] (rotate keeping oldIdx 0 at the middle):
    //   - position 0: reused oldIdx 1
    //   - position 1: reused oldIdx 0  <-- would be skipped by old `arrI !== 0`
    //   - position 2: reused oldIdx 2
    // true LIS = positions [0,2] (values 1,2) OR [1,2] (values 0,2); both length 2.
    expect(getSequence([1, 0, 2])).toHaveLength(2)
  })

  it('keeps the whole sequence when already increasing (including oldIdx 0)', () => {
    expect(getSequence([0, 1, 2])).eql([0, 1, 2])
  })

  it('moves only the displaced element on rotation [1,2,3] -> [3,1,2]', () => {
    // newSequence for [1,2,3] -> [3,1,2] is [2, 0, 1]
    // true LIS = [0, 1] (positions 1,2), keeping `1` and `2` stable, moving only `3`.
    expect(getSequence([2, 0, 1])).eql([1, 2])
  })

  it('handles mixed new and reused items', () => {
    // [2, -1, 0, 1] = reused-2, new, reused-0, reused-1
    // LIS = [0,1] (positions 2,3)
    expect(getSequence([2, -1, 0, 1])).eql([2, 3])
  })
})