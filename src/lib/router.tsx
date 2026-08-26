import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function getCurrentPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(getCurrentPath());

  useEffect(() => {
    const handler = () => {
      setPath(getCurrentPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    if (!window.location.hash) {
      window.location.hash = '/';
    }
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  function navigate(to: string) {
    window.location.hash = to;
    setPath(to);
    window.scrollTo(0, 0);
  }

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function useNavigate() {
  return useRouter().navigate;
}
