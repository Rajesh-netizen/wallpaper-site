'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

type ModalContextType = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

const ModalContext = createContext<ModalContextType>({
  openId: null,
  setOpenId: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <ModalContext.Provider value={{ openId, setOpenId }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}

/** Renders children into document.body — escapes any parent stacking context. */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}