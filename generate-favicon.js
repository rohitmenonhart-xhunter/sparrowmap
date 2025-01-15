import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

// Create a 32x32 canvas (standard favicon size)
const canvas = createCanvas(32, 32);
const ctx = canvas.getContext('2d');

// Draw background
ctx.fillStyle = '#2563eb'; // Blue background
ctx.fillRect(0, 0, 32, 32);

// Draw a simple bird silhouette
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.moveTo(16, 8);
ctx.bezierCurveTo(22, 8, 26, 12, 26, 16);
ctx.bezierCurveTo(26, 20, 22, 24, 16, 24);
ctx.bezierCurveTo(10, 24, 6, 20, 6, 16);
ctx.bezierCurveTo(6, 12, 10, 8, 16, 8);
ctx.fill();

// Add wing
ctx.beginPath();
ctx.moveTo(16, 14);
ctx.bezierCurveTo(19, 14, 22, 16, 22, 18);
ctx.bezierCurveTo(22, 20, 19, 22, 16, 22);
ctx.fill();

// Save as PNG
const buffer = canvas.toBuffer('image/png');
writeFileSync('public/favicon.png', buffer); 