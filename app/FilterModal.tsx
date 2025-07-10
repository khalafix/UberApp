import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// TypeScript props type
type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    status: string;
    fromDate: Date | null;
    toDate: Date | null;
  }) => void;
};

const statuses = ['All', 'In Progress', 'Completed', 'Rejected'];

export default function FilterModal({
  visible,
  onClose,
  onApply,
}: FilterModalProps) {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const resetFilters = () => {
    setSelectedStatus('All');
    setFromDate(null);
    setToDate(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Status */}
          <Text style={styles.label}>Status</Text>
          {statuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={styles.radioRow}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={styles.radioLabel}>{status}</Text>
              <View
                style={[
                  styles.radioOuter,
                  selectedStatus === status && styles.radioOuterSelected,
                ]}
              >
                {selectedStatus === status && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* Choose Duration */}
          <Text style={[styles.label, { marginTop: 20 }]}>
            Choose Duration
          </Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowFromPicker(true)}
            onLongPress={() => setShowToPicker(true)}
          >
            <Text style={styles.dateText}>
              {fromDate ? fromDate.toLocaleDateString() : 'MM/DD/YY'} -{' '}
              {toDate ? toDate.toLocaleDateString() : 'MM/DD/YY'}
            </Text>
            <Feather name="calendar" size={16} color="#6B7280" />
          </TouchableOpacity>

          {/* From Date Picker */}
          {showFromPicker && (
            <DateTimePicker
              value={fromDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowFromPicker(Platform.OS === 'ios');
                if (selectedDate) setFromDate(selectedDate);
              }}
            />
          )}

          {/* To Date Picker */}
          {showToPicker && (
            <DateTimePicker
              value={toDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowToPicker(Platform.OS === 'ios');
                if (selectedDate) setToDate(selectedDate);
              }}
            />
          )}

          {/* Footer Buttons */}
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                onApply({ status: selectedStatus, fromDate, toDate });
                onClose();
              }}
            >
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
    fontWeight: '500',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 15,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  dateInput: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  dateText: {
    color: '#6B7280',
  },
  footerButtons: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 12,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetText: {
    color: '#111',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: {
    color: 'white',
    fontWeight: '600',
  },
});
