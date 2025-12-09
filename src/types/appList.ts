// export interface IAppConfig {
//     id: `${Lowercase<string>}`
//     name: string
//     isFeatured: boolean
//     isNeedBase64Encoding?: boolean
//     urlScheme: string
//     installationStep: {
//         buttons: {
//             buttonLink: string
//             buttonText: {
//                 en: string
//                 fa: string
//                 ru: string
//             }
//         }[]
//         description: {
//             en: string
//             fa: string
//             ru: string
//         }
//     }
//     addSubscriptionStep: {
//         description: {
//             en: string
//             fa: string
//             ru: string
//         }
//     }
//     connectAndUseStep: {
//         description: {
//             en: string
//             fa: string
//             ru: string
//         }
//     }
//     additionalBeforeAddSubscriptionStep?: {
//         buttons: {
//             buttonLink: string
//             buttonText: {
//                 en: string
//                 fa: string
//                 ru: string
//             }
//         }[]
//         description: {
//             en: string
//             fa: string
//             ru: string
//         }
//         title: {
//             en: string
//             fa: string
//             ru: string
//         }
//     }
//     additionalAfterAddSubscriptionStep?: {
//         buttons: {
//             buttonLink: string
//             buttonText: {
//                 en: string
//                 fa: string
//                 ru: string
//             }
//         }[]
//         description: {
//             en: string
//             fa: string
//             ru: string
//         }
//         title: {
//             en: string
//             fa: string
//             ru: string
//         }
//     }
// }

// export interface IPlatformConfig {
//     ios: IAppConfig[]
//     android: IAppConfig[]
//     pc: IAppConfig[]
// }


export type TAdditionalLocales = 'fa' | 'ru' | 'zh'
export type TEnabledLocales = 'en' | TAdditionalLocales
export type TPlatform = 'android' | 'androidTV' | 'appleTV' | 'ios' | 'linux' | 'macos' | 'windows'

export interface ILocalizedText {
    en: string
    fa?: string
    ru?: string
    zh?: string
}

export interface IStep {
    description: ILocalizedText
}

export interface IButton {
    buttonLink: string
    buttonText: ILocalizedText
}
export interface ITitleStep extends IStep {
    buttons: IButton[]
    title: ILocalizedText
}

export interface IAppConfig {
    additionalAfterAddSubscriptionStep?: ITitleStep
    additionalBeforeAddSubscriptionStep?: ITitleStep
    addSubscriptionStep: IStep
    connectAndUseStep: IStep
    id: string
    installationStep: {
        buttons: IButton[]
        description: ILocalizedText
    }
    isFeatured: boolean
    isNeedBase64Encoding?: boolean
    name: string
    urlScheme: string
}

export interface ISubscriptionPageConfiguration {
    additionalLocales: TAdditionalLocales[]
    branding?: {
        logoUrl?: string
        name?: string
        supportUrl?: string
    }
}

export interface ISubscriptionPageAppConfig {
    config: ISubscriptionPageConfiguration
    platforms: Record<TPlatform, IAppConfig[]>
}

