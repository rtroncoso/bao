import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/login',
    permanent: false
  }
});

export default function IndexPage() {
  return null;
}
