import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const countries = [
    {
        name: 'United Arab Emirates',
        emoji: '🏝️',
    },
    {
        name: 'Kingdom of Saudi Arabia',
        emoji: '🕌',
    },
];

const countryRequirements: { [country: string]: string[] } = {
    'United Arab Emirates': [
        'Copy of Passport',
        'Passport Size Photo',
        'Passport & UAE Residency of a Relative',
        'Flight Tickets & Hotel Booking',
    ],
    'Kingdom of Saudi Arabia': [
        'Copy of Passport',
        'Passport Size Photo',
        'GCC Residency (If applicable)',
    ],
};

const requirementDetailsByCountry: {
    [country: string]: { [requirement: string]: string };
} = {
    'United Arab Emirates': {
        'Copy of Passport': 'Each visitors passport should be valid for a minimum of 6 months.',
        'Passport Size Photo': 'Each visitors passport-size photograph,taken against a white background.',
        'Passport & UAE Residency of a Relative': 'For some nationalities, applicants must submit a passport copy and GCC residency of an immediate relative.',
        'Flight Tickets & Hotel Booking': 'Submit round-trip flight tickets and a confirmed hotel reservation.',
    },
    'Kingdom of Saudi Arabia': {
        'Copy of Passport': 'Each visitors passport should be valid for a minimum of 6 months.',
        'Passport Size Photo': 'Each visitors passport-size photograph,taken against a white background.',
        'GCC Residency (If applicable)': 'A copy of GCC Residency shoild be valid for a minimum of 6 months.',
    },
};

const VisitVisaScreen = () => {
    const [expandedRequirements, setExpandedRequirements] = useState<{ [key: number]: boolean }>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>

            <View style={{ flex: 1 }}>
                <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 180 }}>
                    <>
                        {/* Top stack header with close button */}
                        {/* Close Button Top Right */}
                        <TouchableOpacity style={styles.closeButton} onPress={() => router.replace('/')}>
                            <Ionicons name="close" size={28} color="#000" />
                        </TouchableOpacity>
                        <Stack.Screen
                            options={{
                                title: 'Visit Visa',
                                headerRight: () => (
                                    <Pressable onPress={() => router.back()} style={{ paddingRight: 16 }}>
                                        <Ionicons name="close" size={24} color="#000" />
                                    </Pressable>
                                ),
                            }}
                        />

                        <Text style={styles.title}>Visit Visa</Text>
                        <Text style={styles.subtitle}>Where are you going to?</Text>

                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={styles.selectorText}>{selectedCountry.emoji} {selectedCountry.name}</Text>
                            <Ionicons name="chevron-forward-outline" size={20} color="#000" />
                        </TouchableOpacity>

                        <View style={styles.requirementsBox}>
                            <Text style={styles.requirementsTitle}>Requirements for {selectedCountry.name} Visa</Text>
                            <Text style={styles.requirementsSubtitle}>
                                Visitors must be out of {selectedCountry.name.includes('Emirates') ? 'the UAE' : 'the country'} while applying for a UAE visa.
                            </Text>

                            <View style={{ marginTop: 12 }}>
                                {countryRequirements[selectedCountry.name]?.map((item, index) => {
                                    const isExpanded = expandedRequirements[index];
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.requirementItemContainer}
                                            onPress={() =>
                                                setExpandedRequirements((prev) => ({
                                                    ...prev,
                                                    [index]: !prev[index],
                                                }))
                                            }
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.requirementRow}>
                                                <View style={styles.requirementLeft}>
                                                    <Ionicons
                                                        name="document-text-outline"
                                                        size={20}
                                                        color="#444"
                                                        style={{ marginRight: 10 }}
                                                    />
                                                    <Text style={styles.requirementText}>{item}</Text>
                                                </View>
                                                <Ionicons
                                                    name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                                                    size={18}
                                                    color="#888"
                                                />
                                            </View>

                                            {isExpanded && (
                                                <Text style={styles.expandedText}>
                                                    {requirementDetailsByCountry[selectedCountry.name]?.[item] || 'No additional information available.'}                                    </Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                        <Modal
                            visible={modalVisible}
                            transparent
                            animationType="slide"
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Where are you going?</Text>

                                    <FlatList
                                        data={countries}
                                        keyExtractor={(item) => item.name}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={[
                                                    styles.modalOption,
                                                    item.name === selectedCountry.name && styles.modalOptionSelected,
                                                ]}
                                                onPress={() => {
                                                    setSelectedCountry(item);
                                                    setExpandedRequirements({});
                                                    setModalVisible(false);
                                                }}
                                            >
                                                <Text style={styles.modalOptionText}>{item.emoji}  {item.name}</Text>
                                                {item.name === selectedCountry.name && (
                                                    <Ionicons name="checkmark" size={18} color="#007AFF" />
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    />

                                    <TouchableOpacity
                                        style={styles.modalClose}
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <Ionicons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

                    </>
                </ScrollView>
                {/* Bottom Bar */}
                <View style={styles.footer}>
                    <View style={styles.footerContainer}>
                        <View style={styles.buttonWrapper}>
                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={() =>
                                    router.push({
                                        pathname: '/VisitVisaDetailsScreen',
                                        params: {
                                            selectedCountry: selectedCountry.name,
                                        },
                                    })
                                }
                            >
                                <Text style={styles.nextButtonText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.footerTabs}>
                            <View style={styles.footerTabItem}>
                                <Text style={styles.footerTabIcon}>🌐</Text>
                                <Text style={styles.footerTabLabelActive}>New Visa</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.footerTabItem}
                                onPress={() => router.push('/Track')}
                            >
                                <View style={styles.footerTabItem}>
                                    <Text style={styles.footerTabIcon}>🕓</Text>
                                    <Text style={styles.footerTabLabelInactive}>Visa Status</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 0,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderColor: "#eee",
    },
    container:
    {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        marginTop: 0,
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 20,
        zIndex: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: '600',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
    },
    selector: {
        borderWidth: 1,
        borderColor: '#cc3093',
        borderRadius: 10,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    selectorText: {
        fontSize: 16,
    },
    requirementsBox: {
        marginBottom: 30,
    },
    requirementsTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    requirementsSubtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    requirementItemContainer: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    requirementRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requirementLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    requirementText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
    },
    expandedText: {
        marginTop: 6,
        marginLeft: 30,
        fontSize: 15,
        color: '#555',
    },
    footerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 20,

    },
    nextButton: {
        backgroundColor: '#cc3093',
        paddingVertical: 14,
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    buttonWrapper: {
        width: '100%',
        paddingHorizontal: 20,
    },
    footerTabs: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        marginTop: 10,
    },
    footerTabItem: {
        alignItems: 'center',
        flex: 1,
    },
    footerTabIcon: {
        fontSize: 20,
    },
    footerTabLabelActive: {
        color: '#2E77FF',
        fontSize: 13,
        marginTop: 2,
    },
    footerTabLabelInactive: {
        color: '#ccc',
        fontSize: 13,
        marginTop: 2,
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '50%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalOption: {
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalOptionSelected: {
        borderWidth: 1.5,
        borderColor: '#007AFF',
        backgroundColor: '#eef5ff',
    },
    modalOptionText: {
        fontSize: 16,
    },
    modalClose: {
        position: 'absolute',
        right: 20,
        top: 20,
    },
});

export default VisitVisaScreen;