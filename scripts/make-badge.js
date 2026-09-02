import sharp from 'sharp';

// High-contrast, clean monochrome white badge on transparent background
// This is used by Android status bar & browser notification badge
const svg = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <!-- Rounded emblem box -->
  <rect x="8" y="8" width="80" height="80" rx="22" fill="none" stroke="#ffffff" stroke-width="8" />
  
  <!-- Habit graph wave -->
  <path d="M22 62 L38 48 L54 56 L74 34" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
  
  <!-- Target checkmark circle -->
  <circle cx="68" cy="28" r="13" fill="#ffffff" />
  <path d="M62 28 L66 32 L74 24" fill="none" stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;

async function generateBadge() {
  await sharp(Buffer.from(svg))
    .png()
    .toFile('public/notification-badge.png');

  console.log('Successfully created public/notification-badge.png');
}

generateBadge().catch(console.error);
