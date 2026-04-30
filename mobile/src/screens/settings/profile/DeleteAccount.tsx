import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../../stores/useAuthStore';
import { pressedStyle } from '../../../styles/common';
import {
  TEXT_SECONDARY,
  NEUTRAL_COLOR,
  BACKGROUND_CARD,
  STATUS_RED,
} from '../../../styles/colors';
import type { ObjectValues } from '../../../../../shared/types/core';

const CONFIRM_SECONDS = 9;

const DELETE_MODE = {
  IDLE: 'idle',
  CONFIRMING: 'confirming',
  DELETING: 'deleting',
} as const;

type DeleteMode = ObjectValues<typeof DELETE_MODE>;

export default function DeleteAccount() {
  const deleteAccount = useAuthStore(state => state.deleteAccount);

  const [mode, setMode] = useState<DeleteMode>(DELETE_MODE.IDLE);
  const [countdown, setCountdown] = useState(CONFIRM_SECONDS);

  useEffect(() => {
    if (mode !== DELETE_MODE.CONFIRMING) return;
    setCountdown(CONFIRM_SECONDS);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const handleDelete = async () => {
    setMode(DELETE_MODE.DELETING);
    try {
      await deleteAccount();
    } catch (error) {
      console.error('❌ failed to delete account:', error);
      setMode(DELETE_MODE.IDLE);
    }
  };

  const isConfirmDisabled = countdown > 0 || mode === DELETE_MODE.DELETING;

  if (mode === DELETE_MODE.IDLE) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && pressedStyle]}
        onPress={() => setMode(DELETE_MODE.CONFIRMING)}
      >
        <Text style={styles.deleteText}>Delete account</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.confirmText}>
        All your data will be permanently deleted and cannot be recovered.
      </Text>
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.cancelButton,
            pressed && pressedStyle,
            mode === DELETE_MODE.DELETING && styles.buttonDisabled,
          ]}
          onPress={() => setMode(DELETE_MODE.IDLE)}
          disabled={mode === DELETE_MODE.DELETING}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.confirmButton,
            pressed && !isConfirmDisabled && pressedStyle,
            isConfirmDisabled && styles.buttonDisabled,
          ]}
          onPress={handleDelete}
          disabled={isConfirmDisabled}
        >
          {mode === DELETE_MODE.DELETING ? (
            <ActivityIndicator size="small" color={STATUS_RED} />
          ) : (
            <Text style={styles.confirmButtonText}>
              {countdown > 0
                ? `Delete account (${countdown}s)`
                : 'Delete account'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
    overflow: 'hidden',
  },
  deleteText: {
    fontSize: 15,
    color: STATUS_RED,
    padding: 14,
    paddingHorizontal: 16,
  },
  confirmText: {
    fontSize: 13,
    color: STATUS_RED,
    lineHeight: 18,
    padding: 12,
    paddingBottom: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 36,
  },
  cancelButton: {
    backgroundColor: BACKGROUND_CARD,
    borderColor: NEUTRAL_COLOR,
  },
  cancelText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  confirmButton: {
    flex: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: STATUS_RED,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
