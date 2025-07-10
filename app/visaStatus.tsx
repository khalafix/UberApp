import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterModal from './FilterModal';

export default function VisaStatusScreen() {
    const router = useRouter();
    const [isFilterVisible, setFilterVisible] = useState(false);
    return (
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
        
        <View style={styles.container}>
            <View style={styles.header}>
        
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Feather name="more-horizontal" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Feather name="x" size={20} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.filterRow}>
                <TouchableOpacity style={styles.filterButton}>
                    <Text style={styles.filterText}>All</Text>
                    <Feather name="chevron-down" size={14} color="#6B7280" />
                </TouchableOpacity>
                  <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => {
                            console.log('Filter button pressed');
                            setFilterVisible(true);
                        }}
                    >
                        <Text style={styles.filterText}>Select Duration</Text>
                        <Feather name="calendar" size={14} color="#6B7280" />
                    </TouchableOpacity>

                             <FilterModal
                        visible={isFilterVisible}
                        onClose={() => setFilterVisible(false)}
                        onApply={(filters) => {
                            console.log('Filters applied:', filters);
                            setFilterVisible(false);
                        }}
                    />
            </View>

            <View style={styles.emptyState}>
                <Image
                    source={require('../assets/images/5470280.png')} // You should have this icon in your assets
                    style={styles.emptyImage}
                    resizeMode="contain"
                />
                <Text style={styles.emptyText}>
                    You currently don’t have any pending applications.
                </Text>
            </View>
        </View>

        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '600',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    headerIcon: {
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 6,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 24,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
    },
    filterText: {
        marginRight: 6,
        color: '#6B7280',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyImage: {
        width: 160,
        height: 160,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        maxWidth: 280,
    },
});
