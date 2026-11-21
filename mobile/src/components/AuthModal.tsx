import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { CyberGlowBackground } from '@/components/CyberGlowBackground';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { api } from '@/services/api';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export function AuthModal({ visible, onClose, onSuccess }: AuthModalProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [role, setRole] = useState<'business' | 'creator'>('creator');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const res = await api.register({
          email,
          password,
          role,
          fullName: fullName.trim() || undefined,
        });

        if (res.success) {
          Alert.alert('Welcome! 🎉', 'Your GoaCreatorDB account is active.');
          onSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Registration failed');
        }
      } else {
        const res = await api.login(email, password);
        if (res.success) {
          Alert.alert('Signed in! ✨', `Welcome back, ${res.user?.email || 'User'}`);
          onSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View
        style={[
          styles.modalContainer,
          {
            backgroundColor: theme.background,
            paddingTop: Math.max(insets.top, 14),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}>
        {/* Full-Screen Ambient Cyber Backdrop */}
        <CyberGlowBackground glowIntensity="subtle" />

        {/* Top Bar with Tracker & Close */}
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <View style={[styles.redSquare, { backgroundColor: theme.primary }]} />
            <Text style={[styles.tracker, { color: theme.primary }]}>
              {mode === 'signup' ? 'CREATE ACCOUNT' : 'SECURE SIGN IN'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="x" size={16} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Headlines matching reference image */}
          <Text style={[styles.headline, { color: theme.text }]}>
            {mode === 'signup' ? 'Start Exploring' : 'Welcome Back'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {mode === 'signup'
              ? 'Follow your favorite creators and unlock exclusive partnerships.'
              : 'Access your campaign inbox, media kit, and active collaboration briefs.'}
          </Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: 'rgba(239,23,23,0.12)', borderColor: theme.primary }]}>
              <Feather name="alert-circle" size={14} color={theme.primary} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Modular Role Selector (for signup) */}
          {mode === 'signup' && (
            <RoleSelector role={role} onSelectRole={setRole} />
          )}

          {/* Input 1: Email */}
          <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="mail" size={16} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Exampleemail@com"
              placeholderTextColor={theme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Input 2: Full Name (signup only) */}
          {mode === 'signup' && (
            <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Feather name="user" size={16} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={role === 'business' ? 'Business / Venue Name' : 'Full Name'}
                placeholderTextColor={theme.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          )}

          {/* Input 3: Password */}
          <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="lock" size={16} color={theme.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="••••••••••••"
              placeholderTextColor={theme.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {mode === 'signup' ? 'Sign Up' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Modular Social Auth Buttons */}
          <SocialAuthButtons />

          {/* Bottom Toggle Link */}
          <View style={styles.bottomLinkRow}>
            <Text style={[styles.bottomLinkText, { color: theme.textSecondary }]}>
              {mode === 'signup' ? 'Already have an account ? ' : "Don't have an account ? "}
            </Text>
            <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
              <Text style={[styles.bottomLinkAction, { color: theme.primary }]}>
                {mode === 'signup' ? 'Login' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: 'relative',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#22252A',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redSquare: {
    width: 6,
    height: 6,
    borderRadius: 0,
  },
  tracker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 0,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 24,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 0,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF1717',
    fontSize: 12,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  primaryBtn: {
    paddingVertical: 13,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  bottomLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomLinkText: {
    fontSize: 13,
  },
  bottomLinkAction: {
    fontSize: 13,
    fontWeight: '800',
  },
});
