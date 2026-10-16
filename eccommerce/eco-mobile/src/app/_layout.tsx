import { useEffect, useMemo } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { Provider as AntdProvider } from '@ant-design/react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthProvider } from '@/context/auth-context';
import { CartProvider } from '@/context/cart-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const antdTheme = useMemo(
    () => ({
      brand_primary: '#111111',
      brand_primary_tap: '#2D2D30',
      brand_success: '#22c55e',
      brand_warning: '#f59e0b',
      brand_error: '#ef4444',
      color_text_base: isDark ? '#F5F5F5' : '#111111',
      color_text_caption: isDark ? '#A1A1AA' : '#5E5E5E',
      border_color_base: isDark ? '#2D2D30' : '#EAE8E3',
      fill_base: isDark ? '#1C1C1E' : '#FFFFFF',
      fill_body: isDark ? '#121212' : '#F8F7F4',
      radius_md: 12,
      radius_lg: 16,
      primary_button_fill: '#111111',
      primary_button_fill_tap: '#2D2D30',
    }),
    [isDark]
  );

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AntdProvider theme={antdTheme}>
        <AuthProvider>
          <CartProvider>
            <AnimatedSplashOverlay />
            <AppTabs />
          </CartProvider>
        </AuthProvider>
      </AntdProvider>
    </ThemeProvider>
  );
}
