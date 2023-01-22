import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function IndexPage() {
  const router = useRouter();
  const { query } = router;
  useEffect(() => {
    router.replace({ pathname: 'login', query }, undefined, { shallow: true });
  });
  return null;
}
