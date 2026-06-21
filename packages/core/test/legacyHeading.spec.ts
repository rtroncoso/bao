const { expect } = require('chai');

const {
  Heading,
  legacyHeadingToHeading,
} = require('@bao/core/constants/game/Game');

describe('legacyHeadingToHeading', () => {
  it('maps Argentum Online Heading 1–4 to engine Heading', () => {
    expect(legacyHeadingToHeading(1)).to.equal(Heading.NORTH);
    expect(legacyHeadingToHeading(2)).to.equal(Heading.EAST);
    expect(legacyHeadingToHeading(3)).to.equal(Heading.SOUTH);
    expect(legacyHeadingToHeading(4)).to.equal(Heading.WEST);
  });

  it('passes through engine values already in 0–3', () => {
    expect(legacyHeadingToHeading(Heading.SOUTH)).to.equal(Heading.SOUTH);
  });
});
