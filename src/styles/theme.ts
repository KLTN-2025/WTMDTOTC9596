import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

// Colors from Figma design system
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Cerulean Blue - Primary color
        cerulean: {
          50: { value: '#e6f0ff' },
          100: { value: '#b3d4ff' },
          200: { value: '#80b8ff' },
          300: { value: '#4d9cff' },
          400: { value: '#1a80ff' },
          500: { value: '#204ED3' }, // Primary
          600: { value: '#1a3fb0' },
          700: { value: '#13308d' },
          800: { value: '#0d216a' },
          900: { value: '#061247' }
        },
        // Deep Cove - Dark blue
        deepCove: {
          50: { value: '#e6e9f0' },
          100: { value: '#b3b9d3' },
          200: { value: '#8089b6' },
          300: { value: '#4d5999' },
          400: { value: '#1a297c' },
          500: { value: '#04113E' }, // Primary
          600: { value: '#030e32' },
          700: { value: '#020b26' },
          800: { value: '#02081a' },
          900: { value: '#01050e' }
        },
        // Ebony - Very dark
        ebony: {
          50: { value: '#e6e6e8' },
          100: { value: '#b3b3b8' },
          200: { value: '#808088' },
          300: { value: '#4d4d58' },
          400: { value: '#1a1a28' },
          500: { value: '#010619' }, // Primary
          600: { value: '#010514' },
          700: { value: '#01040f' },
          800: { value: '#01030a' },
          900: { value: '#000205' }
        },
        // Emerald - Success/Green
        emerald: {
          50: { value: '#e8faf0' },
          100: { value: '#b9f0d1' },
          200: { value: '#8ae6b2' },
          300: { value: '#5bdc93' },
          400: { value: '#2cd274' },
          500: { value: '#4FC479' }, // Primary
          600: { value: '#3f9d61' },
          700: { value: '#2f7649' },
          800: { value: '#1f4f31' },
          900: { value: '#0f2819' }
        },
        // Gray - Neutral
        gray: {
          50: { value: '#f9fafb' },
          100: { value: '#f3f4f6' },
          200: { value: '#e5e7eb' },
          300: { value: '#d1d5db' },
          400: { value: '#9ca3af' },
          500: { value: '#737373' }, // From Figma
          600: { value: '#4b5563' },
          700: { value: '#374151' },
          800: { value: '#1f2937' },
          900: { value: '#111827' }
        }
      }
    },
    semanticTokens: {
      colors: {
        // Cerulean Blue semantic tokens
        cerulean: {
          solid: { value: '{colors.cerulean.500}' },
          contrast: { value: '{colors.white}' },
          fg: { value: '{colors.white}' },
          muted: { value: '{colors.cerulean.100}' },
          subtle: { value: '{colors.cerulean.200}' },
          emphasized: { value: '{colors.cerulean.300}' },
          focusRing: { value: '{colors.cerulean.500}' }
        },
        // Deep Cove semantic tokens
        deepCove: {
          solid: { value: '{colors.deepCove.500}' },
          contrast: { value: '{colors.white}' },
          fg: { value: '{colors.white}' },
          muted: { value: '{colors.deepCove.100}' },
          subtle: { value: '{colors.deepCove.200}' },
          emphasized: { value: '{colors.deepCove.300}' },
          focusRing: { value: '{colors.deepCove.500}' }
        },
        // Ebony semantic tokens
        ebony: {
          solid: { value: '{colors.ebony.500}' },
          contrast: { value: '{colors.white}' },
          fg: { value: '{colors.white}' },
          muted: { value: '{colors.ebony.100}' },
          subtle: { value: '{colors.ebony.200}' },
          emphasized: { value: '{colors.ebony.300}' },
          focusRing: { value: '{colors.ebony.500}' }
        },
        // Emerald semantic tokens
        emerald: {
          solid: { value: '{colors.emerald.500}' },
          contrast: { value: '{colors.white}' },
          fg: { value: '{colors.white}' },
          muted: { value: '{colors.emerald.100}' },
          subtle: { value: '{colors.emerald.200}' },
          emphasized: { value: '{colors.emerald.300}' },
          focusRing: { value: '{colors.emerald.500}' }
        }
      }
    }
  }
})

export const system = createSystem(defaultConfig, config)
