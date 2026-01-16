import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function App() {
  const [mode, setMode] = useState('select');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [results, setResults] = useState(null);

  const calculateCosts = () => {
    if (!buyPrice || !sellPrice || !quantity) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const buyPriceNum = parseFloat(buyPrice);
    const sellPriceNum = parseFloat(sellPrice);
    const quantityNum = parseFloat(quantity);

    if (!Number.isFinite(buyPriceNum) || !Number.isFinite(sellPriceNum) || !Number.isFinite(quantityNum)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    if (buyPriceNum <= 0 || sellPriceNum <= 0 || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter positive numbers');
      return;
    }

    const buyAmount = buyPriceNum * quantityNum;
    const sellAmount = sellPriceNum * quantityNum;
    const grossProfit = sellAmount - buyAmount;

    let totalBrokerage, stt, stampDuty, exchangeAndRegFees, dpCharges, gst, totalCosts, incomeTaxRate, buyBrokerage, sellBrokerage;

    if (mode === 'intraday') {
      // Intraday calculations
      buyBrokerage = Math.max(5, Math.min(20, buyAmount * 0.001));
      sellBrokerage = Math.max(5, Math.min(20, sellAmount * 0.001));
      totalBrokerage = buyBrokerage + sellBrokerage;
      stt = sellAmount * 0.00025; // 0.025% on sell
      stampDuty = buyAmount * 0.00003; // ~0.003% on buy
      exchangeAndRegFees = (buyAmount + sellAmount) * 0.00003; // ~0.003% on turnover
      dpCharges = 18; // rough
      gst = (totalBrokerage + dpCharges) * 0.18;
      incomeTaxRate = 0.3; // approximate 30%
    } else if (mode === 'delivery') {
      // Delivery calculations
      buyBrokerage = 0;
      sellBrokerage = 0;
      totalBrokerage = 0; // zero brokerage
      stt = (buyAmount + sellAmount) * 0.001; // 0.1% on buy and sell
      stampDuty = buyAmount * 0.00015; // 0.015% on buy
      exchangeAndRegFees = (buyAmount + sellAmount) * 0.0000345; // 0.00345%
      const sebi = (buyAmount + sellAmount) * 0.000001; // 0.0001%
      dpCharges = 15.93; // fixed per sell
      gst = (exchangeAndRegFees + sebi) * 0.18; // 18% on exchange + sebi
      incomeTaxRate = 0.2; // STCG 20%
    }

    totalCosts = totalBrokerage + stt + stampDuty + exchangeAndRegFees + dpCharges + gst;
    const netProfitAfterCosts = grossProfit - totalCosts;
    const incomeTaxOnProfit = Math.max(0, netProfitAfterCosts * incomeTaxRate);
    const netProfitAfterTax = netProfitAfterCosts - incomeTaxOnProfit;

    setResults({
      buyAmount: buyAmount.toFixed(2),
      sellAmount: sellAmount.toFixed(2),
      grossProfit: grossProfit.toFixed(2),
      profitMargin: ((grossProfit / buyAmount) * 100).toFixed(2),
      costs: {
        buyBrokerage: buyBrokerage.toFixed(2),
        sellBrokerage: sellBrokerage.toFixed(2),
        stt: stt.toFixed(2),
        stampDuty: stampDuty.toFixed(2),
        exchangeAndRegFees: exchangeAndRegFees.toFixed(2),
        dpCharges: dpCharges.toFixed(2),
        gst: gst.toFixed(2),
        totalCosts: totalCosts.toFixed(2),
      },
      costPercentage: ((totalCosts / buyAmount) * 100).toFixed(2),
      netProfitAfterCosts: netProfitAfterCosts.toFixed(2),
      incomeTax: incomeTaxOnProfit.toFixed(2),
      incomeTaxRate: incomeTaxRate,
      netProfitAfterTax: netProfitAfterTax.toFixed(2),
    });
  };

  const resetForm = () => {
    setBuyPrice('');
    setSellPrice('');
    setQuantity('');
    setResults(null);
  };

  if (mode === 'select') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.selectContainer}>
          <Text style={styles.selectTitle}>Select Trading Type</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setMode('intraday')}>
            <Text style={styles.selectButtonText}>Intraday</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectButton} onPress={() => setMode('delivery')}>
            <Text style={styles.selectButtonText}>Delivery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {mode !== 'select' && (
          <TouchableOpacity onPress={() => setMode('select')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>
          {mode === 'intraday' ? 'Intraday ETF Profit Calculator' : mode === 'delivery' ? 'Delivery ETF Profit Calculator' : 'Stock Calculator'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'intraday' ? 'Net profit after charges + (approx) income tax' : mode === 'delivery' ? 'Net profit after charges + STCG tax (approx)' : 'Select trading type'}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Buy Price (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Buying price per unit"
            keyboardType="decimal-pad"
            value={buyPrice}
            onChangeText={setBuyPrice}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sell Price (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Selling price per unit"
            keyboardType="decimal-pad"
            value={sellPrice}
            onChangeText={setSellPrice}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantity (Units)</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of units"
            keyboardType="decimal-pad"
            value={quantity}
            onChangeText={setQuantity}
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.primary]} onPress={calculateCosts}>
            <Text style={styles.buttonText}>Calculate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.danger]} onPress={resetForm}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {results && (
        <View style={styles.results}>
          <Text style={styles.sectionTitle}>Results</Text>

          <View style={styles.box}>
            <Row label="Investment" value={`₹${results.buyAmount}`} />
            <Row label="Sale" value={`₹${results.sellAmount}`} />
            <Row label="Gross Profit" value={`₹${results.grossProfit} (${results.profitMargin}%)`} highlight />
          </View>

          <View style={styles.box}>
            <Text style={styles.boxTitle}>Cost Breakdown</Text>
            <Row label="Buy Brokerage" value={`₹${results.costs.buyBrokerage}`} cost />
            <Row label="Sell Brokerage" value={`₹${results.costs.sellBrokerage}`} cost />
            <Row label="STT (0.025% sell)" value={`₹${results.costs.stt}`} cost />
            <Row label="Stamp Duty (0.003% buy)" value={`₹${results.costs.stampDuty}`} cost />
            <Row label="Exchange + SEBI Fees" value={`₹${results.costs.exchangeAndRegFees}`} cost />
            <Row label="DP Charges" value={`₹${results.costs.dpCharges}`} cost />
            <Row label="GST (18%)" value={`₹${results.costs.gst}`} cost />
            <View style={styles.divider} />
            <Row label="Total Costs" value={`₹${results.costs.totalCosts} (${results.costPercentage}%)`} cost strong />
          </View>

          <View style={styles.box}>
            <Text style={styles.boxTitle}>Net</Text>
            <Row label="After Costs" value={`₹${results.netProfitAfterCosts}`} strong />
            <Row label={`Income Tax (~${(results.incomeTaxRate * 100).toFixed(0)}%)`} value={`₹${results.incomeTax}`} cost />
            <View style={styles.divider} />
            <Row label="Final Net" value={`₹${results.netProfitAfterTax}`} strong />
          </View>

          <View style={styles.note}>
            <Text style={styles.noteTitle}>Notes</Text>
            {mode === 'intraday' ? (
              <>
                <Text style={styles.noteText}>• Income tax is approximate (depends on your slab).</Text>
                <Text style={styles.noteText}>• DP charges can vary / sometimes waived.</Text>
                <Text style={styles.noteText}>• Bid-ask spread not included.</Text>
              </>
            ) : (
              <>
                <Text style={styles.noteText}>• STCG tax at 20% if held {'<'}1 year; LTCG lower if {'>'}1 year.</Text>
                <Text style={styles.noteText}>• DP charges fixed at ₹15.93 per sell.</Text>
                <Text style={styles.noteText}>• Bid-ask spread not included.</Text>
              </>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function Row({ label, value, cost, strong, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, highlight && styles.highlightLabel]}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          cost && styles.costValue,
          strong && styles.strongValue,
          highlight && styles.highlightValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 12, paddingBottom: 40 },

  header: {
    backgroundColor: '#2c3e50',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#ecf0f1', fontSize: 13 },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  inputGroup: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#2c3e50', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2c3e50',
  },

  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  primary: { backgroundColor: '#27ae60' },
  danger: { backgroundColor: '#e74c3c' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  results: { marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2c3e50', marginBottom: 10 },

  box: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  boxTitle: { fontSize: 15, fontWeight: '800', color: '#2c3e50', marginBottom: 10 },

  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { fontSize: 13, color: '#34495e', flex: 1, paddingRight: 10 },
  rowValue: { fontSize: 13, color: '#2c3e50', fontWeight: '600' },
  costValue: { color: '#e74c3c' },
  strongValue: { fontSize: 14, fontWeight: '800' },
  highlightLabel: { fontWeight: '700' },
  highlightValue: { color: '#27ae60', fontWeight: '800' },

  divider: { height: 1, backgroundColor: '#ecf0f1', marginVertical: 8 },

  note: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 14,
  },
  noteTitle: { fontSize: 14, fontWeight: '800', color: '#856404', marginBottom: 8 },
  noteText: { fontSize: 12, color: '#856404', lineHeight: 18 },

  backButton: { marginBottom: 10 },
  backButtonText: { color: '#fff', fontSize: 16 },
  selectContainer: { alignItems: 'center' },
  selectTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  selectButton: { backgroundColor: '#27ae60', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, marginVertical: 10, width: 200, alignItems: 'center' },
  selectButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
