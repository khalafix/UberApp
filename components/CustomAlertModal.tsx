import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomAlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
}

export default function CustomAlertModal({
    visible,
    title,
    message,
    type = 'info',
    onClose,
}: CustomAlertModalProps) {

    const getColor = () => {
        switch (type) {
            case 'success':
                return '#4CAF50';
            case 'error':
                return '#F44336';
            case 'warning':
                return '#FF9800';
            default:
                return '#2196F3';
        }
    };

    const getIcon = (): keyof typeof MaterialIcons.glyphMap => {
        switch (type) {
            case 'success':
                return 'check-circle-outline';
            case 'error':
                return 'error-outline';
            case 'warning':
                return 'warning-amber';
            default:
                return 'info-outline';
        }
    };

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.container}>

                    {/* ✅ ICON */}
                    <View style={[styles.iconWrapper, { backgroundColor: getColor() + '20' }]}>
                        <MaterialIcons name={getIcon()} size={50} color={getColor()} />
                    </View>

                    {/* ✅ TITLE */}
                    <Text style={[styles.title, { color: getColor() }]}>
                        {title}
                    </Text>

                    {/* ✅ MESSAGE */}
                    <Text style={styles.message}>
                        {message}
                    </Text>

                    {/* ✅ BUTTON */}
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: getColor() }]}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    container: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
    },

    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 10,
    },

    message: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },

    button: {
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 12,
    },

    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});