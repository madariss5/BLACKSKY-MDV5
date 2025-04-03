/**
 * SVG to PNG/JPEG Converter for BLACKSKY-MD
 * 
 * This utility converts SVG files to PNG or JPEG format for compatibility with WhatsApp
 * and other systems that may not properly handle SVG files.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Convert an SVG file to PNG format
 * 
 * @param {string|Buffer} svgPath - Path to SVG file or SVG buffer
 * @param {Object} options - Conversion options
 * @param {number} options.width - Width of the output image (default: 500)
 * @param {number} options.height - Height of the output image (default: 500)
 * @param {string} options.background - Background color (default: transparent)
 * @returns {Promise<Buffer>} - PNG buffer
 */
async function svgToPng(svgPath, options = {}) {
    try {
        const { width = 350, height = 350, background = { r: 0, g: 0, b: 0, alpha: 0 } } = options;
        let svgBuffer;

        // Handle either file path or direct buffer input
        if (typeof svgPath === 'string') {
            // Get absolute path if relative
            const absolutePath = path.isAbsolute(svgPath) ? svgPath : path.join(process.cwd(), svgPath);
            console.log(`Converting SVG file: ${absolutePath}`);
            
            // Check if file exists
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`SVG file not found: ${absolutePath}`);
            }
            
            // Read SVG file
            svgBuffer = fs.readFileSync(absolutePath);
        } else if (Buffer.isBuffer(svgPath)) {
            svgBuffer = svgPath;
        } else {
            throw new Error('Invalid input: expected file path or Buffer');
        }

        // Convert SVG to PNG using Sharp
        const pngBuffer = await sharp(svgBuffer)
            .resize(width, height)
            .flatten({ background })
            .png()
            .toBuffer();

        console.log('SVG successfully converted to PNG');
        return pngBuffer;
    } catch (error) {
        console.error('Error converting SVG to PNG:', error);
        throw error;
    }
}

/**
 * Convert an SVG file to JPEG format
 * 
 * @param {string|Buffer} svgPath - Path to SVG file or SVG buffer
 * @param {Object} options - Conversion options
 * @param {number} options.width - Width of the output image (default: 500)
 * @param {number} options.height - Height of the output image (default: 500)
 * @param {string} options.background - Background color (default: white)
 * @param {number} options.quality - JPEG quality (default: 90)
 * @returns {Promise<Buffer>} - JPEG buffer
 */
async function svgToJpeg(svgPath, options = {}) {
    try {
        const { width = 350, height = 350, background = { r: 255, g: 255, b: 255, alpha: 1 }, quality = 90 } = options;
        let svgBuffer;

        // Handle either file path or direct buffer input
        if (typeof svgPath === 'string') {
            // Get absolute path if relative
            const absolutePath = path.isAbsolute(svgPath) ? svgPath : path.join(process.cwd(), svgPath);
            console.log(`Converting SVG file: ${absolutePath}`);
            
            // Check if file exists
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`SVG file not found: ${absolutePath}`);
            }
            
            // Read SVG file
            svgBuffer = fs.readFileSync(absolutePath);
        } else if (Buffer.isBuffer(svgPath)) {
            svgBuffer = svgPath;
        } else {
            throw new Error('Invalid input: expected file path or Buffer');
        }

        // Convert SVG to JPEG using Sharp
        const jpegBuffer = await sharp(svgBuffer)
            .resize(width, height)
            .flatten({ background })
            .jpeg({
                quality: quality
            })
            .toBuffer();

        console.log('SVG successfully converted to JPEG');
        return jpegBuffer;
    } catch (error) {
        console.error('Error converting SVG to JPEG:', error);
        throw error;
    }
}

/**
 * Get the default BLACKSKY-MD Premium logo path
 * @returns {string} - Path to the default logo
 */
function getDefaultLogoPath() {
    const options = [
        'blacksky-premium-gradient.svg', // New gradient logo (preferred)
        'blacksky-premium-logo.svg',
        'blacksky-logo-premium.svg',
        'blacksky-logo-cosmic.svg',
        'blacksky-logo.svg'
    ];
    
    // Return the first logo that exists
    for (const logoPath of options) {
        if (fs.existsSync(logoPath)) {
            return logoPath;
        }
    }
    
    // If no logo found, return the default
    return 'blacksky-logo.svg';
}

module.exports = {
    svgToPng,
    svgToJpeg,
    getDefaultLogoPath
};