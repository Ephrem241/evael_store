import type { Dictionary } from "@/locales/en"

// The shopping assistant: the chat button and panel (components/assistant).
export const assistant: Dictionary["assistant"] = {
  open: "ረዳቱን ይጠይቁ",
  title: "Evael ረዳት",
  subtitle: "በGoogle Gemini የሚሰራ",
  conversation: "ከግዢ ረዳቱ ጋር የሚደረግ ውይይት",
  welcomeTitle: "ሰላም! ዛሬ በግዢዎ እንዴት ልርዳዎት?",
  welcomeText: "ስለ ምርቶች፣ ዋጋዎች፣ ቅናሾች፣ ማድረስ ወይም ክፍያ ይጠይቁኝ።",
  suggestionsLabel: "ለምሳሌ ይጠይቁ",
  suggestions: {
    gift: "ከ2,000 ብር በታች የሆነ ስጦታ እንዳገኝ እርዳኝ",
    deals: "አሁን በቅናሽ ላይ ያሉት ምርቶች የትኞቹ ናቸው?",
    delivery: "ማድረስና ክፍያ እንዴት ይሰራሉ?",
  },
  inputLabel: "ጥያቄዎ",
  placeholder: "ስለ ምርቶች፣ ማድረስ፣ ክፍያ ይጠይቁ…",
  send: "ላክ",
  stop: "አቁም",
  clear: "ውይይቱን አጽዳ",
  thinking: "እያሰበ ነው…",
  stopped: "ቆሟል።",
  you: "እርስዎ",
  assistantName: "ረዳት",
  productsLabel: "በዚህ መልስ ውስጥ ያሉ ምርቶች",
  disclaimer: "የAI መልሶች ሊሳሳቱ ይችላሉ፤ ከመግዛትዎ በፊት የምርቱን ገጽ ያረጋግጡ። የግል መረጃዎን አያጋሩ።",
  errors: {
    generic: "ይቅርታ፣ የሆነ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
    tooMany: "በአንድ ጊዜ ብዙ ጥያቄዎች ተልከዋል። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።",
    offline: "ከኢንተርኔት ጋር አልተገናኙም። ግንኙነትዎን አረጋግጠው እንደገና ይሞክሩ።",
    unavailable: "ረዳቱ አሁን አይገኝም። እባክዎ ቆይተው እንደገና ይሞክሩ።",
  },
}
