export interface WilayaInfo {
  id: number;
  code: string;
  name_ar: string;
  name_fr: string;
  name_en: string;
}

export const ALGERIA_WILAYAS: WilayaInfo[] = [
  { id: 1, code: '01', name_ar: 'أدرار', name_fr: 'Adrar', name_en: 'Adrar' },
  { id: 2, code: '02', name_ar: 'الشلف', name_fr: 'Chlef', name_en: 'Chlef' },
  { id: 3, code: '03', name_ar: 'الأغواط', name_fr: 'Laghouat', name_en: 'Laghouat' },
  { id: 4, code: '04', name_ar: 'أم البواقي', name_fr: 'Oum El Bouaghi', name_en: 'Oum El Bouaghi' },
  { id: 5, code: '05', name_ar: 'باتنة', name_fr: 'Batna', name_en: 'Batna' },
  { id: 6, code: '06', name_ar: 'بجاية', name_fr: 'Béjaïa', name_en: 'Bejaia' },
  { id: 7, code: '07', name_ar: 'بسكرة', name_fr: 'Biskra', name_en: 'Biskra' },
  { id: 8, code: '08', name_ar: 'بشار', name_fr: 'Béchar', name_en: 'Bechar' },
  { id: 9, code: '09', name_ar: 'البليدة', name_fr: 'Blida', name_en: 'Blida' },
  { id: 10, code: '10', name_ar: 'البويرة', name_fr: 'Bouira', name_en: 'Bouira' },
  { id: 11, code: '11', name_ar: 'تمنراست', name_fr: 'Tamanrasset', name_en: 'Tamanrasset' },
  { id: 12, code: '12', name_ar: 'تبسة', name_fr: 'Tébessa', name_en: 'Tebessa' },
  { id: 13, code: '13', name_ar: 'تلمسان', name_fr: 'Tlemcen', name_en: 'Tlemcen' },
  { id: 14, code: '14', name_ar: 'تيارت', name_fr: 'Tiaret', name_en: 'Tiaret' },
  { id: 15, code: '15', name_ar: 'تيزي وزو', name_fr: 'Tizi Ouzou', name_en: 'Tizi Ouzou' },
  { id: 16, code: '16', name_ar: 'الجزائر', name_fr: 'Alger', name_en: 'Algiers' },
  { id: 17, code: '17', name_ar: 'الجلفة', name_fr: 'Djelfa', name_en: 'Djelfa' },
  { id: 18, code: '18', name_ar: 'جيجل', name_fr: 'Jijel', name_en: 'Jijel' },
  { id: 19, code: '19', name_ar: 'سطيف', name_fr: 'Sétif', name_en: 'Setif' },
  { id: 20, code: '20', name_ar: 'سعيدة', name_fr: 'Saïda', name_en: 'Saida' },
  { id: 21, code: '21', name_ar: 'سكيكدة', name_fr: 'Skikda', name_en: 'Skikda' },
  { id: 22, code: '22', name_ar: 'سيدي بلعباس', name_fr: 'Sidi Bel Abbès', name_en: 'Sidi Bel Abbes' },
  { id: 23, code: '23', name_ar: 'عنابة', name_fr: 'Annaba', name_en: 'Annaba' },
  { id: 24, code: '24', name_ar: 'قالمة', name_fr: 'Guelma', name_en: 'Guelma' },
  { id: 25, code: '25', name_ar: 'قسنطينة', name_fr: 'Constantine', name_en: 'Constantine' },
  { id: 26, code: '26', name_ar: 'المدية', name_fr: 'Médéa', name_en: 'Medea' },
  { id: 27, code: '27', name_ar: 'مستغانم', name_fr: 'Mostaganem', name_en: 'Mostaganem' },
  { id: 28, code: '28', name_ar: 'المسيلة', name_fr: "M'Sila", name_en: "M'Sila" },
  { id: 29, code: '29', name_ar: 'معسكر', name_fr: 'Mascara', name_en: 'Mascara' },
  { id: 30, code: '30', name_ar: 'ورقلة', name_fr: 'Ouargla', name_en: 'Ouargla' },
  { id: 31, code: '31', name_ar: 'وهران', name_fr: 'Oran', name_en: 'Oran' },
  { id: 32, code: '32', name_ar: 'البيض', name_fr: 'El Bayadh', name_en: 'El Bayadh' },
  { id: 33, code: '33', name_ar: 'إليزي', name_fr: 'Illizi', name_en: 'Illizi' },
  { id: 34, code: '34', name_ar: 'برج بوعريريج', name_fr: 'Bordj Bou Arreridj', name_en: 'Bordj Bou Arreridj' },
  { id: 35, code: '35', name_ar: 'بومرداس', name_fr: 'Boumerdès', name_en: 'Boumerdes' },
  { id: 36, code: '36', name_ar: 'الطارف', name_fr: 'El Tarf', name_en: 'El Tarf' },
  { id: 37, code: '37', name_ar: 'تندوف', name_fr: 'Tindouf', name_en: 'Tindouf' },
  { id: 38, code: '38', name_ar: 'تيسمسيلت', name_fr: 'Tissemsilt', name_en: 'Tissemsilt' },
  { id: 39, code: '39', name_ar: 'الوادي', name_fr: 'El Oued', name_en: 'El Oued' },
  { id: 40, code: '40', name_ar: 'خنشلة', name_fr: 'Khenchela', name_en: 'Khenchela' },
  { id: 41, code: '41', name_ar: 'سوق أهراس', name_fr: 'Souk Ahras', name_en: 'Souk Ahras' },
  { id: 42, code: '42', name_ar: 'تيبازة', name_fr: 'Tipaza', name_en: 'Tipaza' },
  { id: 43, code: '43', name_ar: 'ميلة', name_fr: 'Mila', name_en: 'Mila' },
  { id: 44, code: '44', name_ar: 'عين الدفلى', name_fr: 'Aïn Defla', name_en: 'Ain Defla' },
  { id: 45, code: '45', name_ar: 'النعامة', name_fr: 'Naâma', name_en: 'Naama' },
  { id: 46, code: '46', name_ar: 'عين تموشنت', name_fr: 'Aïn Témouchent', name_en: 'Ain Temouchent' },
  { id: 47, code: '47', name_ar: 'غرداية', name_fr: 'Ghardaïa', name_en: 'Ghardaia' },
  { id: 48, code: '48', name_ar: 'غليزان', name_fr: 'Relizane', name_en: 'Relizane' },
  { id: 49, code: '49', name_ar: 'تيميمون', name_fr: 'Timimoun', name_en: 'Timimoun' },
  { id: 50, code: '50', name_ar: 'برج باجي مختار', name_fr: 'Bordj Badji Mokhtar', name_en: 'Bordj Badji Mokhtar' },
  { id: 51, code: '51', name_ar: 'أولاد جلال', name_fr: 'Ouled Djellal', name_en: 'Ouled Djellal' },
  { id: 52, code: '52', name_ar: 'بني عباس', name_fr: 'Béni Abbès', name_en: 'Beni Abbes' },
  { id: 53, code: '53', name_ar: 'عين صالح', name_fr: 'In Salah', name_en: 'In Salah' },
  { id: 54, code: '54', name_ar: 'عين قزام', name_fr: 'In Guezzam', name_en: 'In Guezzam' },
  { id: 55, code: '55', name_ar: 'تقرت', name_fr: 'Touggourt', name_en: 'Touggourt' },
  { id: 56, code: '56', name_ar: 'جانت', name_fr: 'Djanet', name_en: 'Djanet' },
  { id: 57, code: '57', name_ar: 'المغير', name_fr: "El M'Ghair", name_en: "El M'Ghair" },
  { id: 58, code: '58', name_ar: 'المنيعة', name_fr: 'El Meniaa', name_en: 'El Meniaa' },
];

