import { create } from 'zustand';

export const MODES = ['light', 'dark', 'system'] as const;
export type Mode = (typeof MODES)[number];

type ResolvedTheme = 'light' | 'dark';

interface ThemeStore {
  selectedMode: Mode;
  resolvedTheme: ResolvedTheme;

  setSelectedMode: (mode: Mode) => void;
}

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (mode: Mode): ResolvedTheme => {
  if (mode === 'system') return getSystemTheme();
  return mode;
};

const loadSavedMode = (): Mode | null => {
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
    selectedMode: initialMode,
    resolvedTheme: initialResolvedTheme,

    setSelectedMode: (mode: Mode) => {
      const resolvedTheme = resolveTheme(mode);

      localStorage.setItem('theme-mode', mode);

      document.documentElement.setAttribute('data-theme', resolvedTheme);

      set({ selectedMode: mode, resolvedTheme });
    },
  };
});

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

mediaQuery.addEventListener('change', (event) => {
  const store = useThemeStore.getState(); // does not trigger any rerenders
  if (store.selectedMode === 'system') {
    const userPrefersDark: boolean = event.matches;
    const newResolvedTheme = userPrefersDark ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newResolvedTheme);
    useThemeStore.setState({ resolvedTheme: newResolvedTheme });
  }
});
