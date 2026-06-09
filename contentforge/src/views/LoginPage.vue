<!-- LoginPage.vue -->
<template>
  <div class="login-page" :dir="locale === 'ar' ? 'rtl' : 'ltr'">

    <!-- Left panel — branding -->
    <div class="login-left">
      <div class="login-left-inner">

        <RouterLink to="/" class="brand">
          <div class="brand-icon">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <span class="brand-name">ContentForge</span>
        </RouterLink>

        <div class="left-body">
          <h2 class="left-headline">
            {{ t('auth.leftHeadline') }}<br />
            <span class="left-accent">{{ t('auth.leftAccent') }}</span>
          </h2>
          <p class="left-sub">{{ t('auth.leftSub') }}</p>

          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-dot blue"></div>
              <span>{{ t('auth.feature1') }}</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot teal"></div>
              <span>{{ t('auth.feature2') }}</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot purple"></div>
              <span>{{ t('auth.feature3') }}</span>
            </div>
          </div>
        </div>

        <p class="left-footer">© 2026 ContentForge</p>
      </div>
    </div>

    <!-- Right panel — form -->
    <div class="login-right">

      <!-- Back to home — mobile only -->
      <RouterLink to="/" class="back-btn">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {{ t('auth.backHome') }}
      </RouterLink>
      <!-- Lang toggle -->
      <button @click="switchLang" class="lang-toggle">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
        </svg>
        {{ locale === 'en' ? 'عربي' : 'English' }}
      </button>

      <div class="form-wrap">

        <!-- OTP view -->
        <div v-if="showOTP" class="form-inner">
          <div class="form-head">
            <div class="form-icon">📬</div>
            <h1 class="form-title">{{ t('auth.confirmEmail') }}</h1>
            <p class="form-sub">{{ t('auth.otpSubtitle') }}</p>
          </div>

          <div v-if="error" class="alert alert-error">
            <svg class="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </div>

          <div v-if="successKey" class="alert alert-success">
            <svg class="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {{ t(successKey) }}
          </div>

          <div class="otp-row" dir="ltr">
            <input v-for="(digit, index) in 6" :key="index" ref="inputRefs" v-model="otpInputs[index]" type="text"
              maxlength="1" class="otp-input" @input="handleOtpInput(index, $event)"
              @keydown="handleOtpKeyDown(index, $event)" />
          </div>

          <button @click="verifyEmail" :disabled="loading" class="btn-primary">
            <svg v-if="loading" class="spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? t('auth.verifying') : t('auth.verifyCode') }}
          </button>

        </div>

        <!-- Login / Register view -->
        <div v-else class="form-inner">
          <div class="form-head">
            <h1 class="form-title">
              {{ isRegister ? t('auth.createAccount') : t('auth.welcomeBack') }}
            </h1>
            <p class="form-sub">
              {{ isRegister ? t('auth.registerSubtitle') : t('auth.loginSubtitle') }}
            </p>
          </div>


          <div v-if="error" class="alert alert-error">
            <svg class="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </div>


          <div v-if="successKey" class="alert alert-success">
            <svg class="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {{ t(successKey) }}
          </div>


          <div class="fields">
            <div v-if="isRegister" class="field-row">
              <div class="field">
                <label>{{ t('auth.fullName') }}</label>
                <input v-model="form.name" type="text" :placeholder="t('auth.fullNamePlaceholder')"
                  @keyup.enter="submit" />
              </div>
              <div class="field">
                <label>{{ t('auth.phone') }}</label>
                <input v-model="form.phone" type="tel" :placeholder="t('auth.phonePlaceholder')"
                  @keyup.enter="submit" />
              </div>
            </div>

            <div class="field">
              <label>{{ t('auth.email') }}</label>
              <input v-model="form.email" type="email" :placeholder="t('auth.emailPlaceholder')"
                @keyup.enter="submit" />
            </div>

            <div class="field">
              <label>{{ t('auth.password') }}</label>
              <div class="pass-wrap">
                <input v-model="form.password" :type="showPass ? 'text' : 'password'"
                  :placeholder="t('auth.passwordPlaceholder')" @keyup.enter="submit" />
                <button @click="showPass = !showPass" type="button" class="pass-toggle">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path v-if="!showPass" stroke-linecap="round" stroke-linejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <button @click="submit" :disabled="loading" class="btn-primary">
            <svg v-if="loading" class="spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading
              ? (isRegister ? t('auth.creatingAccount') : t('auth.signingIn'))
              : (isRegister ? t('auth.createAccountBtn') : t('auth.signIn')) }}
          </button>


          <!-- <div class="divider">
            <span></span>
            <p>{{ t('common.or') }}</p>
            <span></span>
          </div> -->
<!-- 
          <button @click="demoLogin" :disabled="loading" class="btn-secondary">
            🚀 {{ t('auth.tryDemo') }}
          </button> -->

          <p class="switch-mode">
            {{ isRegister ? t('auth.alreadyHaveAccount') : t('auth.noAccount') }}
            <button @click="isRegister = !isRegister; error = null; successKey = null">
              {{ isRegister ? t('auth.signInLink') : t('auth.createOne') }}
            </button>

          </p>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'
