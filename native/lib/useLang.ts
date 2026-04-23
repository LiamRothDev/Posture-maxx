import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { copy, getCopy, type Copy } from '@shared/copy';
import type { Lang } from '@shared/types';

const KEY = 'pm.lang';

export function useLang(): [Lang, (l: Lang) => void, Copy] {
  const [lang, setLangState] = useState<Lang>('de');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === 'en' || v === 'de') setLangState(v);
    });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(KEY, l).catch(() => {});
  };

  return [lang, setLang, getCopy(lang)];
}

// re-export for convenience
export { copy };
