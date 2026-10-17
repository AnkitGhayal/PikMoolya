import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface CameraCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoCaptured: (data: {
    uri: string;
    captureSessionId: string | null;
    captureMethod: 'CAMERA';
    capturedAt: string;
  }) => void;
  apiUrl: string;
  token?: string | null;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  visible,
  onClose,
  onPhotoCaptured,
  apiUrl,
  token,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [captureSessionId, setCaptureSessionId] = useState<string | null>(null);
  const [capturedAt, setCapturedAt] = useState<string>('');

  React.useEffect(() => {
    if (visible) {
      setCapturedUri(null);
      setCapturing(false);
      fetchCaptureSession();
    }
  }, [visible]);

  const fetchCaptureSession = async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${apiUrl}/quality-verification/capture-session`, {
        method: 'POST',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setCaptureSessionId(data.captureSessionId);
      }
    } catch (err: any) {
      console.log('Capture session issue fallback:', err?.message);
    }
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current || capturing) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: true,
      });
      if (photo && photo.uri) {
        setCapturedUri(photo.uri);
        setCapturedAt(new Date().toISOString());
      }
    } catch (err: any) {
      console.log('Camera capture error:', err?.message);
    } finally {
      setCapturing(false);
    }
  };

  const handleConfirmPhoto = () => {
    if (capturedUri) {
      onPhotoCaptured({
        uri: capturedUri,
        captureSessionId: captureSessionId || `CS-${Date.now()}`,
        captureMethod: 'CAMERA',
        capturedAt: capturedAt || new Date().toISOString(),
      });
      onClose();
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permContainer}>
          <Ionicons name="camera-outline" size={60} color={theme.colors.primary} />
          <Text style={styles.permTitle}>Camera Permission Required</Text>
          <Text style={styles.permDesc}>
            PikMoolya requires camera access to capture produce photos for AI quality assessment.
          </Text>
          <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
            <Text style={styles.permButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelLink} onPress={onClose}>
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.cameraContainer}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PikMoolya Quality Camera</Text>
          <View style={{ width: 26 }} />
        </View>

        {capturedUri ? (
          /* Preview Mode */
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedUri }} style={styles.previewImage} resizeMode="contain" />
            <View style={styles.previewBadge}>
              <Ionicons name="camera-reverse" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.previewBadgeText}>Captured via PikMoolya Camera</Text>
            </View>
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.retakeBtn} onPress={() => setCapturedUri(null)}>
                <Ionicons name="refresh-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.usePhotoBtn} onPress={handleConfirmPhoto}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.usePhotoText}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Live Viewfinder Mode */
          <View style={styles.flex1}>
            <View style={styles.flex1}>
              <CameraView style={styles.flex1} ref={cameraRef} />
              <View style={styles.overlayContainer} pointerEvents="none">
                {/* Alignment Box Overlay */}
                <View style={styles.alignmentBox}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>

                <View style={styles.guidanceBox}>
                  <Text style={styles.guidanceText}>Center the produce inside the frame</Text>
                  <Text style={styles.guidanceSub}>Ensure clear lighting and close-up focus</Text>
                </View>
              </View>
            </View>

            {/* Bottom Capture Control */}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.captureOuterCircle}
                onPress={handleTakePicture}
                disabled={capturing}
              >
                {capturing ? (
                  <ActivityIndicator color={theme.colors.primary} size="large" />
                ) : (
                  <View style={styles.captureInnerCircle} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flex1: {
    flex: 1,
  },
  headerBar: {
    height: 54,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
  },
  permContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  permTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMain,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  permDesc: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  permButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  permButtonText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.weights.semibold,
  },
  cancelLink: {
    marginTop: theme.spacing.lg,
  },
  cancelLinkText: {
    color: theme.colors.textMuted,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alignmentBox: {
    width: '78%',
    height: '52%',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  guidanceBox: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  guidanceText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  guidanceSub: {
    color: '#CBD5E1',
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  bottomBar: {
    height: 110,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureOuterCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInnerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: '75%',
    borderRadius: 12,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginVertical: 8,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#475569',
    paddingVertical: 14,
    borderRadius: theme.radius.md,
  },
  retakeText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.base,
  },
  usePhotoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
  },
  usePhotoText: {
    color: '#FFFFFF',
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.base,
  },
});