import { useLang } from '../composables/useLang.js'
import api from '../api/client'

const { t } = useI18n()
const { locale, switchLang } = useLang()
const showOTP = ref(false)
const otpCode = ref('')

const router = useRouter()
const authStore = useAuthStore()

const isRegister = ref(false)
const showPass = ref(false)
const loading = ref(false)
const error = ref(null)
const successKey = ref(null)
const serverOnline = ref(false)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const form = ref({ name: '', email: '', password: '', phone: '' })

// 1. مصفوفة فيها 6 خانات فاضية للـ OTP
const otpInputs = ref(['', '', '', '', '', ''])

// 2. reference عشان نلقط صناديق الـ HTML في الكود
const inputRefs = ref([])

// 3. فانكشن بتتحكم في الحركة بين البوكسات أوتوماتيك
const handleOtpInput = (index, event) => {
  const value = event.target.value

  // لو كتب رقم، انقل للبوكس اللي بعده
  if (value && index < 5) {
    inputRefs.value[index + 1].focus()
  }
}

// 4. فانكشن عشان لو داس Backspace يرجع للبوكس اللي قبله
const handleOtpKeyDown = (index, event) => {
  if (event.key === 'Backspace' && !otpInputs.value[index] && index > 0) {
    inputRefs.value[index - 1].focus()
  }
}

onMounted(async () => {
  try {
    await api.get('/health')
    serverOnline.value = true
  } catch {
    serverOnline.value = false
  }
})


// async function submit() {
//   error.value = null
//   if (!form.value.email || !form.value.password) {
//     error.value = 'Please fill in all fields'
//     return
//   }
//   if (isRegister.value && (!form.value.name || !form.value.phone)) {
//     error.value = 'Please fill in all fields'
//     return
//   }
//   loading.value = true
//   try {
//     if (isRegister.value) {
//       await authStore.register(form.value)
//       success.value = 'Check your email for a verification code'
//       showOTP.value = true
//       // ✅ No redirect here — user must verify first
//     } else {
//       await authStore.login(form.value)
//       const userRaw = localStorage.getItem('cf_user')
//       const user = userRaw ? JSON.parse(userRaw) : null

//       if (localStorage.getItem('cf_token')) {
//         // 🎯 الحتة السحرية الجديدة: لو أدمن وديه باث الأدمن، لو لأ وديه الـ dashboard العادي
//         if (user && user.isAdmin === true) {
//           router.push('/admin/dashboard')
//         } else {
//           router.push('/dashboard')
//         }
//       } else {
//         error.value = 'تم تسجيل الدخول ولكن لم يتم حفظ التوكن، تأكدي من كود الـ Store'
//       }
//     }
//   } catch (err) {
//     error.value = err.message || 'Something went wrong. Is your backend running?'
//   } finally {
//     loading.value = false
//   }
// }

// // ✅ Now a top-level function, accessible from the template
// async function verifyEmail() {
//   error.value = null
//   try {
//     loading.value = true
//     await api.post('/auth/verify-email', {
//       email: form.value.email,
//       code: otpInputs.value.join('') // نجمع الأرقام من المصفوفة
//     })
//     success.value = 'Email verified successfully 🎉'
//     // 2. 🚀 السطر السحري: بنعمل تسجيل دخول أوتوماتيك فوراً عشان الـ Store يجيب التوكن ويسيفه
//     await authStore.login(form.value)

//     // 3. ننتقل للداش بورد والقلب جامد والتوكن متسيف
//     router.push('/dashboard')
//   } catch (err) {
//     error.value = err.response?.data?.message || 'Invalid or expired code'
//   } finally {
//     loading.value = false
//   }
// }
async function submit() {
  error.value = null
  if (!form.value.email || !form.value.password) {
    error.value = t('auth.errorFillAll')
    return
  }

  if (isRegister.value && (!form.value.name || !form.value.phone)) {
    error.value = t('auth.errorFillAll')
    return
  }

  loading.value = true
  try {
    if (isRegister.value) {
      await authStore.register(form.value)
      successKey.value = 'auth.checkEmail'
      showOTP.value = true
    } else {
      // 1. بنعمل تسجيل دخول ونستنى الـ Store يخلص تماماً
      await authStore.login(form.value)

      // 2. بنشوف التوكن اتسيف ولا لأ
      await nextTick()

      if (localStorage.getItem('cf_token')) {
  const userRaw = localStorage.getItem('cf_user')
  const user = userRaw ? JSON.parse(userRaw) : null
  router.push(user?.isAdmin ? '/admin' : '/dashboard')
} else {
      error.value = 'تم تسجيل الدخول ولكن لم يتم حفظ التوكن، تأكدي من كود الـ Store'
    }
    }
  } catch (err) {
    error.value = err.message || t('auth.errorGeneric')
  } finally {
    loading.value = false
  }
}

