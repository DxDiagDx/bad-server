export const validateImageFormat = (buffer: Buffer): boolean => {
  // PNG: 89 50 4E 47
  if (buffer.readUInt32BE(0) === 0x89504E47) return true;
  
  // JPEG: FF D8 FF
  if (buffer.readUInt16BE(0) === 0xFFD8) return true;
  
  // GIF: 47 49 46 38
  if (buffer.readUInt32BE(0) === 0x47494638) return true;
  
  return false;
};