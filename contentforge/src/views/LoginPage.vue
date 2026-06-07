<!-- Login Page -->
<template>
  <div class="min-h-screen theme-bg flex items-center justify-center p-6 bg-grid">

    <!-- Language toggle — fixed top right -->
    <div class="fixed top-4 right-4 z-50">
      <button @click="switchLang"
        class="flex items-center gap-1.5 text-xs theme-sub px-3 py-1.5 rounded-lg theme-card theme-border hover:theme-text transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
        </svg>
        {{ locale === 'en' ? 'عربي' : 'English' }}
      </button>
    </div>

    <div
      class="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-600/8 blur-3xl pointer-events-none">
    </div>

    <div class="w-full max-w-md relative z-10">

      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-flex items-center gap-2.5 mb-4">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <span class="font-display font-700 text-xl theme-text">ContentForge</span>
        </RouterLink>


        <h1 class="font-display text-2xl font-700 theme-text mb-1">
          {{ showOTP ? t('auth.confirmEmail') : (isRegister ? t('auth.createAccount') : t('auth.welcomeBack')) }}
        </h1>
        <p class="text-sm theme-sub">
          {{ showOTP ? t('auth.otpSubtitle') : (isRegister ? t('auth.registerSubtitle') : t('auth.loginSubtitle')) }}
        </p>

      </div>

      <div class="rounded-2xl theme-surface theme-border p-8 theme-shadow">

        <div v-if="error"
          class="mb-5 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error }}
        </div>

        <div v-if="success"
          class="mb-5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ success }}
        </div>

        <div v-if="showOTP" class="space-y-6 text-center">
          <div class="flex justify-center gap-2" dir="ltr">
            <input v-for="(digit, index) in 6" :key="index" ref="inputRefs" v-model="otpInputs[index]" type="text"
              maxlength="1"
              class="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200"
              @input="handleOtpInput(index, $event)" @keydown="handleOtpKeyDown(index, $event)" />
          </div>

          <button @click="verifyEmail" :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? t('auth.verifying') : t('auth.verifyCode') }}
          </button>

        </div>

        <div v-else class="space-y-4">

          <div v-if="isRegister">
            <label class="text-xs theme-sub mb-1.5 block font-medium">{{ t('auth.fullName') }}</label>
            <input v-model="form.name" type="text" :placeholder="t('auth.fullNamePlaceholder')"
              class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors"
              style="border-color:var(--border)" @keyup.enter="submit" />
          </div>


          <div v-if="isRegister">
            <label class="text-xs theme-sub mb-1.5 block font-medium">{{ t('auth.phone') }}</label>
            <input v-model="form.phone" type="tel" :placeholder="t('auth.phonePlaceholder')"
              class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors"
              style="border-color:var(--border)" @keyup.enter="submit" />
          </div>


          <div>
            <label class="text-xs theme-sub mb-1.5 block font-medium">{{ t('auth.email') }}</label>
            <input v-model="form.email" type="email" :placeholder="t('auth.emailPlaceholder')"
              class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors"
              style="border-color:var(--border)" @keyup.enter="submit" />
          </div>


          <div>
            <label class="text-xs theme-sub mb-1.5 block font-medium">{{ t('auth.password') }}</label>
            <div class="relative">
              <input v-model="form.password" :type="showPass ? 'text' : 'password'"
                :placeholder="t('auth.passwordPlaceholder')"
                class="w-full theme-input rounded-xl px-4 py-3 pr-11 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors"
                style="border-color:var(--border)" @keyup.enter="submit" />
              <button @click="showPass = !showPass" type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 theme-muted hover:theme-text transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="!showPass" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>

            </div>
          </div>

          <button @click="submit" :disabled="loading"
            class="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? (isRegister ? t('auth.creatingAccount') : t('auth.signingIn')) : (isRegister ?
              t('auth.createAccountBtn') : t('auth.signIn')) }}
          </button>


          <p class="text-center text-sm theme-sub mt-6">
            {{ isRegister ? t('auth.alreadyHaveAccount') : t('auth.noAccount') }}
            <button @click="isRegister = !isRegister; error = null"
              class="text-blue-400 hover:text-blue-300 ml-1 font-medium transition-colors">
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
const success = ref(null)
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
      success.value = t('auth.checkEmail')
      showOTP.value = true
    } else {
      // 1. بنعمل تسجيل دخول ونستنى الـ Store يخلص تماماً
      await authStore.login(form.value)
      
      // 2. بنشوف التوكن اتسيف ولا لأ
     await nextTick() 
      
      if (localStorage.getItem('cf_token')) {
      // 3. طالما اتسيف، انقل برمش العين والقلب جامد ومحدش هيقدر يطردك!
      router.push('/dashboard')
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
    success.value = 'Email verified successfully 🎉'
    // 2. 🚀 السطر السحري: بنعمل تسجيل دخول أوتوماتيك فوراً عشان الـ Store يجيب التوكن ويسيفه
    await authStore.login(form.value)
    
    // 3. ننتقل للداش بورد والقلب جامد والتوكن متسيف
    router.push('/dashboard')
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
