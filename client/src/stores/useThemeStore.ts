import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;

  setMode: (mode: ThemeMode) => void;
}


const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (mode: ThemeMode): ResolvedTheme => {
  if (mode === 'system') return getSystemTheme();
  return mode;
};

const loadSavedMode = (): ThemeMode | null => {
  const saved = localStorage.getItem('theme-mode');
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  } else return null;
};

export const useThemeStore = create<ThemeStore>((set) => {
  const modeFromStorage = loadSavedMode();
  const initialMode = modeFromStorage || 'system';
  const initialResolvedTheme = resolveTheme(initialMode);

  document.documentElement.setAttribute('data-theme', initialResolvedTheme);


  return {
    mode: initialMode,
    resolvedTheme: initialResolvedTheme,

    setMode: (mode: ThemeMode) => {
      const resolvedTheme = resolveTheme(mode);

      localStorage.setItem('theme-mode', mode);

      document.documentElement.setAttribute('data-theme', resolvedTheme);

      set({ mode, resolvedTheme });
    }
  };
});

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

mediaQuery.addEventListener('change', (event) => {
  const store = useThemeStore.getState(); // does not trigger any rerenders
  if (store.mode === 'system') {
    const userPrefersDark: boolean = event.matches;
    const newResolvedTheme = userPrefersDark ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newResolvedTheme);
    useThemeStore.setState({ resolvedTheme: newResolvedTheme });
  }
});
