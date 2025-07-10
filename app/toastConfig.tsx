import type { BaseToastProps } from 'react-native-toast-message';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#22c55e', 
        backgroundColor: '#ecfdf5' ,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#15803d',
      }}
      text2Style={{
        fontSize: 14,
        color: '#166534',
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#ef4444', backgroundColor: '#fef2f2' }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#b91c1c',
      }}
      text2Style={{
        fontSize: 14,
        color: '#7f1d1d',
      }}
    />
  ),
};
