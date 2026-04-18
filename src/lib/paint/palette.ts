export interface PaintColor {
  name: string
  hex: string
  code?: string   // PPG or Sikkens code
  finish: 'solid' | 'metallic' | 'pearl' | 'matte'
}

export const PRESET_COLORS: PaintColor[] = [
  // Solids
  { name: 'Blanco Ártico', hex: '#F8F8F8', code: 'PPG1025-1', finish: 'solid' },
  { name: 'Negro Profundo', hex: '#0A0A0A', code: 'PPG0994-7', finish: 'solid' },
  { name: 'Rojo Fuego', hex: '#C0392B', code: 'PPG1071-7', finish: 'solid' },
  { name: 'Azul Marino', hex: '#1A3A5C', code: 'PPG1163-7', finish: 'solid' },
  { name: 'Verde Bosque', hex: '#2D5A27', code: 'PPG0094-7', finish: 'solid' },
  // Metallics
  { name: 'Plata Estelar', hex: '#A8A8A8', code: 'PPG0995-3', finish: 'metallic' },
  { name: 'Gris Titanio', hex: '#6B6B6B', code: 'PPG0994-5', finish: 'metallic' },
  { name: 'Azul Glaciar', hex: '#4A90D9', code: 'PPG1163-5', finish: 'metallic' },
  { name: 'Bronce Antiguo', hex: '#8C6239', code: 'PPG1073-5', finish: 'metallic' },
  { name: 'Verde Esmeralda', hex: '#2E8B57', code: 'PPG0094-5', finish: 'metallic' },
  // Pearls
  { name: 'Blanco Perla', hex: '#F0EBD8', code: 'S-5000', finish: 'pearl' },
  { name: 'Champagne', hex: '#D4B896', code: 'S-5001', finish: 'pearl' },
  { name: 'Rojo Cereza', hex: '#8B1A1A', code: 'S-5002', finish: 'pearl' },
  // Mattes
  { name: 'Negro Mate', hex: '#1A1A1A', code: 'M-001', finish: 'matte' },
  { name: 'Gris Cemento', hex: '#7A7A7A', code: 'M-002', finish: 'matte' },
  { name: 'Verde Oliva', hex: '#6B7C45', code: 'M-003', finish: 'matte' },
]
