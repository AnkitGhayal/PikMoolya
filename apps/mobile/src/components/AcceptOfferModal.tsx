import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from './BottomSheetModal';
import { theme } from '../theme/theme';
import { t } from '../utils/i18n';

interface AcceptOfferModalProps {
  visible: boolean;
  offer: any;
  onAccept: (offerId: string, options: {
    logisticsRequired: boolean;
    logisticsCost?: number;
    logisticsPayer?: string;
    pickupDetails?: string;
    deliveryDetails?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export const AcceptOfferModal: React.FC<AcceptOfferModalProps> = ({
  visible,
  offer,
  onAccept,
  onClose,
}) => {
  const [logisticsRequired, setLogisticsRequired] = useState<boolean>(true);
  const [logisticsCost, setLogisticsCost] = useState<string>('750');
  const [logisticsPayer, setLogisticsPayer] = useState<'BUYER' | 'FARMER'>('BUYER');
  const [pickupDetails, setPickupDetails] = useState<string>('Farm Gate / APMC Yard');
  const [deliveryDetails, setDeliveryDetails] = useState<string>('Buyer Central Facility');
  const [submitting, setSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (offer) {
      const qty = Number(offer.quantity || 100);
      const estCost = Math.max(500, Math.min(2500, Math.round(qty * 15)));
      setLogisticsCost(String(estCost));
      setLogisticsRequired(true);
      setLogisticsPayer('BUYER');
    }
  }, [offer]);

  if (!offer) return null;

  const qty = Number(offer.quantity || 1);
  const price = Number(offer.offerPrice || offer.offeredPricePerUnit || 0);
  const totalVal = qty * price;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await onAccept(offer.id || offer.offerId, {
        logisticsRequired,
        logisticsCost: logisticsRequired ? Number(logisticsCost) || 0 : 0,
        logisticsPayer: logisticsRequired ? logisticsPayer : undefined,
        pickupDetails: logisticsRequired ? pickupDetails : undefined,
        deliveryDetails: logisticsRequired ? deliveryDetails : undefined,
      });
      onClose();
    } catch (err) {
      // handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheetModal
      visible={visible}
      title={t('acceptOfferTitle')}
      subtitle={t('acceptOfferSubtitle')}
      icon="checkmark-circle-outline"
      onClose={onClose}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
        {/* OFFER SUMMARY CARD */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{offer.cropName || offer.crop?.name || 'Produce'}</Text>
            <Text style={styles.summaryVal}>₹{price}/kg × {qty} kg</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 4, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 6 }]}>
            <Text style={styles.totalLabel}>Gross Order Value</Text>
            <Text style={styles.totalVal}>₹{totalVal.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* LOGISTICS OPTIONS */}
        <Text style={styles.sectionTitle}>Transportation Decision</Text>

        {/* OPTION A */}
        <TouchableOpacity
          style={[styles.optionCard, logisticsRequired && styles.optionCardSelected]}
          onPress={() => setLogisticsRequired(true)}
          activeOpacity={0.8}
        >
          <View style={styles.optionHeader}>
            <Ionicons
              name={logisticsRequired ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={logisticsRequired ? '#15803D' : '#94A3B8'}
            />
            <Text style={[styles.optionTitle, logisticsRequired && styles.optionTitleSelected]}>
              {t('optionLogisticsPartner')}
            </Text>
          </View>
          <Text style={styles.optionDesc}>
            {t('optionLogisticsPartnerDesc')}
          </Text>

          {logisticsRequired && (
            <View style={styles.detailsBox}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('logisticsCharges')} (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  value={logisticsCost}
                  onChangeText={setLogisticsCost}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.inputLabel}>{t('logisticsPayer')}</Text>
              <View style={styles.payerRow}>
                <TouchableOpacity
                  style={[styles.payerBtn, logisticsPayer === 'BUYER' && styles.payerBtnActive]}
                  onPress={() => setLogisticsPayer('BUYER')}
                >
                  <Text style={[styles.payerBtnText, logisticsPayer === 'BUYER' && styles.payerBtnTextActive]}>
                    {t('payerBuyer')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.payerBtn, logisticsPayer === 'FARMER' && styles.payerBtnActive]}
                  onPress={() => setLogisticsPayer('FARMER')}
                >
                  <Text style={[styles.payerBtnText, logisticsPayer === 'FARMER' && styles.payerBtnTextActive]}>
                    {t('payerFarmer')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* OPTION B */}
        <TouchableOpacity
          style={[styles.optionCard, !logisticsRequired && styles.optionCardSelected]}
          onPress={() => setLogisticsRequired(false)}
          activeOpacity={0.8}
        >
          <View style={styles.optionHeader}>
            <Ionicons
              name={!logisticsRequired ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={!logisticsRequired ? '#15803D' : '#94A3B8'}
            />
            <Text style={[styles.optionTitle, !logisticsRequired && styles.optionTitleSelected]}>
              {t('optionNoLogistics')}
            </Text>
          </View>
          <Text style={styles.optionDesc}>
            {t('optionNoLogisticsDesc')}
          </Text>
        </TouchableOpacity>

        {/* ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleConfirm} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Confirm Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryVal: {
    fontSize: 13,
    color: '#475569',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#15803D',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionCard: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 12,
  },
  optionCardSelected: {
    borderColor: '#15803D',
    backgroundColor: '#F0FDF4',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
    flex: 1,
  },
  optionTitleSelected: {
    color: '#166534',
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginLeft: 28,
  },
  detailsBox: {
    marginTop: 12,
    marginLeft: 28,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  payerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  payerBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  payerBtnActive: {
    borderColor: '#15803D',
    backgroundColor: '#15803D',
  },
  payerBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  payerBtnTextActive: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    flex: 1.6,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
