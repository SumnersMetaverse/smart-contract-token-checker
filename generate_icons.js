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
    
    // Design constants
    const BORDER_WIDTH_RATIO = 32; // Divide size by this for border width
    const STROKE_WIDTH_RATIO = 16; // Divide size by this for stroke width
    const MIN_BORDER_WIDTH = 2;
    const MIN_STROKE_WIDTH = 2;
    
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
        ctx.lineWidth = Math.max(MIN_BORDER_WIDTH, size / BORDER_WIDTH_RATIO);
        ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth);
        
        // Add a magnifying glass icon
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 4;
        
        // Draw circle (lens)
        ctx.beginPath();
        ctx.arc(centerX - size / 8, centerY - size / 8, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = Math.max(MIN_STROKE_WIDTH, size / STROKE_WIDTH_RATIO);
        ctx.stroke();
        
        // Draw handle
        ctx.beginPath();
        ctx.moveTo(centerX + size / 8, centerY + size / 8);
        ctx.lineTo(centerX + size / 4, centerY + size / 4);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = Math.max(MIN_STROKE_WIDTH, size / STROKE_WIDTH_RATIO);
        ctx.stroke();
        
        // Save the icon
        const buffer = canvas.toBuffer('image/png');
        const filename = path.join(iconsDir, `icon${size}.png`);
        fs.writeFileSync(filename, buffer);
        console.log(`✓ Generated icon${size}.png`);
    });
    
    console.log('\n✨ All icons generated successfully!');
} catch (error) {
    console.error('\n❌ Canvas module not available!');
    console.error('   Chrome extensions require PNG icons, not SVG.');
    console.error('   Please install the canvas module to generate icons:');
    console.error('   npm install canvas');
    console.error('\n   Error details:', error.message);
    process.exit(1);
}
