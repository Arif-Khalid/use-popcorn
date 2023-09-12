import { useEffect, useState } from "react";
export function useLocalStorageState(key, defaultValue = null) {
  const [state, setState] = useState(function () {
    const storedValue = localStorage.getItem(key);
    return JSON.parse(storedValue) ?? defaultValue;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(state));
    },
    [key, state]
  );

  return [state, setState];
}
