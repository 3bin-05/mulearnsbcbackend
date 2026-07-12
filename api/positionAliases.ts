export const POSITION_ALIASES: Record<string, string[]> = {
  'Lead': ['campus lead', 'lead', 'chapter lead'],
  'Co Lead': ['campus co-lead', 'campus co lead', 'co lead', 'co-lead'],
  'Enabler Lead': ['enabler lead', 'enabler'],
  'Tech Associate': ['technical advisor', 'technical advisors', 'tech associate', 'technical associate'],
  'HR': ['hr', 'hr manager', 'human resources'],
  'Mentor': ['mentor', 'advisor'],
  'IG Lead': ['ig lead', 'interest group lead', 'interest group leads'],
  'Creative Lead': ['creative lead', 'design lead', 'creative team - lead', 'creative team lead'],
  'Creative Team': ['creative team', 'design team', 'designer', 'designers'],
  'Operations Lead': ['operations lead', 'operations team lead'],
  'Operations Team': ['operations team', 'operations'],
  'Marketing Lead': ['marketing lead', 'marketing team lead'],
  'Marketing Team': ['marketing team', 'marketing', 'outreach'],
  'Media Lead': ['media lead', 'media team lead'],
  'Media Team': ['media team', 'media', 'videographer', 'photographer'],
  'MuV Lead': ['muv lead', 'muv team lead'],
  'MuV Team': ['muv team', 'muv']
};

export function normalizePosition(excelValue: string): { position: string; roleTitle: string } | null {
  const rawValue = String(excelValue || '').trim();
  if (!rawValue) return null;

  // Clean string helper: lowercase, trim, replace multiple spaces and hyphens with single space
  const clean = (s: string) =>
    s.toLowerCase()
     .replace(/[-\s]+/g, ' ')
     .trim();

  const cleanVal = clean(rawValue);

  // 1. Exact Match Pass
  for (const [standardPos, aliases] of Object.entries(POSITION_ALIASES)) {
    for (const alias of aliases) {
      if (clean(alias) === cleanVal) {
        return { position: standardPos, roleTitle: rawValue };
      }
    }
  }

  // 2. Prefix Match Pass (Sort aliases by length descending to match most specific first)
  const allAliases: { alias: string; standardPos: string }[] = [];
  for (const [standardPos, aliases] of Object.entries(POSITION_ALIASES)) {
    for (const alias of aliases) {
      allAliases.push({ alias: clean(alias), standardPos });
    }
  }
  allAliases.sort((a, b) => b.alias.length - a.alias.length);

  for (const item of allAliases) {
    if (cleanVal.startsWith(item.alias)) {
      return { position: item.standardPos, roleTitle: rawValue };
    }
  }

  // 3. Fallback match for standard positions directly (if not mapped in aliases)
  for (const standardPos of Object.keys(POSITION_ALIASES)) {
    const cleanStandard = clean(standardPos);
    if (cleanVal === cleanStandard || cleanVal.startsWith(cleanStandard)) {
      return { position: standardPos, roleTitle: rawValue };
    }
  }

  return null;
}
