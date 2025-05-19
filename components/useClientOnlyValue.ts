import { useEffect, useState } from 'react';

export function useClientOnlyValue<T>(clientValue: T, serverValue: T): T {
  const [value, setValue] = useState(serverValue);
  useEffect(() => {
    setValue(clientValue);
  }, [clientValue]);
  return value;
}
