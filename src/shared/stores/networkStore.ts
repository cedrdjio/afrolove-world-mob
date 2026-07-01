import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
}

export const useNetworkStore = create<NetworkState>(() => ({
  isConnected: true,
  isInternetReachable: null,
  isOffline: false,
}));

NetInfo.addEventListener((state) => {
  const isOffline = state.isConnected === false || state.isInternetReachable === false;
  useNetworkStore.setState({
    isConnected: state.isConnected ?? true,
    isInternetReachable: state.isInternetReachable,
    isOffline,
  });
});
