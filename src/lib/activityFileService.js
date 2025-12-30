import { supabase } from './supabase';

const BUCKET_NAME = 'activities';

/**
 * Upload a file to the activities bucket
 * @param {File} file - The file to upload
 * @param {string} folder - Folder path (e.g., 'instructions' or 'submissions')
 * @param {string} userId - User ID for unique naming
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadActivityFile = async (file, folder, userId) => {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${folder}/${userId}/${timestamp}_${sanitizedName}`;

    // Upload file
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
};

/**
 * Delete a file from the activities bucket
 * @param {string} fileUrl - Public URL of the file
 */
export const deleteActivityFile = async (fileUrl) => {
    // Extract path from URL
    const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
        console.error('Delete error:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
    }
};

/**
 * Get file info from URL
 * @param {string} url - File URL
 * @returns {{ name: string, extension: string }}
 */
export const getFileInfoFromUrl = (url) => {
    if (!url) return null;

    const parts = url.split('/');
    const fullName = parts[parts.length - 1];
    // Remove timestamp prefix
    const name = fullName.replace(/^\d+_/, '');
    const extension = name.split('.').pop()?.toLowerCase() || '';

    return { name, extension };
};

/**
 * Get icon type based on file extension
 * @param {string} extension 
 * @returns {string} - 'pdf', 'image', 'video', 'doc', or 'file'
 */
export const getFileType = (extension) => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'mov', 'avi'];
    const docExts = ['doc', 'docx', 'txt', 'rtf'];

    if (extension === 'pdf') return 'pdf';
    if (imageExts.includes(extension)) return 'image';
    if (videoExts.includes(extension)) return 'video';
    if (docExts.includes(extension)) return 'doc';
    return 'file';
};
