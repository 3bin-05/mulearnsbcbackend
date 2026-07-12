import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as XLSX from 'xlsx';
import { normalizePosition } from './positionAliases';

interface ValidationError {
  row: number;
  field: string;
  error: string;
  value: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Only POST requests are supported.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { fileData } = body || {};

    if (!fileData) {
      return res.status(400).json({ error: 'Missing fileData in request body.' });
    }

    // Decode base64
    const buffer = Buffer.from(fileData, 'base64');
    
    // Read workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON array (header: 1 means raw array of arrays)
    const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    if (rawRows.length === 0) {
      return res.status(422).json({ error: 'Excel sheet is empty.' });
    }

    // Identify header row
    const headers = rawRows[0].map((h: any) => String(h || '').trim().toLowerCase());
    
    // Header mappings
    const nameIndex = headers.findIndex((h: string) => h === 'full name' || h === 'name');
    const mulearnIdIndex = headers.findIndex((h: string) => h === 'mulearn id' || h === 'mulearnid' || h === 'mu learn id');
    const positionIndex = headers.findIndex((h: string) => h === 'position in execom' || h === 'position' || h === 'role');
    const branchIndex = headers.findIndex((h: string) => h === 'branch');
    const yearIndex = headers.findIndex((h: string) => h === 'year');
    const phoneIndex = headers.findIndex((h: string) => h === 'phone number' || h === 'phone' || h === 'phone no' || h === 'contact');
    const emailIndex = headers.findIndex((h: string) => h === 'email id' || h === 'email' || h === 'email address');
    const dobIndex = headers.findIndex((h: string) => h === 'date of birth' || h === 'dob' || h === 'birth date');
    const pictureIndex = headers.findIndex((h: string) => h === 'picture' || h === 'image' || h === 'image url' || h === 'photo');

    // Basic columns validation
    const missingHeaders: string[] = [];
    if (nameIndex === -1) missingHeaders.push('Full Name');
    if (mulearnIdIndex === -1) missingHeaders.push('MuLearn ID');
    if (positionIndex === -1) missingHeaders.push('Position in ExeCom');
    if (emailIndex === -1) missingHeaders.push('Email ID');

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        error: `Missing required column headers: ${missingHeaders.join(', ')}`
      });
    }

    const members: any[] = [];
    const errors: ValidationError[] = [];
    const seenMuLearnIds = new Set<string>();
    const seenEmails = new Set<string>();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Start parsing from index 1 (ignoring header row)
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0 || row.every((cell: any) => cell === undefined || cell === null || String(cell).trim() === '')) {
        continue; // Ignore empty rows
      }

      const rowNum = i + 1; // 1-indexed for human readability (header is row 1)

      const name = String(row[nameIndex] || '').trim();
      const mulearnId = String(row[mulearnIdIndex] || '').trim();
      const position = String(row[positionIndex] || '').trim();
      const branch = branchIndex !== -1 ? String(row[branchIndex] || '').trim() : '';
      const year = yearIndex !== -1 ? String(row[yearIndex] || '').trim() : '';
      const phone = phoneIndex !== -1 ? String(row[phoneIndex] || '').trim() : '';
      const email = String(row[emailIndex] || '').trim();
      const dob = dobIndex !== -1 ? String(row[dobIndex] || '').trim() : '';
      const imageUrl = pictureIndex !== -1 ? String(row[pictureIndex] || '').trim() : '';

      let hasRowError = false;
      let normalizedPosInfo: { position: string; roleTitle: string } | null = null;

      // 1. Name Validation
      if (!name) {
        errors.push({ row: rowNum, field: 'Full Name', error: 'Full Name is required and cannot be empty.', value: name });
        hasRowError = true;
      }

      // 2. MuLearn ID Validation
      if (!mulearnId) {
        errors.push({ row: rowNum, field: 'MuLearn ID', error: 'MuLearn ID is required.', value: mulearnId });
        hasRowError = true;
      } else {
        const lowerId = mulearnId.toLowerCase();
        if (seenMuLearnIds.has(lowerId)) {
          errors.push({ row: rowNum, field: 'MuLearn ID', error: `Duplicate MuLearn ID: '${mulearnId}' appears multiple times in sheet.`, value: mulearnId });
          hasRowError = true;
        } else {
          seenMuLearnIds.add(lowerId);
        }
      }

      // 3. Position Validation
      if (!position) {
        errors.push({ row: rowNum, field: 'Position', error: 'Position in ExeCom is required.', value: position });
        hasRowError = true;
      } else {
        normalizedPosInfo = normalizePosition(position);
        if (!normalizedPosInfo) {
          errors.push({
            row: rowNum,
            field: 'Position',
            error: `Unknown Position: "${position}". Please map this position manually or add it to the position alias configuration.`,
            value: position
          });
          hasRowError = true;
        }
      }

      // 4. Email Validation
      if (!email) {
        errors.push({ row: rowNum, field: 'Email ID', error: 'Email ID is required.', value: email });
        hasRowError = true;
      } else if (!emailRegex.test(email)) {
        errors.push({ row: rowNum, field: 'Email ID', error: 'Invalid email format.', value: email });
        hasRowError = true;
      } else {
        const lowerEmail = email.toLowerCase();
        if (seenEmails.has(lowerEmail)) {
          errors.push({ row: rowNum, field: 'Email ID', error: `Duplicate Email ID: '${email}' appears multiple times in sheet.`, value: email });
          hasRowError = true;
        } else {
          seenEmails.add(lowerEmail);
        }
      }

      if (!hasRowError && normalizedPosInfo) {
        members.push({
          name,
          mulearnId,
          position: normalizedPosInfo.position,
          roleTitle: normalizedPosInfo.roleTitle,
          branch,
          year,
          email,
          phone,
          dob,
          imageUrl,
          socials: {
            linkedin: '',
            github: '',
            instagram: '',
            twitter: '',
            website: ''
          },
          bio: '',
          displayOrder: i,
          isActive: true
        });
      }
    }

    const nonCount = rawRows.slice(1).filter((r: any) => !r || r.length === 0 || r.every((c: any) => c === undefined || c === null || String(c).trim() === '')).length;
    const totalRows = rawRows.length - 1 - nonCount;
    const errorCount = Array.from(new Set(errors.map((e) => e.row))).length;
    const validCount = totalRows - errorCount;

    return res.status(200).json({
      summary: {
        totalFound: totalRows,
        validCount,
        errorCount,
        success: errorCount === 0
      },
      errors,
      members
    });
  } catch (error: any) {
    console.error('Excel Parsing Error:', error);
    return res.status(500).json({ error: `Internal Server Error: ${error.message || error}` });
  }
}
