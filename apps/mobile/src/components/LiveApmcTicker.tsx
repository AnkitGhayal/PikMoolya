import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Language } from '../utils/i18n';

interface LiveApmcTickerProps {
  language: Language;
}

export const LiveApmcTicker: React.FC<LiveApmcTickerProps> = ({ language }) => {
  const isMr = language === 'mr';

  const livePrices = [
    { crop: isMr ? 'गहू (शरबती)' : 'Wheat (Sharbati)', mandi: 'Pune APMC', price: '₹2,450 / q', change: '+2.4%' },
    { crop: isMr ? 'तांदूळ (बासमती)' : 'Rice (Basmati)', mandi: 'Nashik APMC', price: '₹3,200 / q', change: '+1.8%' },
    { crop: isMr ? 'सोयाबीन (पिवळा)' : 'Soybean (Yellow)', mandi: 'Latur APMC', price: '₹4,400 / q', change: '+3.1%' },
    { crop: isMr ? 'हरभरा (चना)' : 'Gram (Chana)', mandi: 'Nagpur APMC', price: '₹5,100 / q', change: '+0.9%' },
    { crop: isMr ? 'कांदा (लाल)' : 'Onion (Red)', mandi: 'Lasalgaon APMC', price: '₹1,950 / q', change: '-1.2%' },
    { crop: isMr ? 'ज्वारी (मालदांडी)' : 'Jowar (Maldandi)', mandi: 'Solapur APMC', price: '₹2,850 / q', change: '+1.5%' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        <View style={styles.pulseDot} />
        <Text style={styles.badgeText}>
          {isMr ? 'थेट APMC आधारभूत दर' : 'LIVE APMC BENCHMARKS'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {livePrices.map((lp, idx) => (
          <View key={idx} style={styles.tickerItem}>
            <Text style={styles.cropText}>{lp.crop}</Text>
            <Text style={styles.priceText}>{lp.price}</Text>
            <Text
              style={[
                styles.changeText,
                lp.change.startsWith('+') ? styles.changeUp : styles.changeDown,
              ]}
            >
              {lp.change}
            </Text>
            {idx < livePrices.length - 1 && <Text style={styles.separator}>•</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 7,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4ADE80',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scrollList: {
    alignItems: 'center',
    paddingRight: 16,
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  cropText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
    marginRight: 4,
  },
  priceText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    marginRight: 4,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  changeUp: {
    color: '#4ADE80',
  },
  changeDown: {
    color: '#F87171',
  },
  separator: {
    color: '#475569',
    marginLeft: 10,
    fontSize: 12,
  },
});
