/**
 * Icon Generator for Chrome Extension
 * Creates icons for the extension in various sizes
 */

const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
    console.log('✓ Created icons directory');
}

// Try to use canvas if available
try {
    const { createCanvas } = require('canvas');
    
    // Icon sizes needed
    const sizes = [16, 32, 48, 128];
    
    sizes.forEach(size => {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#2d2d2d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Add a border
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = Math.max(2, size / 32);
        ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth);
        
        // Add a magnifying glass icon
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 4;
        
        // Draw circle (lens)
        ctx.beginPath();
        ctx.arc(centerX - size / 8, centerY - size / 8, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = Math.max(2, size / 16);
        ctx.stroke();
        
        // Draw handle
        ctx.beginPath();
        ctx.moveTo(centerX + size / 8, centerY + size / 8);
        ctx.lineTo(centerX + size / 4, centerY + size / 4);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = Math.max(2, size / 16);
        ctx.stroke();
        
        // Save the icon
        const buffer = canvas.toBuffer('image/png');
        const filename = path.join(iconsDir, `icon${size}.png`);
        fs.writeFileSync(filename, buffer);
        console.log(`✓ Generated icon${size}.png`);
    });
    
    console.log('\n✨ All icons generated successfully!');
} catch (error) {
    console.log('\n⚠️  Canvas module not available, creating placeholder icons...');
    
    // Create simple SVG-based placeholder icons if canvas is not available
    const sizes = [16, 32, 48, 128];
    
    sizes.forEach(size => {
        // Create a simple SVG icon
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1a1a1a"/>
  <rect x="1" y="1" width="${size - 2}" height="${size - 2}" fill="none" stroke="#ffd700" stroke-width="2"/>
  <circle cx="${size / 2 - size / 8}" cy="${size / 2 - size / 8}" r="${size / 4}" fill="none" stroke="#ffd700" stroke-width="2"/>
  <line x1="${size / 2 + size / 8}" y1="${size / 2 + size / 8}" x2="${size / 2 + size / 4}" y2="${size / 2 + size / 4}" stroke="#ffd700" stroke-width="2"/>
</svg>`;
        
        const filename = path.join(iconsDir, `icon${size}.svg`);
        fs.writeFileSync(filename, svg);
        console.log(`✓ Generated icon${size}.svg (placeholder)`);
    });
    
    console.log('\n⚠️  SVG placeholders created. For best results, install canvas:');
    console.log('   npm install canvas');
}
