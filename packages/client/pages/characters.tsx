import { CharacterSelectionContainer } from '@bao/client/components/CharacterSelection';
import { NextPage } from 'next';
import React from 'react';

export const getServerSideProps = async () => ({ props: {} });

export const CharacterSelectionPage: NextPage = (props) => (
  <CharacterSelectionContainer {...props} />
);
export default CharacterSelectionPage;
