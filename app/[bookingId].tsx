import { useStore } from '@/stores/store';
import { ServiceData } from '@/types/service';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

type PassportData = {
  passportNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  issueDate?: string;
  expiryDate?: string;
};

export default function DocumentUploadScreen() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [uploadedFilesByApplicant, setUploadedFilesByApplicant] = useState<
    { [key: string]: { name: string; uri: string; type: string } }[]
  >([]);
  const { bookingStore, serviceStore } = useStore();
  const [service, setService] = useState<ServiceData | null>(null);
  const [applicantNumber, setApplicantNumber] = useState<number>(0);
  const [activeApplicantIndex, setActiveApplicantIndex] = useState(0);
  const { bookingId } = useLocalSearchParams();
  const id = bookingId as string;
  const insets = useSafeAreaInsets();
  const [passportDataByApplicant, setPassportDataByApplicant] = useState<PassportData[]>([]);

  // Passport OCR fields
  const [fullName, setFullName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [dateOfExpiry, setDateOfExpiry] = useState('');
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [showPassportFields, setShowPassportFields] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      const booking = await bookingStore.getBooking(id);
      if (booking?.serviceId) {
        const applicantCount = (booking.adultsNumber ?? 0) + (booking.childrenNumber ?? 0);
        setApplicantNumber(applicantCount);
        setUploadedFilesByApplicant(Array(applicantCount).fill({}));
        const service = await serviceStore.getService(booking.serviceId);
        if (service) setService(service);
      }
    };
    fetchBooking();
  }, [id]);

  const requiredDocs = service?.requiredFiles?.filter((doc) => doc.toLowerCase() !== 'photo') || [];
  const uploadedFiles = uploadedFilesByApplicant[activeApplicantIndex] || {};

  const updateFileForApplicant = (fieldName: string, fileData: { name: string; uri: string; type: string }) => {
    setUploadedFilesByApplicant((prev) => {
      const updated = [...prev];
      updated[activeApplicantIndex] = {
        ...(updated[activeApplicantIndex] || {}),
        [fieldName]: fileData,
      };
      return updated;
    });

    // Show passport fields only after OCR completes
  };

  const deleteFileForApplicant = (fieldName: string) => {
    setUploadedFilesByApplicant((prev) => {
      const updated = [...prev];
      const files = { ...(updated[activeApplicantIndex] || {}) };
      delete files[fieldName];
      updated[activeApplicantIndex] = files;
      return updated;
    });

    if (fieldName === 'Passport Copy') setShowPassportFields(false);
  };

  const handlePickFile = async (fieldName: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      const fileUri = result.assets?.[0]?.uri;
      const name = result.assets?.[0]?.name;
      if (!fileUri || !name) return;

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) return;

      const type = name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
      updateFileForApplicant(fieldName, { name, uri: fileUri, type });

      if (fieldName === 'Passport Copy') {
        await processOCR({ uri: fileUri, type, name }, fieldName);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleTakePhoto = async (fieldName: string) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        quality: 1,
        base64: false,
      });

      if (result.canceled) return;

      const photo = result.assets?.[0];
      const fileUri = photo?.uri;
      const name = fileUri?.split('/').pop() ?? 'photo.jpg';
      if (!fileUri) return;

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) return;

      const type = 'image/jpeg';
      updateFileForApplicant(fieldName, { name, uri: fileUri, type });

      if (fieldName === 'Passport Copy') {
        await processOCR({ uri: fileUri, type, name }, fieldName);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePhotoOption = (fieldName: string) => {
    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => handleTakePhoto(fieldName) },
        { text: 'Upload from Files', onPress: () => handlePickFile(fieldName) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadAllFiles = async () => {
  const requiredFields = ['Photo', ...requiredDocs.slice(0, 2)];
  for (const field of requiredFields) {
    if (!uploadedFiles[field]) {
      Toast.show({
        type: 'error',
        text1: 'Missing Required File',
        text2: `Please upload: ${field}`,
      });
      return;
    }
  }

  try {
    setLoadingKey('all');

    // Step 1: Save client info for this applicant
    const clientInfo = {
      Name: fullName,
      PassportNumber: passportNumber,
      BirthDate: dateOfBirth,
      IssueDate: dateOfIssue,
      ExpiredDate: dateOfExpiry,
      BookingId: id, // your booking id
      applicantIndex: activeApplicantIndex + 1, // optional, useful if multiple applicants
    };

    console.log("////client data ",clientInfo);
    await axios.post('https://uberevisa.com/api/client', clientInfo, {
      headers: { 'Content-Type': 'application/json' },
    });

    // Step 2: Upload files
    for (const [fieldName, file] of Object.entries(uploadedFiles)) {
      const formData = new FormData();
      formData.append('Files', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
      formData.append('directory', `seed/test/${activeApplicantIndex + 1}/`);
      formData.append('entityId', id);

      await axios.post('https://uberevisa.com/api/booking/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    // Step 3: Move to next applicant or finish
    if (activeApplicantIndex + 1 < applicantNumber) {
      setActiveApplicantIndex((prev) => prev + 1);
      // Clear passport fields for next applicant
      setFullName('');
      setPassportNumber('');
      setDateOfBirth('');
      setDateOfIssue('');
      setDateOfExpiry('');
    } else {
      Toast.show({
        type: 'success',
        text1: 'Upload Complete',
        text2: 'All documents uploaded successfully 🎉',
      });

      setTimeout(() => {
        router.push(`/Checkout/${id}`);
      }, 1500);
    }
  } catch (error: any) {
    console.log(error.response?.data); // <-- server error message
  console.log(error.response?.status);
  console.log(error.response?.headers);
    Alert.alert('Upload error', error.message);
  } finally {
    setLoadingKey(null);
  }
};

  // OCR Function
  const processOCR = async (
    file: string | { uri: string; type: string; name: string },
    fieldName: string
  ) => {
    setLoadingOCR(true);
    try {
      const apiKey = 'K83432170988957'; // OCR.space API key
      const formData = new FormData();
      formData.append('language', 'eng');

      if (typeof file === 'string') {
        formData.append('base64Image', file);
      } else {
        formData.append('file', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as any);
      }

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: { apikey: apiKey },
        body: formData,
      });

      const data = await response.json();
      if (data.ParsedResults && data.ParsedResults.length > 0) {
        const text = data.ParsedResults.map((r: any) => r.ParsedText).join('\n');

        if (fieldName === 'Passport Copy') {
          extractPassportData(text);
          setShowPassportFields(true);
        }
      } else {
        Alert.alert('The text was not extracted.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('An error occurred during text recognition.', JSON.stringify(err));
    } finally {
      setLoadingOCR(false);
    }
  };

  const extractFullName = (lines: string[]) => {
    const nameKeywords = ['Surname', 'Nom', 'given names', 'given name', 'full name', 'name'];
    for (let i = 0; i < lines.length; i++) {
      const lower = lines[i].toLowerCase();
      for (const keyword of nameKeywords) {
        if (lower.includes(keyword) && lines[i + 1]) {
          return lines[i + 1].trim();
        }
      }
    }

    let candidate = '';
    for (const line of lines) {
      const l = line.trim();
      if (/[A-Za-z]+/.test(l) && l.length > candidate.length) {
        candidate = l;
      }
    }
    return candidate;
  };

  const extractPassportNumber = (lines: string[]) => {
    const passportRegex = /\b(?:[A-Z]\d{6,10}|[A-Z]{2}\d{7,10}|[A-Z]{2}\s\d{7,10}|L[A-Z0-9]{6,10}|\d{9,10})\b/g;
    for (const line of lines) {
      const match = line.trim().match(passportRegex);
      if (match) return match[0];
    }
    return '';
  };

  // const extractDates = (lines: string[]): string[] => {
  //   const dateRegex = /\b(?:\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}|\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}\s[A-Z]{3,9}\/?[A-Z]{0,9}\s\d{2,4})\b/g;
  //   const monthMap: { [key: string]: number } = {
  //     JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  //     JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12
  //   };

  //   const normalize = (dateStr: string) => {
  //     dateStr = dateStr.replace(/\./g, '-').replace(/\//g, '-').trim();
  //     // YYYY-MM-DD
  //     if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) return dateStr;
  //     // DD-MM-YYYY or MM-DD-YYYY
  //     const parts = dateStr.split('-');
  //     if (parts.length === 3) {
  //       let [d, m, y] = parts.map(p => parseInt(p, 10));
  //       if (y < 100) y += 2000;
  //       return `${y.toString().padStart(4,'0')}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
  //     }
  //     // 24 SEP 2025
  //     const match = dateStr.match(/(\d{1,2})\s([A-Z]{3})\s(\d{2,4})/i);
  //     if (match) {
  //       let d = parseInt(match[1], 10);
  //       let m = monthMap[match[2].toUpperCase()] || 1;
  //       let y = parseInt(match[3], 10);
  //       if (y < 100) y += 2000;
  //       return `${y.toString().padStart(4,'0')}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
  //     }
  //     return '';
  //   };

  //   const dates: string[] = [];
  //   for (const line of lines) {
  //     const matches = line.toUpperCase().match(dateRegex);
  //     if (matches) dates.push(...matches.map(normalize).filter(d => d));
  //   }
  //   return dates;
  // };

  const extractDates = (lines: string[]) => {
  const dateRegex =
    /\b(?:\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}|\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}\s[A-Z]{3,9}(?:\/[A-Z]{3,9})?\s\d{2,4})\b/g;

  const monthMap: Record<string, string> = {
    JAN: "01", STY: "01", // January
    FEB: "02", LUT: "02", // February
    MAR: "03", MARZ: "03",
    APR: "04", KWI: "04",
    MAY: "05", MAJ: "05",
    JUN: "06", CZE: "06",
    JUL: "07", LIP: "07",
    AUG: "08", SIE: "08",
    SEP: "09", SEPT: "09", WRZ: "09",
    OCT: "10", PAZ: "10",
    NOV: "11", LIS: "11",
    DEC: "12", GRU: "12",
  };

  const formatDate = (raw: string): string | null => {
    let d = "", m = "", y = "", mon = "";

    // Normalize separators and uppercase
    const date = raw.toUpperCase().replace(/[.,]/g, "/").replace(/\s+/g, " ").trim();

    // Case 1: YYYY-MM-DD or YYYY/MM/DD
    let match = date.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if (match) {
      [ , y, m, d ] = match;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // Case 2: DD-MM-YYYY or DD/MM/YYYY
    match = date.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
    if (match) {
      [ , d, m, y ] = match;
      if (y.length === 2) y = `20${y}`; // handle 2-digit year
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // Case 3: DD MON or DD MON/MON YYYY
    match = date.match(/^(\d{1,2})\s([A-Z]{3,9})(?:\/([A-Z]{3,9}))?\s(\d{2,4})$/);
    if (match) {
      [ , d, mon, m, y ] = match;
      // Use first valid month abbreviation
      const monthKey = mon || m || "";
      const mm = monthMap[monthKey.slice(0, 3)];
      if (!mm) return null;
      if (y.length === 2) y = `20${y}`;
      return `${y}-${mm}-${d.padStart(2, "0")}`;
    }

    return null;
  };

  const dates: string[] = [];
  for (const line of lines) {
    const matches = line.match(dateRegex);
    if (matches) {
      for (const m of matches) {
        const formatted = formatDate(m);
        if (formatted) dates.push(formatted);
      }
    }
  }

  return dates;
};

  const extractPassportData = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const name = extractFullName(lines);
    setFullName(name);

    const passportNo = extractPassportNumber(lines);
    setPassportNumber(passportNo);

    const dates = extractDates(lines);
    setDateOfBirth(dates[0] || '');
    setDateOfIssue(dates[1] || '');
    setDateOfExpiry(dates[2] || '');
  };

  const openPickerDialog = (fieldName: string) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Camera', 'Gallery', 'PDF file'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleTakePhoto(fieldName);
          if (buttonIndex === 2) handlePickFile(fieldName);
          if (buttonIndex === 3) handlePickFile(fieldName);
        }
      );
    } else {
      Alert.alert(
        'Select file source',
        '',
        [
          { text: 'Camera', onPress: () => handleTakePhoto(fieldName) },
          { text: 'Gallery', onPress: () => handlePickFile(fieldName) },
          { text: 'PDF file', onPress: () => handlePickFile(fieldName) },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>
      <ImageBackground
        source={require('../assets/images/bg123123-02.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Upload Documents</Text>
            <Ionicons name="close" size={24} onPress={() => router.back()} />
          </View>

          <Text style={styles.subtitle}>
            Applicant <Text style={styles.attachmentNo}>{activeApplicantIndex + 1}</Text> of {applicantNumber}
          </Text>

          {/* Photo Upload */}
          <View style={styles.photoUploadBox}>
            <Text style={styles.photoLabel}>Photo <Text style={styles.required}>*</Text></Text>
            <Pressable style={styles.photoButton} onPress={() => handlePickFile('Photo')}>
              {uploadedFiles['Photo']?.uri ? (
                <>
                  <Image source={{ uri: uploadedFiles['Photo'].uri }} style={styles.photoPreview} />
                  <Pressable
                    onPress={(e) => { e.stopPropagation(); deleteFileForApplicant('Photo'); }}
                    style={styles.iconTopRight}
                  >
                    <MaterialIcons name="cancel" size={20} color="#b91c1c" />
                  </Pressable>
                </>
              ) : (
                <Text style={styles.photoButtonText}>Select Photo</Text>
              )}
            </Pressable>
          </View>

          {/* Required Documents */}
          {requiredDocs.map((docLabel: string, index: number) => {
            const uploaded = uploadedFiles[docLabel];
            const isRequired = index < 2;

            return (
              <View key={index} style={styles.rowInput}>
                <Text style={styles.rowLabel}>
                  {docLabel} {isRequired && <Text style={styles.required}>*</Text>}
                </Text>
                {uploaded ? (
                  <>
                    <Text style={styles.fileLabel} numberOfLines={1}>📎 {uploaded.name}</Text>
                    <Pressable onPress={() => deleteFileForApplicant(docLabel)} style={styles.iconRemove}>
                      <MaterialIcons name="cancel" size={20} color="#b91c1c" />
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    onPress={() => {
                      if (docLabel === "Passport Copy") {
                        openPickerDialog(docLabel);
                      } else {
                        handlePhotoOption(docLabel);
                      }
                    }}
                    disabled={loadingKey !== null}
                    style={({ pressed }) => [
                      styles.selectFileButton,
                      loadingKey !== null && { opacity: 0.6 },
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <Text style={styles.selectFileButtonText}>Upload</Text>
                  </Pressable>
                )}
              </View>
            );
          })}

          {/* Passport OCR Fields */}
          {loadingOCR && (
            <View style={{ marginVertical: 20 }}>
              <ActivityIndicator size="large" color="#1d4ed8" />
              <Text style={{ textAlign: 'center', marginTop: 8 }}>Processing Passport...</Text>
            </View>
          )}

          {showPassportFields && !loadingOCR && (
            <>
              <Text style={styles.fileLabel}>Full Name</Text>
              <TextInput style={styles.textInput} value={fullName} onChangeText={setFullName} />

              <View style={styles.rowInput}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fileLabel}>Passport Number</Text>
                  <TextInput style={styles.textInput} value={passportNumber} onChangeText={setPassportNumber} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fileLabel}>Date of Birth</Text>
                  <TextInput style={styles.textInput} value={dateOfBirth} onChangeText={setDateOfBirth} />
                </View>
              </View>

              <View style={styles.rowInput}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.fileLabel}>Date of Issue</Text>
                  <TextInput style={styles.textInput} value={dateOfIssue} onChangeText={setDateOfIssue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fileLabel}>Date of Expiry</Text>
                  <TextInput style={styles.textInput} value={dateOfExpiry} onChangeText={setDateOfExpiry} />
                </View>
              </View>
            </>
          )}

          {/* Footer Upload Button */}
          <View style={[styles.footer, { marginTop: 20 }]}>
            <Pressable
              style={[styles.submitButton, loadingKey !== null && { opacity: 0.6 }]}
              onPress={uploadAllFiles}
              disabled={loadingKey !== null}
            >
              <Text style={styles.submitButtonText}>
                {loadingKey === 'all'
                  ? 'Uploading...'
                  : activeApplicantIndex + 1 < applicantNumber
                  ? 'Upload & Next'
                  : 'Upload & Finish'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  selectFileButton: {
    backgroundColor: '#cc3093',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectFileButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '400',
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderRadius: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 10,
  },
  wrapper: {
    flexGrow: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    width: '100%',
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  attachmentNo: {
    color: 'red',
    fontWeight: '600',
  },
  photoUploadBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  photoButton: {
    width: 130,
    height: 130,
    borderWidth: 1,
    borderColor: '#cc3093',
    borderRadius: 8,
    backgroundColor: '#fcebf6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  photoButtonText: {
    fontSize: 14,
    color: '#888',
  },
  iconTopRight: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  rowInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowLabel: {
    flex: 1.3,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  fileLabel: {
    flex: 1,
    marginRight: 8,
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 8,
  },
  iconRemove: {
    position: 'relative',
    top: 0,
    right: 0,
    marginLeft: 8,
  },
  submitWrapper: {
    marginTop: 30,
    alignItems: 'center',
  },
  required: {
    color: 'red',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 10,
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: '#cc3093',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  textInput: {
    marginTop: 15,
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    borderRadius: 5,
  },
});
