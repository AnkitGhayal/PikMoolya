import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from './BottomSheetModal';
import { theme } from '../theme/theme';

interface CounterOfferModalProps {
  visible: boolean;
  offer: any;
  onSendCounter: (offerId: string, counterPrice: number) => Promise<void>;
  onClose: () => void;
}

export const CounterOfferModal: React.FC<CounterOfferModalProps> = ({
  visible,
  offer,
  onSendCounter,
  onClose,
}) => {
  const [counterPrice, setCounterPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (offer) {
      setCounterPrice(String(offer.offerPrice || ''));
    }
  }, [offer]);

  const handleSubmit = async () => {
    const num = Number(counterPrice);
    if (!counterPrice || isNaN(num) || num <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid counter offer price.');
      return;
    }

    try {
      setSubmitting(true);
      await onSendCounter(offer.id || offer.offerId, num);
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not send counter offer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!offer) return null;

  return (
    <BottomSheetModal
      visible={visible}
      title="Counter Offer"
      subtitle={`Respond to offer from ${offer.buyerName || 'Buyer'}`}
      icon="swap-horizontal-outline"
      onClose={onClose}
    >
      <View style={styles.container}>
        {/* PRICE COMPARISON ROW */}
        <View style={styles.priceRow}>
          <View style={styles.priceBox}>
            <Text style={styles.priceBoxLabel}>Buyer's Offer</Text>
            <Text style={styles.priceBoxVal}>₹{offer.offerPrice} <Text style={styles.unit}>/ {offer.unit || 'kg'}</Text></Text>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.priceBox}>
            <Text style={styles.priceBoxLabel}>Your Listed Price</Text>
            <Text style={styles.priceBoxVal}>₹{offer.listedPrice || offer.expectedPrice || 'N/A'} <Text style={styles.unit}>/ {offer.unit || 'kg'}</Text></Text>
          </View>
        </View>

        {/* COUNTER PRICE INPUT */}
        <Text style={styles.inputLabel}>Enter Counter Price (₹ / {offer.unit || 'kg'})</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.rupeeSymbol}>₹</Text>
          <TextInput
            style={styles.textInput}
            value={counterPrice}
            onChangeText={setCounterPrice}
            placeholder="e.g. 30"
            keyboardType="numeric"
            autoFocus
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Send Counter Offer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  priceBox: {
    flex: 1,
    alignItems: 'center',
  },
  priceBoxLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  priceBoxVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  rupeeSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    flex: 2,
    height: 46,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
