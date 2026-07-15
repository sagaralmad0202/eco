import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/screen-header';
import { Reveal as FadeIn } from '@/components/ui/motion';
import { useTheme } from '@/hooks/use-theme';

const TABS = ['Settings', 'Wishlist', 'Orders', 'Security', 'Billing'];

const MENU_ITEMS = [
  { icon: '📦', label: 'My Orders', sub: 'Track, return, or buy things again', screen: 'orders' },
  { icon: '❤️', label: 'Wishlist', sub: '6 items saved', screen: 'wishlist' },
  { icon: '🏠', label: 'Addresses', sub: 'Manage shipping addresses', screen: 'addresses' },
  { icon: '💳', label: 'Payment Methods', sub: 'Add or remove payment methods', screen: 'billing' },
  { icon: '🔔', label: 'Notifications', sub: 'Manage notification preferences', screen: 'notifications' },
  { icon: '🔒', label: 'Security', sub: 'Password and 2-factor auth', screen: 'security' },
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('Settings');
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={theme.backgroundElement} />

      <ScreenHeader title={'My Account'} accessory={
        <TouchableOpacity
          accessibilityLabel={'Edit account'}
          accessibilityRole={'button'}
          activeOpacity={0.7}
          style={styles.editButton}>
          <Text style={[styles.editBtn, { color: isLight ? '#6366f1' : '#a5b4fc' }]}>Edit</Text>
        </TouchableOpacity>
      } />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <FadeIn delay={0}>
          <View style={[styles.profileCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
            <View style={styles.profileAvatarWrap}>
              <Image source={require('@/assets/images/avatar1.webp')} style={styles.profileAvatar} />
              <View style={styles.profileEditBadge}>
                <Text style={styles.profileEditIcon}>✏️</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>Enrico Cole</Text>
              <Text style={[styles.profileLoc, { color: theme.textSecondary }]}>📍 Los Angeles, CA</Text>
            </View>
            <View style={styles.profileStats}>
              <View style={styles.profileStat}>
                <Text style={[styles.profileStatNum, { color: theme.text }]}>12</Text>
                <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>Orders</Text>
              </View>
              <View style={[styles.profileStatDivider, { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]} />
              <View style={styles.profileStat}>
                <Text style={[styles.profileStatNum, { color: theme.text }]}>6</Text>
                <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>Wishlist</Text>
              </View>
              <View style={[styles.profileStatDivider, { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]} />
              <View style={styles.profileStat}>
                <Text style={[styles.profileStatNum, { color: theme.text }]}>2</Text>
                <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>Reviews</Text>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Segment Tabs */}
        <FadeIn delay={100}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.segTab, activeTab === tab ? { backgroundColor: theme.text } : { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segTabText, activeTab === tab ? { color: theme.backgroundElement } : { color: theme.textSecondary }]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FadeIn>

        {/* Settings Content */}
        {activeTab === 'Settings' && (
          <>
            {/* Account Info */}
            <FadeIn delay={200}>
              <View style={[styles.formCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                <Text style={[styles.formCardTitle, { color: theme.text }]}>Account Information</Text>
                <View style={styles.formRow}>
                  <View style={styles.formFieldHalf}>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>First Name</Text>
                    <View style={[styles.fieldInput, { backgroundColor: isLight ? '#FAF9F6' : '#1C1B19', borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                      <Text style={[styles.fieldValue, { color: theme.text }]}>Enrico</Text>
                    </View>
                  </View>
                  <View style={styles.formFieldHalf}>
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Last Name</Text>
                    <View style={[styles.fieldInput, { backgroundColor: isLight ? '#FAF9F6' : '#1C1B19', borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                      <Text style={[styles.fieldValue, { color: theme.text }]}>Cole</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.formFieldFull}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Email</Text>
                  <View style={[styles.fieldInput, { backgroundColor: isLight ? '#FAF9F6' : '#1C1B19', borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                    <Text style={[styles.fieldValue, { color: theme.text }]}>enrico@example.com</Text>
                  </View>
                </View>
              </View>
            </FadeIn>

            {/* Personal Details */}
            <FadeIn delay={300}>
              <View style={[styles.formCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                <Text style={[styles.formCardTitle, { color: theme.text }]}>Personal Details</Text>
                <View style={styles.formFieldFull}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Gender</Text>
                  <View style={[styles.fieldInput, { backgroundColor: isLight ? '#FAF9F6' : '#1C1B19', borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                    <Text style={[styles.fieldValue, { color: theme.text }]}>Male</Text>
                  </View>
                </View>
                <View style={styles.formFieldFull}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Date of Birth</Text>
                  <View style={[styles.fieldInput, { backgroundColor: isLight ? '#FAF9F6' : '#1C1B19', borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                    <Text style={[styles.fieldValue, { color: theme.text }]}>January 22, 1990</Text>
                  </View>
                </View>
              </View>
            </FadeIn>

            {/* Contact */}
            <FadeIn delay={400}>
              <View style={[styles.formCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                <Text style={[styles.formCardTitle, { color: theme.text }]}>Contact</Text>
                <View style={styles.formFieldFull}>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Phone Number</Text>
                  <View style={[styles.fieldInput, { backgroundColor: isLight ? '#FAF9F6' : '#1C1B19', borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                    <Text style={[styles.fieldValue, { color: theme.text }]}>+1 202-555-0178</Text>
                  </View>
                </View>
              </View>
            </FadeIn>

            {/* Quick Links */}
            <FadeIn delay={500}>
              <View style={styles.menuSection}>
                <Text style={[styles.menuSectionTitle, { color: theme.text }]}>Quick Links</Text>
                {MENU_ITEMS.map((item, index) => (
                  <TouchableOpacity key={index} style={[styles.menuRow, { borderBottomColor: isLight ? '#EAE8E3' : '#2D2D30' }]} activeOpacity={0.7}>
                    <View style={[styles.menuIconWrap, { backgroundColor: isLight ? '#F5F5F7' : '#222' }]}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                    </View>
                    <View style={styles.menuTextWrap}>
                      <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                      <Text style={[styles.menuSub, { color: theme.textSecondary }]}>{item.sub}</Text>
                    </View>
                    <Text style={styles.menuArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </FadeIn>

            {/* Save Button */}
            <FadeIn delay={600}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.text }]} activeOpacity={0.8}>
                <Text style={[styles.saveBtnText, { color: theme.backgroundElement }]}>Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7}>
                <Text style={styles.logoutBtnText}>Log Out</Text>
              </TouchableOpacity>
            </FadeIn>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  editButton: { minWidth: 44, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  editBtn: { fontSize: 14, lineHeight: 20, fontWeight: '600', color: '#6366f1' },

  scrollContent: { paddingBottom: 40 },

  // Profile Card
  profileCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f2',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },
  profileAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'visible',
    marginBottom: 12,
    position: 'relative',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#f3f4f6',
  },
  profileEditBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileEditIcon: { fontSize: 10 },
  profileInfo: { alignItems: 'center', marginBottom: 16 },
  profileName: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: '#111827', marginBottom: 2 },
  profileLoc: { fontSize: 13, color: '#9ca3af' },
  profileStats: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  profileStat: { alignItems: 'center', paddingHorizontal: 20 },
  profileStatNum: { fontSize: 18, lineHeight: 24, fontWeight: '700', color: '#111827' },
  profileStatLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  profileStatDivider: { width: 1, height: 28, backgroundColor: '#f0f0f2' },

  // Segment Tabs
  tabsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  segTab: {
    paddingVertical: 8,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f7',
  },
  segTabActive: { backgroundColor: '#111827' },
  segTabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  segTabTextActive: { color: '#fff', fontWeight: '700' },

  // Form Cards
  formCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f2',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.025,
    shadowRadius: 8,
    elevation: 1,
  },
  formCardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 },
  formRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  formFieldHalf: { flex: 1 },
  formFieldFull: { marginBottom: 12 },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  fieldInput: {
    height: 42,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f2',
  },
  fieldValue: { fontSize: 14, color: '#111827', fontWeight: '500' },

  // Menu Section
  menuSection: { marginHorizontal: 16, marginTop: 8 },
  menuSectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuIcon: { fontSize: 18 },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  menuSub: { fontSize: 12, color: '#9ca3af', marginTop: 1 },
  menuArrow: { fontSize: 22, color: '#d1d5db', fontWeight: '300' },

  // Buttons
  saveBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#111827',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
});
