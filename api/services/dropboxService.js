/**
 * Dropbox Service Module
 * 
 * Provides file operations through Dropbox API:
 * - Download files (CSV, JSON, etc.)
 * - Upload files (transcriptions, reports)
 * - List folder contents
 * - Check file existence
 * - Get file metadata
 * 
 * Usage:
 *   import DropboxService from './services/dropboxService.js';
 *   const dropbox = new DropboxService(accessToken, rootPath);
 *   const content = await dropbox.downloadFile('/path/to/file.csv');
 */

import { Dropbox } from 'dropbox';

class DropboxService {
  /**
   * Create a new DropboxService instance
   * @param {string} accessToken - Dropbox access token
   * @param {string} rootPath - Root path in Dropbox (default: '/ENTITIES/TASK_MANAGERS/RESEARCHES')
   */
  constructor(accessToken, rootPath = '/ENTITIES/TASK_MANAGERS/RESEARCHES') {
    if (!accessToken) {
      throw new Error('Dropbox access token is required');
    }
    
    // Clean token
    this.accessToken = accessToken.trim().replace(/^["']|["']$/g, '').trim();
    
    if (!this.accessToken.startsWith('sl.')) {
      throw new Error('Invalid Dropbox access token format. Token must start with "sl."');
    }
    
    this.rootPath = rootPath;
    this.dbx = new Dropbox({ accessToken: this.accessToken });
  }

  /**
   * Get full Dropbox path from relative path
   * @param {string} relativePath - Path relative to rootPath
   * @returns {string} Full Dropbox path
   */
  getFullPath(relativePath) {
    if (relativePath.startsWith('/')) {
      return relativePath; // Already absolute path
    }
    return `${this.rootPath}/${relativePath}`.replace(/\/+/g, '/');
  }

  /**
   * Download file content from Dropbox
   * @param {string} dropboxPath - Path to file in Dropbox
   * @returns {Promise<string>} File content as string
   */
  async downloadFile(dropboxPath) {
    const fullPath = this.getFullPath(dropboxPath);
    
    try {
      console.log(`📥 Dropbox: Downloading ${fullPath}`);
      const response = await this.dbx.filesDownload({ path: fullPath });
      
      // Handle binary data from Dropbox SDK
      const fileContent = response.result.fileBinary;
      
      if (Buffer.isBuffer(fileContent)) {
        return fileContent.toString('utf-8');
      }
      
      // If it's already a string or ArrayBuffer
      if (typeof fileContent === 'string') {
        return fileContent;
      }
      
      // Handle ArrayBuffer
      if (fileContent instanceof ArrayBuffer) {
        return Buffer.from(fileContent).toString('utf-8');
      }
      
      // Handle Blob (browser environment)
      if (fileContent instanceof Blob) {
        const arrayBuffer = await fileContent.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('utf-8');
      }
      
      throw new Error('Unexpected file content type');
    } catch (error) {
      const errorMessage = this.parseDropboxError(error);
      console.error(`❌ Dropbox download failed: ${errorMessage}`);
      throw new Error(`Dropbox download failed: ${errorMessage}`);
    }
  }

  /**
   * Upload file content to Dropbox
   * @param {string} dropboxPath - Path to file in Dropbox
   * @param {string|Buffer} content - File content
   * @param {string} mode - Upload mode: 'add', 'overwrite', or 'update'
   * @returns {Promise<object>} Upload result metadata
   */
  async uploadFile(dropboxPath, content, mode = 'overwrite') {
    const fullPath = this.getFullPath(dropboxPath);
    
    try {
      console.log(`📤 Dropbox: Uploading to ${fullPath}`);
      
      // Convert string to Buffer if needed
      const contentBuffer = typeof content === 'string' 
        ? Buffer.from(content, 'utf-8') 
        : content;
      
      const response = await this.dbx.filesUpload({
        path: fullPath,
        contents: contentBuffer,
        mode: { '.tag': mode },
        autorename: false,
        mute: false
      });
      
      console.log(`✅ Dropbox: Uploaded successfully to ${fullPath}`);
      return response.result;
    } catch (error) {
      const errorMessage = this.parseDropboxError(error);
      console.error(`❌ Dropbox upload failed: ${errorMessage}`);
      throw new Error(`Dropbox upload failed: ${errorMessage}`);
    }
  }

  /**
   * Check if file exists in Dropbox
   * @param {string} dropboxPath - Path to file in Dropbox
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(dropboxPath) {
    const fullPath = this.getFullPath(dropboxPath);
    
    try {
      await this.dbx.filesGetMetadata({ path: fullPath });
      return true;
    } catch (error) {
      // 409 = path/not_found
      if (error.status === 409) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata from Dropbox
   * @param {string} dropboxPath - Path to file in Dropbox
   * @returns {Promise<object>} File metadata
   */
  async getMetadata(dropboxPath) {
    const fullPath = this.getFullPath(dropboxPath);
    
    try {
      const response = await this.dbx.filesGetMetadata({ path: fullPath });
      return response.result;
    } catch (error) {
      const errorMessage = this.parseDropboxError(error);
      throw new Error(`Dropbox get metadata failed: ${errorMessage}`);
    }
  }

  /**
   * List folder contents in Dropbox
   * @param {string} dropboxPath - Path to folder in Dropbox
   * @returns {Promise<Array>} Array of file/folder entries
   */
  async listFolder(dropboxPath) {
    const fullPath = this.getFullPath(dropboxPath);
    
    try {
      console.log(`📂 Dropbox: Listing folder ${fullPath}`);
      const response = await this.dbx.filesListFolder({ path: fullPath });
      return response.result.entries;
    } catch (error) {
      const errorMessage = this.parseDropboxError(error);
      console.error(`❌ Dropbox list folder failed: ${errorMessage}`);
      throw new Error(`Dropbox list folder failed: ${errorMessage}`);
    }
  }

  /**
   * List folder contents with pagination support
   * @param {string} dropboxPath - Path to folder in Dropbox
   * @returns {Promise<Array>} Array of all file/folder entries
   */
  async listFolderAll(dropboxPath) {
    const fullPath = this.getFullPath(dropboxPath);
    const allEntries = [];
    
    try {
      let response = await this.dbx.filesListFolder({ path: fullPath });
      allEntries.push(...response.result.entries);
      
      // Handle pagination
      while (response.result.has_more) {
        response = await this.dbx.filesListFolderContinue({
          cursor: response.result.cursor
        });
        allEntries.push(...response.result.entries);
      }
      
      return allEntries;
    } catch (error) {
      const errorMessage = this.parseDropboxError(error);
      throw new Error(`Dropbox list folder failed: ${errorMessage}`);
    }
  }

  /**
   * Create folder in Dropbox
   * @param {string} dropboxPath - Path to folder in Dropbox
   * @returns {Promise<object>} Folder metadata
   */
  async createFolder(dropboxPath) {
    const fullPath = this.getFullPath(dropboxPath);
    
    try {
      console.log(`📁 Dropbox: Creating folder ${fullPath}`);
      const response = await this.dbx.filesCreateFolderV2({
        path: fullPath,
        autorename: false
      });
      return response.result.metadata;
    } catch (error) {
      // Ignore if folder already exists
      if (error.status === 409 && error.error?.error?.['.tag'] === 'path' && 
          error.error?.error?.path?.['.tag'] === 'conflict') {
        console.log(`📁 Dropbox: Folder already exists ${fullPath}`);
        return { path_display: fullPath };
      }
      const errorMessage = this.parseDropboxError(error);
      throw new Error(`Dropbox create folder failed: ${errorMessage}`);
    }
  }

  /**
   * Delete file or folder in Dropbox
   * @param {string} dropboxPath - Path to file/folder in Dropbox
   * @returns {Promise<object>} Deletion result
   */
  async delete(dropboxPath) {
    const fullPath = this.getFullPath(dropboxPath);
    
    try {
      console.log(`🗑️ Dropbox: Deleting ${fullPath}`);
      const response = await this.dbx.filesDeleteV2({ path: fullPath });
      return response.result;
    } catch (error) {
      const errorMessage = this.parseDropboxError(error);
      throw new Error(`Dropbox delete failed: ${errorMessage}`);
    }
  }

  /**
   * Test connection to Dropbox
   * @returns {Promise<object>} Account info if successful
   */
  async testConnection() {
    try {
      const response = await this.dbx.usersGetCurrentAccount();
      return {
        success: true,
        accountInfo: {
          name: response.result.name.display_name,
          email: response.result.email
        }
      };
    } catch (error) {
      const errorMessage = this.parseDropboxError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Parse Dropbox API error to readable message
   * @param {Error} error - Error from Dropbox SDK
   * @returns {string} Human-readable error message
   */
  parseDropboxError(error) {
    if (error.error?.error_summary) {
      return error.error.error_summary;
    }
    
    if (error.error?.error?.message) {
      return error.error.error.message;
    }
    
    if (error.status === 401) {
      return 'Invalid or expired access token';
    }
    
    if (error.status === 409) {
      const pathError = error.error?.error?.path?.['.tag'];
      if (pathError === 'not_found') {
        return 'File or folder not found';
      }
      if (pathError === 'conflict') {
        return 'File or folder already exists';
      }
      return `Path error: ${pathError || 'unknown'}`;
    }
    
    if (error.status === 429) {
      return 'Rate limit exceeded. Please try again later.';
    }
    
    return error.message || 'Unknown Dropbox error';
  }
}

// Export singleton factory function for convenience
let dropboxInstance = null;

/**
 * Get or create DropboxService instance
 * @param {object} settings - Dropbox settings from aiSettings
 * @returns {DropboxService|null} DropboxService instance or null if not configured
 */
export function getDropboxService(settings) {
  if (!settings?.accessToken || !settings?.enabled) {
    return null;
  }
  
  // Create new instance if token changed
  if (!dropboxInstance || dropboxInstance.accessToken !== settings.accessToken) {
    dropboxInstance = new DropboxService(settings.accessToken, settings.rootPath);
  }
  
  return dropboxInstance;
}

/**
 * Reset singleton instance (for testing or token changes)
 */
export function resetDropboxService() {
  dropboxInstance = null;
}

export default DropboxService;

