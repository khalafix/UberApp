import { allowedImageExtension } from '@/lib/schemas/utils';
import { useStore } from '@/stores/store';
import { ServiceData } from '@/types/service';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


const DocumentUploadScreen = observer(() => {
  


  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission is required to access media.');
      }
    })();
  }, []);


  const isRequired = (label: string) =>
    label.toLowerCase().includes('passport') || label.toLowerCase().includes('photo');

  const { bookingStore, serviceStore } = useStore();
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [applicantNumber, setApplicantNumber] = useState<number>(0);
  const [activeApplicantIndex, setActiveApplicantIndex] = useState(0);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [service, setService] = useState<ServiceData | null>(null);
  const { bookingId } = useLocalSearchParams();
  const id = bookingId as string;

const requiredFields = service?.requiredFiles?.filter(isRequired) || [];
const allRequiredUploaded = requiredFields.every((field) => uploadedFiles[field]);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      const booking = await bookingStore.getBooking(id);

      if (booking?.serviceId) {
        setApplicantNumber((booking.adultsNumber ?? 0) + (booking.childrenNumber ?? 0));
        const servicee = await serviceStore.getService(booking.serviceId);
        if (servicee) setService(servicee);
      }
    };

    fetchBooking();
  }, [id]);


  const handlePickDocument = async (field: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        const info = await FileSystem.getInfoAsync(file.uri);
        if (!info.exists) {
          console.warn("File doesn't exist yet:", file.uri);
          return;
        }

        setUploadedFiles((prev) => ({
          ...prev,
          [field]: {
            name: file.name,
            uri: file.uri.startsWith('file://') ? file.uri : `file://${file.uri}`,
            type: file.mimeType || 'application/octet-stream',
          },
        }));
      }
    } catch (err) {
      console.warn('Document pick error:', err);
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles((prev) => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
  };

  const compressImage = async (file: any) => {
    if (allowedImageExtension.some((ext) => file.type === ext)) {
      try {
        const result = await ImageManipulator.manipulateAsync(
          file.uri,
          [{ resize: { width: 1920 } }],
          { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG }
        );
        return {
          uri: result.uri,
          name: file.name,
          type: 'image/jpeg',
        };
      } catch (error) {
        console.error('Image compression error:', error);
        return file;
      }
    }
    return file;
  };





  const handleSubmit = async () => {
    setLoading(true);

    const formData = new FormData();

    for (const file of Object.values(uploadedFiles)) {
      let currentFile = file;

      // Ensure uri starts with file://
      if (!currentFile.uri.startsWith('file://')) {
        currentFile.uri = 'file://' + currentFile.uri;
      }

      // Compress image if applicable
      if (currentFile.type.startsWith('image/')) {
        try {
          currentFile = await compressImage(currentFile);
        } catch (err) {
          console.warn('Image compression failed:', err);
        }
      }

      formData.append('Files', {
        uri: currentFile.uri,
        type: currentFile.type || 'application/octet-stream',
        name: currentFile.name,
      } as any);
    }

    const isImage = Object.values(uploadedFiles).some((file) =>
      allowedImageExtension.some((ext) => file.type?.startsWith(ext))
    );

    const directory = isImage ? 'seed/image/' : 'seed/files/';
    formData.append('directory', directory);
    formData.append('entityId', bookingStore.currentBooking!.id);

    try {
      const result = await bookingStore.uploadImage(formData);
      if (result.status === 'success') {
        if (activeApplicantIndex < applicantNumber - 1) {
          setUploadedFiles({});
          setActiveApplicantIndex((prev) => prev + 1);
        } else {
          setIsUploadComplete(true);
        }
      } else {
        console.error('Upload failed:', result.error);
      }
    } catch (error) {
      console.error('Error uploading documents:', error);
    }

    setLoading(false);
  };


  useEffect(() => {
    if (isUploadComplete) {
      setTimeout(() => {
        router.push(`/Checkout/${id}`);
      }, 100); // Delay ensures proper state update
    }
  }, [isUploadComplete, id]);


  if (!service) {
    return (
      <View style={styles.loading}>
        <Text>Loading booking details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'top']}>

      <View style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Upload Booking Documents</Text>
          <Text style={styles.subTitle}>
            Attachment No <Text style={styles.attachmentNo}>{activeApplicantIndex + 1}</Text>
            {applicantNumber > 1 && <Text> of {applicantNumber}</Text>}
          </Text>

          {Array.from({ length: applicantNumber }).map((_, applicantIndex) => (
            <View
              key={`applicant-${applicantIndex}`}
              style={[
                styles.applicantContainer,
                activeApplicantIndex !== applicantIndex && styles.hidden
              ]}
            >
              {service.requiredFiles?.filter(f => f.toLowerCase().includes('photo')).map((field, index) => (
                <View key={`photo-${index}`} style={styles.photoContainer}>
                  <Text style={styles.label}>
                    {field} <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.photoBox}
                    onPress={() => handlePickDocument(field)}
                  >
                    {uploadedFiles[field]?.uri ? (
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{ uri: uploadedFiles[field].uri }}
                          style={styles.previewImage}
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <Text style={styles.photoText}>Upload Photo</Text>
                    )}
                  </TouchableOpacity>
                  {uploadedFiles[field]?.uri && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFile(field)}
                    >
                      <Text style={styles.removeText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {service.requiredFiles?.filter(f => !f.toLowerCase().includes('photo')).map((field, index) => (
                <View key={index} style={styles.rowInput}>
                  <Text style={styles.rowLabel}>
                    {field}
                    {isRequired(field) && <Text style={styles.required}> *</Text>}
                  </Text>
                  <TouchableOpacity
                    style={styles.rowUpload}
                    onPress={() => handlePickDocument(field)}
                  >
                    <Text style={styles.uploadText}>
                      {uploadedFiles[field]?.name || 'Upload'}
                    </Text>
                  </TouchableOpacity>

                  {uploadedFiles[field]?.uri && (
                    <TouchableOpacity
                      style={[styles.removeButton, styles.rowRemoveButton]}
                      onPress={() => removeFile(field)}
                    >
                      <Text style={styles.removeText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          ))}


        </ScrollView>
        {/* Bottom Bar */}
        <View style={styles.footer}>
          <View style={styles.footerContainer}>
            <View style={styles.buttonWrapper}>
<Button
  mode="contained"
  disabled={!allRequiredUploaded || loading}
  onPress={handleSubmit}
  style={[
    styles.submitButton,
    (!allRequiredUploaded || loading) && styles.submitDisabled
  ]}
  loading={loading}
>
                {activeApplicantIndex < applicantNumber - 1 ? 'Next Applicant' : 'Submit'}
              </Button>
            </View>

          </View>
        </View>
      </View>
    </SafeAreaView>
  );
});


const styles = StyleSheet.create({
  footerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,

  },
  nextButton: {
    backgroundColor: '#2E77FF',
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
    paddingHorizontal: 0,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1c1c',
    textAlign: 'left',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
  },
  attachmentNo: {
    color: 'red',
    fontWeight: '600',
  },
  applicantContainer: {
    marginBottom: 20,
  },
  hidden: {
    display: 'none',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoBox: {
    width: 130,
    height: 130,
    borderWidth: 1,
    borderColor: '#cc3093',
    borderRadius: 8,
    backgroundColor: '#fcebf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  rowInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    position: 'relative',
  },
  rowLabel: {
    flex: 1.3,
    fontSize: 14,
    fontWeight: '600',
  },
  rowUpload: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#fcebf6',
    alignItems: 'center',
  },
  uploadText: {
    color: '#000',
    fontWeight: '600',
  },
  required: {
    color: 'red',
  },
  submitButton: {
    marginTop: 0,
    backgroundColor: '#cc3093',
    borderRadius: 6,
    padding: 5,
  },
  submitDisabled: {
    backgroundColor: '#dccfd7',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  rowRemoveButton: {
    position: 'relative',
    top: 0,
    right: 0,
    marginLeft: 8,
  },
  removeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

export default DocumentUploadScreen;
function uriToBlob(uri: any) {
  throw new Error('Function not implemented.');
}

