import Feather from "@expo/vector-icons/build/Feather";

export type ExpenseCategory = 
  | 'alimentacao'
  | 'transporte'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'moradia'
  | 'outros';

export interface CategoryConfig {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  colorHex: string;
}

export const categoryConfig: Record<ExpenseCategory, CategoryConfig> = {
  alimentacao: { 
    label: "Alimentação", 
    icon: "shopping-bag", 
    color: "#fbbf24",
    colorHex: "#fbbf24" 
  },
  transporte: { 
    label: "Transporte", 
    icon: "truck", 
    color: "#60a5fa",
    colorHex: "#60a5fa" 
  },
  lazer: { 
    label: "Lazer", 
    icon: "star", 
    color: "#c084fc",
    colorHex: "#c084fc" 
  },
  saude: { 
    label: "Saúde", 
    icon: "heart", 
    color: "#f87171",
    colorHex: "#f87171" 
  },
  educacao: { 
    label: "Educação", 
    icon: "book", 
    color: "#4ade80",
    colorHex: "#4ade80" 
  },
  moradia: { 
    label: "Moradia", 
    icon: "home", 
    color: "#22d3ee",
    colorHex: "#22d3ee" 
  },
  outros: { 
    label: "Outros", 
    icon: "more-horizontal", 
    color: "#9ca3af",
    colorHex: "#9ca3af" 
  },
};