async function verifyEmail() {
  error.value = null
  try {
    loading.value = true
    await api.post('/auth/verify-email', {
      email: form.value.email,
      code: otpInputs.value.join('')
    })
    successKey.value = t('auth.verifiedSuccess')
    // 2. 🚀 السطر السحري: بنعمل تسجيل دخول أوتوماتيك فوراً عشان الـ Store يجيب التوكن ويسيفه
    // في verifyEmail() — بعد authStore.login
await authStore.login(form.value)
const userRaw = localStorage.getItem('cf_user')
const user = userRaw ? JSON.parse(userRaw) : null
router.push(user?.isAdmin ? '/admin' : '/dashboard')
  } catch (err) {
    error.value = err.response?.data?.message || t('auth.errorInvalidCode')
  } finally {
    loading.value = false
  }
}


async function demoLogin() {
  try {
    loading.value = true;
    error.value = null;

    const response = await api.post('/auth/demo');

    // 1. السطر السحري: هيطبع لنا شكل الـ response بالظبط في الـ Console عشان نفهمه
    // console.log("الباك إند رجع لنا إيه بالظبط؟ :", response);

    // 2. هنحط شرط ذكي: لو الـ response جواه (.data) هنقرأ منها، لو معندوش هنقرأ منه مباشرة
    const responseData = response.data ? response.data : response;

    // 3. بنسيف وأنتِ مطمنة لأننا أمّنا السطرين
    localStorage.setItem('cf_token', responseData.token);
    localStorage.setItem('cf_user', JSON.stringify(responseData.user));

    router.push('/dashboard');

  } catch (err) {
    console.error("Demo login failed:", err);
    error.value = err.response?.data?.message || 'Something went wrong';
  } finally {
    loading.value = false;
  }
}

</script>
<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--bg, #0d0f14);
}

/* ── Left panel ── */
.login-left {
  background: linear-gradient(160deg, #0f1623 0%, #0d0f14 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: stretch;
  padding: 0;
}

.login-left-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.5rem 3rem;
  width: 100%;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #14b8a6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-name {
  font-size: 17px;
  font-weight: 700;
  color: #f0f2f5;
}

.left-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding: 3rem 0;
}

.left-headline {
  font-size: 32px;
  font-weight: 700;
  color: #f0f2f5;
  line-height: 1.25;
  margin: 0;
}

.left-accent {
  color: #60a5fa;
}

.left-sub {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.7;
  margin: 0;
  max-width: 340px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #9ca3af;
}

.feature-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.feature-dot.blue {
  background: #3b82f6;
}

.feature-dot.teal {
  background: #14b8a6;
}

.feature-dot.purple {
  background: #8b5cf6;
}

.left-footer {
  font-size: 12px;
  color: #374151;
}

/* ── Right panel ── */
.login-right {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #13151c;
}

.lang-toggle {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.lang-toggle:hover {
  color: #f0f2f5;
  border-color: rgba(255, 255, 255, 0.15);
}

[dir="rtl"] .lang-toggle {
  right: auto;
  left: 1.25rem;
}

.form-wrap {
  width: 100%;
  max-width: 420px;
}

.form-inner {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-head {
  margin-bottom: 0.25rem;
}

.form-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #f0f2f5;
  margin: 0 0 6px;
}

.form-sub {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
}

.alert-error {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.alert-success {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.alert-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Fields */
.fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
}

.field input,
.pass-wrap input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f0f2f5;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.field input:focus,
.pass-wrap input:focus {
  border-color: rgba(59, 130, 246, 0.5);
}

.field input::placeholder,
.pass-wrap input::placeholder {
  color: #374151;
}

.pass-wrap {
  position: relative;
}

.pass-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  display: flex;
  align-items: center;
}

.pass-toggle:hover {
  color: #9ca3af;
}

.pass-toggle svg {
  width: 16px;
  height: 16px;
}

[dir="rtl"] .pass-toggle {
  right: auto;
  left: 12px;
}

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 13px;
  border-radius: 10px;
  background: #2563eb;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #3b82f6;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.15);
  color: #f0f2f5;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.divider span {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.divider p {
  font-size: 12px;
  color: #374151;
  margin: 0;
}

.switch-mode {
  text-align: center;
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.switch-mode button {
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-inline-start: 4px;
}

.switch-mode button:hover {
  color: #93c5fd;
}

/* OTP */
.otp-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.otp-input {
  width: 52px;
  height: 56px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f0f2f5;
  outline: none;
  transition: border-color 0.15s;
}

.otp-input:focus {
  border-color: rgba(99, 102, 241, 0.6);
}

/* Spinner */
.spin {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

.back-btn {
  display: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-left {
    display: none;
  }

  .login-right {
    min-height: 100vh;
    padding: 2rem 1.5rem;
    align-items: flex-start;
    padding-top: 4rem;
  }

  .form-wrap {
    max-width: 100%;
  }

  .field-row {
    grid-template-columns: 1fr;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    position: absolute;
    top: 1.25rem;
    left: 1.25rem;
    font-size: 13px;
    color: #6b7280;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 6px 10px;
    transition: all 0.15s;
  }
  .back-btn:hover {
    color: #f0f2f5;
    border-color: rgba(255,255,255,0.15);
  }
}


[dir="rtl"] .back-btn {
  left: auto;
  right: 1.25rem;
}
</style>
