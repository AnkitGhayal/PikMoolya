import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface LocationSelectorModalProps {
  visible: boolean;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onClose: () => void;
}

const MAHARASHTRA_LOCATIONS = [
  { district: 'Pune', talukas: ['Haveli (Pune)', 'Khed (Rajgurunagar)', 'Shirur', 'Baramati', 'Indapur', 'Junnar', 'Ambegaon (Manchar)'] },
  { district: 'Nashik', talukas: ['Nashik', 'Niphad', 'Pimpalgaon', 'Malegaon', 'Sinnar', 'Yeola', 'Chandwad'] },
  { district: 'Ahmednagar', talukas: ['Nagar', 'Rahuri', 'Sangamner', 'Kopargaon', 'Shrirampur', 'Parner'] },
  { district: 'Satara', talukas: ['Satara', 'Karad', 'Wai', 'Phaltan', 'Koregaon'] },
  { district: 'Solapur', talukas: ['Solapur', 'Pandharpur', 'Barshi', 'Sangole', 'Akkalkot'] },
  { district: 'Kolhapur', talukas: ['Karveer (Kolhapur)', 'Hatkanangle', 'Shirol', 'Kagal'] },
  { district: 'Aurangabad (Chhatrapati Sambhajinagar)', talukas: ['Chhatrapati Sambhajinagar', 'Paithan', 'Gangapur', 'Vaijapur'] },
];

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  visible,
  selectedLocation,
  onSelectLocation,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        {/* Full Screen Opaque Dark Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* 100% Solid Opaque Bottom Sheet */}
        <View style={styles.sheetContainer}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location-outline" size={22} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.title}>Select Farm Location</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subTitle}>Select your district or taluka for accurate transport cost calculations.</Text>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search district or taluka..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94A3B8"
              autoCorrect={false}
            />
          </View>

          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {MAHARASHTRA_LOCATIONS.map((item) => {
              const matchesDistrict = item.district.toLowerCase().includes(search.toLowerCase());
              const matchingTalukas = item.talukas.filter((t) => t.toLowerCase().includes(search.toLowerCase()));

              if (search && !matchesDistrict && matchingTalukas.length === 0) return null;

              return (
                <View key={item.district} style={styles.districtBlock}>
                  <TouchableOpacity
                    style={styles.districtRow}
                    onPress={() => {
                      onSelectLocation(`${item.district} District`);
                      onClose();
                    }}
                  >
                    <Ionicons name="location" size={18} color="#15803D" style={{ marginRight: 8 }} />
                    <Text style={styles.districtText}>{item.district} District</Text>
                    {selectedLocation.includes(item.district) && (
                      <Ionicons name="checkmark-circle" size={18} color="#15803D" style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>

                  <View style={styles.talukaWrap}>
                    {(search ? matchingTalukas : item.talukas).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.talukaChip,
                          selectedLocation === `${t}, ${item.district}` && styles.talukaChipSelected,
                        ]}
                        onPress={() => {
                          onSelectLocation(`${t}, ${item.district}`);
                          onClose();
                        }}
                      >
                        <Text
                          style={[
                            styles.talukaText,
                            selectedLocation === `${t}, ${item.district}` && styles.talukaTextSelected,
                          ]}
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Opaque backdrop blocking background content
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF', // 100% Solid Opaque Surface
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    elevation: 30,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subTitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  districtBlock: {
    marginBottom: 16,
  },
  districtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  districtText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  talukaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    paddingLeft: 24,
  },
  talukaChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  talukaChipSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#15803D',
  },
  talukaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  talukaTextSelected: {
    color: '#15803D',
    fontWeight: '700',
  },
});