export function getWilayaDisplayName(id: number | string, lang: string = 'ar'): string {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  const wilaya = ALGERIA_WILAYAS.find(w => w.id === numericId);
  if (!wilaya) return `ولاية ${id}`;
  
  if (lang === 'fr') {
    return `${wilaya.code} - ${wilaya.name_fr}`;
  }
  if (lang === 'en') {
    return `${wilaya.code} - ${wilaya.name_en}`;
  }
  return `${wilaya.code} - ${wilaya.name_ar} (${wilaya.name_fr})`;
}

export function getWilayaArabicName(id: number | string): string {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  const wilaya = ALGERIA_WILAYAS.find(w => w.id === numericId);
  return wilaya ? `${wilaya.code} - ${wilaya.name_ar}` : `ولاية ${id}`;
}

export function getWilayaOnlyArabicName(id: number | string): string {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  const wilaya = ALGERIA_WILAYAS.find(w => w.id === numericId);
  return wilaya ? wilaya.name_ar : `ولاية ${id}`;
}

export function resolveWilayaFromGeo(city: string = '', region: string = ''): WilayaInfo | null {
  const cleanCity = (city || '').toLowerCase().trim();
  const cleanRegion = (region || '').replace(/^dz-/i, '').toLowerCase().trim();

  // 1. Try matching region code (e.g. "16", "31", "05")
  const numRegion = parseInt(cleanRegion);
  if (!isNaN(numRegion) && numRegion >= 1 && numRegion <= 58) {
    const found = ALGERIA_WILAYAS.find(w => w.id === numRegion);
    if (found) return found;
  }

  // 2. Try matching city name against Wilaya name_fr or name_en or name_ar
  if (cleanCity) {
    const found = ALGERIA_WILAYAS.find(w => 
      w.name_fr.toLowerCase() === cleanCity ||
      w.name_en.toLowerCase() === cleanCity ||
      w.name_ar === cleanCity ||
      cleanCity.includes(w.name_fr.toLowerCase()) ||
      w.name_fr.toLowerCase().includes(cleanCity)
    );
    if (found) return found;
  }

  // 3. Special Algerian city aliases
  const aliases: Record<string, number> = {
    'algiers': 16,
    'alger': 16,
    'oran': 31,
    'wahran': 31,
    'constantine': 25,
    'qsentina': 25,
    'annaba': 23,
    'bone': 23,
    'blida': 9,
    'setif': 19,
    'sétif': 19,
    'batna': 5,
    'chlef': 2,
    'tlemcen': 13,
    'bejaia': 6,
    'béjaïa': 6,
    'biskra': 7,
    'bechar': 8,
    'béchar': 8,
    'bouira': 10,
    'tamanrasset': 11,
    'tebessa': 12,
    'tébessa': 12,
    'tiaret': 14,
    'tizi ouzou': 15,
    'djelfa': 17,
    'jijel': 18,
    'saida': 20,
    'saïda': 20,
    'skikda': 21,
    'sidi bel abbes': 22,
    'guelma': 24,
    'medea': 26,
    'médéa': 26,
    'mostaganem': 27,
    'msila': 28,
    'mascara': 29,
    'ouargla': 30,
    'el bayadh': 32,
    'illizi': 33,
    'bordj bou arreridj': 34,
    'boumerdes': 35,
    'boumerdès': 35,
    'el tarf': 36,
    'tindouf': 37,
    'tissemsilt': 38,
    'el oued': 39,
    'khenchela': 40,
    'souk ahras': 41,
    'tipaza': 42,
    'mila': 43,
    'ain defla': 44,
    'aïn defla': 44,
    'naama': 45,
    'naâma': 45,
    'ain temouchent': 46,
    'aïn témouchent': 46,
    'ghardaia': 47,
    'ghardaïa': 47,
    'relizane': 48,
    'timimoun': 49,
    'bordj badji mokhtar': 50,
    'ouled djellal': 51,
    'beni abbes': 52,
    'béni abbès': 52,
    'in salah': 53,
    'in guezzam': 54,
    'touggourt': 55,
    'djanet': 56,
    'el mghair': 57,
    'el meniaa': 58,
    'el menia': 58,
  };

  for (const [alias, id] of Object.entries(aliases)) {
    if (cleanCity.includes(alias) || cleanRegion.includes(alias)) {
      return ALGERIA_WILAYAS.find(w => w.id === id) || null;
    }
  }

  return null;
}
