import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

const SIZES_DATA = [
  { size: 'XS', chest: '32-34"', waist: '24-26"' },
  { size: 'S', chest: '34-36"', waist: '26-28"' },
  { size: 'M', chest: '38-40"', waist: '30-32"' },
  { size: 'L', chest: '42-44"', waist: '34-36"' },
  { size: 'XL', chest: '46-48"', waist: '38-40"' },
];

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeChartModal({ isOpen, onClose }: SizeChartModalProps) {
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: isLight ? '#EAE8E3' : '#333336',
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Size Chart</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Find your size. If between sizes, recommend sizing up.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isLight ? '#f4f4f5' : '#2D2D30' },
              ]}
              hitSlop={8}
            >
              <Ionicons name="close" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Table */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View
                style={[
                  styles.tableRow,
                  styles.tableHeaderRow,
                  { borderBottomColor: isLight ? '#EAE8E3' : '#2D2D30' },
                ]}
              >
                <Text style={[styles.colHeader, { color: theme.textSecondary }]}>
                  Size
                </Text>
                <Text style={[styles.colHeader, { color: theme.textSecondary }]}>
                  Chest
                </Text>
                <Text style={[styles.colHeader, { color: theme.textSecondary }]}>
                  Waist
                </Text>
              </View>

              {SIZES_DATA.map((row) => (
                <View
                  key={row.size}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: isLight ? '#f4f4f5' : '#252528' },
                  ]}
                >
                  <Text style={[styles.cellBold, { color: theme.text }]}>
                    {row.size}
                  </Text>
                  <Text style={[styles.cell, { color: theme.textSecondary }]}>
                    {row.chest}
                  </Text>
                  <Text style={[styles.cell, { color: theme.textSecondary }]}>
                    {row.waist}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: theme.text }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[styles.doneBtnText, { color: theme.backgroundElement }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 3,
    maxWidth: 260,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  table: {
    minWidth: 320,
    marginVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tableHeaderRow: {
    paddingBottom: 8,
  },
  colHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cellBold: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  cell: {
    flex: 1,
    fontSize: 13,
  },
  doneBtn: {
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
