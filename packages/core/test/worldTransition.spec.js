const { expect } = require('chai');
const {
  isMapEdgeForExitDirection,
  resolveGridTransitionLanding,
} = require('@bao/core/loaders/maps/world');

describe('map border transitions', () => {
  describe('isMapEdgeForExitDirection', () => {
    it('only matches the outermost playable row/column', () => {
      expect(isMapEdgeForExitDirection(75, 40, 'east')).to.equal(false);
      expect(isMapEdgeForExitDirection(83, 40, 'east')).to.equal(true);
      expect(isMapEdgeForExitDirection(40, 81, 'south')).to.equal(false);
      expect(isMapEdgeForExitDirection(40, 87, 'south')).to.equal(true);
    });
  });

  describe('resolveGridTransitionLanding', () => {
    it('lands on the opposite edge of the destination map', () => {
      expect(resolveGridTransitionLanding('south', 42, 87)).to.deep.equal({
        targetX: 42,
        targetY: 1,
      });
      expect(resolveGridTransitionLanding('north', 42, 0)).to.deep.equal({
        targetX: 42,
        targetY: 87,
      });
      expect(resolveGridTransitionLanding('east', 83, 50)).to.deep.equal({
        targetX: 1,
        targetY: 50,
      });
      expect(resolveGridTransitionLanding('west', 0, 50)).to.deep.equal({
        targetX: 83,
        targetY: 50,
      });
    });
  });
});
