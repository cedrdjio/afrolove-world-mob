import { create } from 'zustand';

export type KycDocType = 'cni' | 'passport' | 'license';

/** Local URIs captured across the 3-step KYC flow, submitted from the recap. */
interface KycDraftState {
  docType: KycDocType;
  frontUri: string | null;
  backUri: string | null;
  selfieUri: string | null;
  setDocType: (docType: KycDocType) => void;
  setFrontUri: (uri: string | null) => void;
  setBackUri: (uri: string | null) => void;
  setSelfieUri: (uri: string | null) => void;
  reset: () => void;
}

export const useKycStore = create<KycDraftState>((set) => ({
  docType: 'cni',
  frontUri: null,
  backUri: null,
  selfieUri: null,
  setDocType: (docType) => set({ docType }),
  setFrontUri: (frontUri) => set({ frontUri }),
  setBackUri: (backUri) => set({ backUri }),
  setSelfieUri: (selfieUri) => set({ selfieUri }),
  reset: () => set({ docType: 'cni', frontUri: null, backUri: null, selfieUri: null }),
}));
