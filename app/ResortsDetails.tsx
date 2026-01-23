import { ResortsSchema } from "@/lib/schemas/resortsSchema";
import { useStore } from "@/stores/store";
import { Feather, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button, Card, TextInput } from "react-native-paper";
import PhoneInput from "react-native-phone-number-input";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";

/* ================= Types ================= */

type Props = {
    price?: number;
};

type PickerType =
    | "checkInDate"
    | "checkOutDate"
    | "checkInTime"
    | "checkOutTime"
    | null;

/* ================= Counter Component ================= */

type CounterProps = {
    value: number;
    min: number;
    onIncrease: () => void;
    onDecrease: () => void;
};

const Counter = ({ value, min, onIncrease, onDecrease }: CounterProps) => {
    return (
        <View style={styles.counterContainer}>
            <TouchableOpacity
                style={[
                    styles.counterButton,
                    value <= min && styles.counterButtonDisabled,
                ]}
                onPress={onDecrease}
                disabled={value <= min}
            >
                <Ionicons name="remove" size={18} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.counterValue}>{value}</Text>

            <TouchableOpacity
                style={styles.counterButton}
                onPress={onIncrease}
            >
                <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

/* ================= Screen ================= */

const ResortsDetails: React.FC<Props> = ({ price = 100 }) => {
    const [checkInDate, setCheckInDate] = useState(new Date());
    const [checkOutDate, setCheckOutDate] = useState(new Date());
    const [checkInTime, setCheckInTime] = useState(new Date());
    const [checkOutTime, setCheckOutTime] = useState(new Date());

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [pickerMode, setPickerMode] = useState<"date" | "time" | null>(null);
    const [activePicker, setActivePicker] = useState<PickerType>(null);

    const [soonVisible, setSoonVisible] = useState(false);

    const { bookingStore, serviceStore } = useStore();
    const [selectedPrice, setSelectedPrice] = useState<number>(0);
    const serviceId = "414D40E9-3BDD-4DCD-868F-08DDF80D14F5";

    useEffect(() => {
        serviceStore.getService(serviceId);
    }, []);

    useEffect(() => {
        if (serviceStore.currentService?.price) {
            setSelectedPrice(Number(serviceStore.currentService.price));
        }
    }, [serviceStore.currentService?.id]);

    const [errors, setErrors] = useState<{
        name?: string;
        phone?: string;
        email?: string;
        adults?: string;
    }>({});

    const [touched, setTouched] = useState<{
        name?: boolean;
        phone?: boolean;
        email?: boolean;
        adults?: boolean;
    }>({});

    const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;
    const isTimeDiffValid = checkOutTime.getTime() - checkInTime.getTime() >= SIX_HOURS_IN_MS;

    const openPicker = (type: PickerType, mode: "date" | "time") => {
        setActivePicker(type);
        setPickerMode(mode);
    };

    const onPickerChange = (_: any, selectedDate?: Date) => {
        if (!selectedDate || !activePicker) {
            setPickerMode(null);
            setActivePicker(null);
            return;
        }

        if (activePicker === "checkInDate") setCheckInDate(selectedDate);
        else if (activePicker === "checkOutDate") setCheckOutDate(selectedDate);
        else if (activePicker === "checkInTime") {
            const minCheckIn = new Date(checkOutTime.getTime() - SIX_HOURS_IN_MS);
            if (selectedDate > minCheckIn) {
                setCheckOutTime(new Date(selectedDate.getTime() + SIX_HOURS_IN_MS));
            }
            setCheckInTime(selectedDate);
        } else if (activePicker === "checkOutTime") {
            const minCheckOut = new Date(checkInTime.getTime() + SIX_HOURS_IN_MS);
            if (selectedDate < minCheckOut) {
                setCheckOutTime(minCheckOut);
            } else {
                setCheckOutTime(selectedDate);
            }
        }

        setPickerMode(null);
        setActivePicker(null);
    };

    const formatTime = (date: Date) =>
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!name.trim()) newErrors.name = "Name is required.";
        if (!phone.trim()) newErrors.phone = "Phone number is required.";
        else if (phone.replace(/\D/g, "").length < 8)
            newErrors.phone = "Phone number is too short.";

        if (!email.trim()) newErrors.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            newErrors.email = "Email is invalid.";

        if (adults < 1) newErrors.adults = "At least one adult is required.";

        return newErrors;
    };

    const onBookNow = async () => {
        const validationErrors = validate();
        setErrors(validationErrors);
        setTouched({
            name: true,
            phone: true,
            email: true,
            adults: true,
        });

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {
            const data: ResortsSchema = {
                customerName: name,
                phone,
                email,
                checkInDate: checkInDate.toISOString().split("T")[0],
                checkOutDate: checkOutDate.toISOString().split("T")[0],
                checkInTime: formatTime(checkInTime),
                checkOutTime: formatTime(checkOutTime),
                adults,
                children,
                totalPrice: selectedPrice,
                serviceId,
            };

            const result = await bookingStore.addBooking(data);

            if (result?.status === "success") {
                alert("Booking successful!");
                router.push(`/OtherCheckout/${result.data}`);
            } else {
                alert("Booking failed");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >
                {/* Header */}
                <View style={styles.appheader}>
                    <Text style={styles.headerTitle}>Resorts Booking</Text>
                    <Ionicons name="close" size={24} onPress={() => router.back()} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Dates */}
                    <Card style={styles.card}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="calendar" size={16} color="#cc3093" /> Booking Dates
                        </Text>

                        <TouchableOpacity
                            style={styles.field}
                            onPress={() => openPicker("checkInDate", "date")}
                        >
                            <Text>Check-in</Text>
                            <Text>{checkInDate.toDateString()}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.field}
                            onPress={() => openPicker("checkOutDate", "date")}
                        >
                            <Text>Check-out</Text>
                            <Text>{checkOutDate.toDateString()}</Text>
                        </TouchableOpacity>
                    </Card>

                    {/* Time */}
                    <Card style={styles.card}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="clock" size={16} color="#cc3093" /> Time
                        </Text>

                        <TouchableOpacity
                            style={styles.field}
                            onPress={() => openPicker("checkInTime", "time")}
                        >
                            <Text>Check-in</Text>
                            <Text>{formatTime(checkInTime)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.field}
                            onPress={() => openPicker("checkOutTime", "time")}
                        >
                            <Text>Check-out</Text>
                            <Text>{formatTime(checkOutTime)}</Text>
                        </TouchableOpacity>

                        {!isTimeDiffValid && (
                            <View style={styles.noteContainer}>
                                <Icon name="info" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
                                <Text style={styles.noteText}>
                                    Check-out time must be at least 6 hours after check-in time.
                                </Text>
                            </View>
                        )}
                    </Card>

                    {/* Guests & Contact */}
                    <Card style={styles.card}>
                        <Text style={styles.sectionTitle}>
                            <Icon name="users" size={16} color="#cc3093" /> Guests
                        </Text>

                        <View style={styles.guestCountersRow}>
                            <View style={styles.guestCounter}>
                                <Text style={styles.label}>Adults</Text>
                                <Counter
                                    value={adults}
                                    min={1}
                                    onIncrease={() => setAdults(adults + 1)}
                                    onDecrease={() => setAdults(Math.max(1, adults - 1))}
                                />
                                {errors.adults && touched.adults && (
                                    <Text style={styles.errorText}>{errors.adults}</Text>
                                )}
                            </View>

                            <View style={styles.guestCounter}>
                                <Text style={styles.label}>Children</Text>
                                <Counter
                                    value={children}
                                    min={0}
                                    onIncrease={() => setChildren(children + 1)}
                                    onDecrease={() => setChildren(Math.max(0, children - 1))}
                                />
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                            <Icon name="users" size={16} color="#cc3093" /> Contact Details
                        </Text>

                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (errors.name) {
                                    setErrors((prev) => ({ ...prev, name: undefined }));
                                }
                            }}
                            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                            placeholder="John Doe"
                            mode="flat"
                            underlineColor="transparent"
                            activeUnderlineColor="transparent"
                            style={[
                                styles.input,
                                errors.name && touched.name ? styles.inputError : null,
                            ]}
                        />
                        {errors.name && touched.name && (
                            <Text style={styles.errorText}>{errors.name}</Text>
                        )}

                        <Text style={styles.label}>Phone Number</Text>
                        <PhoneInput
                            defaultValue={phone}
                            defaultCode="AE"
                            layout="first"
                            onChangeFormattedText={(text) => {
                                setPhone(text);
                                if (errors.phone) {
                                    setErrors((prev) => ({ ...prev, phone: undefined }));
                                }
                            }}
                            containerStyle={[
                                styles.phoneContainer,
                                errors.phone && touched.phone ? styles.inputError : null,
                            ]}
                            textContainerStyle={styles.phoneTextContainer}
                            textInputStyle={styles.phoneTextInput}
                        />
                        {errors.phone && touched.phone && (
                            <Text style={styles.errorText}>{errors.phone}</Text>
                        )}

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) {
                                    setErrors((prev) => ({ ...prev, email: undefined }));
                                }
                            }}
                            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="john@example.com"
                            mode="flat"
                            underlineColor="transparent"
                            activeUnderlineColor="transparent"
                            style={[
                                styles.input,
                                errors.email && touched.email ? styles.inputError : null,
                            ]}
                        />
                        {errors.email && touched.email && (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        )}
                    </Card>

                    {/* Price */}
                    <Card style={styles.priceCard}>
                        <Text style={styles.priceText}>Total Price</Text>
                        <Text style={styles.price}>AED {selectedPrice}</Text>
                    </Card>

                    <Button
                        mode="contained"
                        style={styles.button}
                        //onPress={onBookNow}
                        onPress={() => setSoonVisible(true)}
                    >
                        Book Now
                    </Button>
                </ScrollView>

                <Modal
                    transparent
                    animationType="fade"
                    visible={soonVisible}
                    onRequestClose={() => setSoonVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.iconWrapper}>
                                <Feather name="clock" size={42} color="#cc3093" />
                            </View>

                            <Text style={styles.modalTitle}>Coming Soon</Text>

                            <Text style={styles.modalText}>
                                This feature will be available soon.{'\n'}
                                Stay connected 🚀
                            </Text>

                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setSoonVisible(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.modalButtonText}>Got it</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {pickerMode && (
                    <DateTimePicker
                        value={
                            activePicker === "checkInDate"
                                ? checkInDate
                                : activePicker === "checkOutDate"
                                    ? checkOutDate
                                    : activePicker === "checkInTime"
                                        ? checkInTime
                                        : checkOutTime
                        }
                        mode={pickerMode}
                        onChange={onPickerChange}
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ResortsDetails;

/* ================= Styles ================= */

const INPUT_HEIGHT = 48;

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#fafafa" },
    container: { padding: 20 },

    appheader: {
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    headerTitle: { fontSize: 22, fontWeight: "800" },

    card: {
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        backgroundColor: "#fff",
        elevation: 4,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
    },

    label: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 6,
        color: "#666",
    },

    input: {
        height: INPUT_HEIGHT,
        backgroundColor: "#fafafa",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingHorizontal: 12,
        fontSize: 14,
    },

    inputError: {
        borderColor: "#e63946",
    },

    phoneContainer: {
        height: INPUT_HEIGHT,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fafafa",
    },

    phoneTextContainer: {
        backgroundColor: "#fafafa",
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        paddingVertical: 0,
    },

    phoneTextInput: {
        height: INPUT_HEIGHT - 2,
        fontSize: 14,
    },

    field: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },

    counterContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fafafa",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
    },

    counterButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#cc3093",
        justifyContent: "center",
        alignItems: "center",
    },

    counterButtonDisabled: {
        backgroundColor: "#ccc",
    },

    counterValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
        marginHorizontal: 10,
        textAlign: "center",
        minWidth: 24,
    },

    priceCard: {
        padding: 18,
        borderRadius: 18,
        backgroundColor: "#e0a4caff",
        alignItems: "center",
    },

    priceText: { color: "#fff", fontSize: 14 },
    price: { color: "#fff", fontSize: 26, fontWeight: "800" },

    button: {
        marginTop: 22,
        borderRadius: 16,
        backgroundColor: "#cc3093",
        paddingVertical: 12,
    },

    errorText: {
        color: "#e63946",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },

    guestCountersRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    guestCounter: {
        flex: 1,
        marginHorizontal: 5,
    },

    noteContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#dbeafe",
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: "#3b82f6",
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    noteText: {
        color: "#1e40af",
        fontSize: 14,
        fontWeight: "600",
        flexShrink: 1,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingVertical: 30,
        paddingHorizontal: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },

    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fbe6f3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },

    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
        marginBottom: 10,
        fontFamily: 'PentaRounded-SemiBold',
    },

    modalText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 25,
    },

    modalButton: {
        backgroundColor: '#cc3093',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 14,
        shadowColor: '#cc3093',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 5,
    },

    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
