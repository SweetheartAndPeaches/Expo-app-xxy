import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as useReactNativeColorScheme, Platform } from 'react-native';

const ColorSchemeContext = createContext<'light' | 'dark' | null | undefined>(null);

const ColorSchemeProvider = function ({ children }: { children?: ReactNode }) {
  const systemColorScheme = useReactNativeColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme);

  useEffect(() => {
    setColorScheme(systemColorScheme);
  }, [systemColorScheme]);

  useEffect(() => {
    function handleMessage(e: MessageEvent<{ event: string; colorScheme: ColorSchemeName; } | undefined>) {
      if (e.data?.event === 'coze.workbench.colorScheme') {
        const cs = e.data.colorScheme;
        if (typeof cs === 'string' && typeof setColorScheme === 'function') {
          setColorScheme(cs);
        }
      }
    }

    if (Platform.OS === 'web') {
      window.addEventListener('message', handleMessage, false);
    }

    return () => {
      if (Platform.OS === 'web') {
        window.removeEventListener('message', handleMessage, false);
      }
    }
  }, [setColorScheme]);

  return <ColorSchemeContext.Provider value={colorScheme}>
    {children}
  </ColorSchemeContext.Provider>
};

function useColorScheme() {
  const colorScheme = useContext(ColorSchemeContext);
  return colorScheme;
}

export {
  ColorSchemeProvider,
  useColorScheme,
}
