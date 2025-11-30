import { useMemo } from 'react';

export const useBirthdayTheme = (dataNascimento: string | null | undefined) => {
  const isBirthday = useMemo(() => {
    if (!dataNascimento) return false;
    
    const today = new Date();
    const birthDate = new Date(dataNascimento);
    
    return (
      today.getDate() === birthDate.getDate() &&
      today.getMonth() === birthDate.getMonth()
    );
  }, [dataNascimento]);

  return { isBirthday };
};
