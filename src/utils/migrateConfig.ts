interface LegacyPlatformConfig {
    ios: []
    android: []
    pc: []
}

export const isOldFormat = (config: unknown): config is LegacyPlatformConfig => {
    if (!config || typeof config !== 'object' || config === null) {
        return false
    }

    const configObj = config as Record<string, unknown>

    return (
        Array.isArray(configObj.ios) &&
        Array.isArray(configObj.android) &&
        Array.isArray(configObj.pc) &&
        !configObj.config &&
        !configObj.platforms
    )
}
