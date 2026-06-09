import dynamic from 'next/dynamic';
import { NextPage } from 'next';
import React from 'react';

const WorldRoomContainer = dynamic(
  () =>
    import('@bao/client/components/Game/Game.container').then(
      (mod) => mod.WorldRoomContainer
    ),
  { ssr: false }
);

export const getServerSideProps = async () => ({ props: {} });

export const GamePage: NextPage = (props) => <WorldRoomContainer {...props} />;
export default GamePage;
