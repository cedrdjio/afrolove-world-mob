import { create } from 'zustand';

/** Bridges the legal modal's "J'accepte" button back to the register form's
 *  checkbox — the modal is a separate route, so a store carries the consent. */
interface LegalConsentState {
  acceptedFromModal: boolean;
  setAcceptedFromModal: (value: boolean) => void;
}

export const useLegalConsentStore = create<LegalConsentState>((set) => ({
  acceptedFromModal: false,
  setAcceptedFromModal: (acceptedFromModal) => set({ acceptedFromModal }),
}));
