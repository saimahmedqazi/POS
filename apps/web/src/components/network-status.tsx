import {
  useEffect,
  useState,
} from 'react';

import Badge from './ui/badge';

export default function NetworkStatus() {
  const [
    online,
    setOnline,
  ] = useState(
    navigator.onLine,
  );

  useEffect(() => {
    const handleOnline =
      () => setOnline(true);

    const handleOffline =
      () => setOnline(false);

    window.addEventListener(
      'online',
      handleOnline,
    );

    window.addEventListener(
      'offline',
      handleOffline,
    );

    return () => {
      window.removeEventListener(
        'online',
        handleOnline,
      );

      window.removeEventListener(
        'offline',
        handleOffline,
      );
    };
  }, []);

  return (
    <Badge
      variant={
        online
          ? 'success'
          : 'danger'
      }
    >
      {online
        ? 'Online'
        : 'Offline'}
    </Badge>
  );
}