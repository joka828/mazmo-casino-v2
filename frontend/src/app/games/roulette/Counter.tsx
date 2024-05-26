import { useEffect, useState } from "react";

export default function Counter({
  initialValue = 40,
  onCountingStart = () => {},
  onCountingEnd = () => {},
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    onCountingStart();
    const interval = setInterval(() => {
      setValue((previousValue) => {
        if (previousValue - 1 === 0) {
          clearInterval(interval);
          onCountingEnd();
        }
        return previousValue - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{value}</span>;
}
