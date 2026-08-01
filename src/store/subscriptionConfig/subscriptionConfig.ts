import {
    TSubscriptionPageLanguageCode,
    TSubscriptionPageRawConfig
} from '@remnawave/subscription-page-types'
import LanguageDetector from 'i18next-browser-languagedetector'
import { create } from 'zustand'

import { IActions, IState } from './interfaces'

const detector = new LanguageDetector()
detector.init({
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage']
})

function detectLanguage(
    supportedLocales: TSubscriptionPageLanguageCode[]
): TSubscriptionPageLanguageCode {
    const detected = detector.detect()

    const lang = Array.isArray(detected) ? detected[0] : detected
    const shortLang = lang?.split('-')[0]

    if (shortLang && supportedLocales.includes(shortLang as TSubscriptionPageLanguageCode)) {
        detector.cacheUserLanguage(shortLang)
        return shortLang as TSubscriptionPageLanguageCode
    }

    return supportedLocales[0]!
}

const initialState: IState = {
    config: null,
    currentLang: 'en',
    isConfigLoaded: false
}

export const useSubscriptionConfigStore = create<IActions & IState>()((set) => ({
    ...initialState,
    actions: {
        setConfig: (config: TSubscriptionPageRawConfig) => {
            const detectedLang = detectLanguage(config.locales)

            set({
                config,
                currentLang: detectedLang,
                isConfigLoaded: true
            })
        },

        setConfigLoading: () => {
            set({ isConfigLoaded: false })
        },

        setLanguage: (lang: TSubscriptionPageLanguageCode) => {
            detector.cacheUserLanguage(lang)
            set({ currentLang: lang })
        },

        getInitialState: () => {
            return initialState
        },

        resetState: async () => {
            set({ ...initialState })
        }
    }
}))

export const useSubscriptionConfigStoreActions = () =>
    useSubscriptionConfigStore((store) => store.actions)

export const useSubscriptionConfigNullable = () =>
    useSubscriptionConfigStore((state) => state.config)

export const useSubscriptionConfig = (): TSubscriptionPageRawConfig => {
    const config = useSubscriptionConfigStore((state) => state.config)
    return config as TSubscriptionPageRawConfig
}

export const useLocales = () => useSubscriptionConfigStore((state) => state.config!.locales)

export const useCurrentLang = () => useSubscriptionConfigStore((state) => state.currentLang)

export const useIsConfigLoaded = () => useSubscriptionConfigStore((state) => state.isConfigLoaded)
