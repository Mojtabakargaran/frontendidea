/**
 * Utility functions for handling file downloads
 */

export interface DownloadOptions {
  filename?: string;
  defaultExtension?: string;
}

/**
 * Download a file from a URL with authentication support
 * @param url The URL to download from (can be relative or absolute)
 * @param options Download options including filename
 */
export const downloadFile = async (url: string, options: DownloadOptions = {}): Promise<void> => {
  try {
    // Ensure we use the full URL - handle relative URLs properly
    let fullUrl: string;
    if (url.startsWith('http')) {
      fullUrl = url;
    } else if (url.startsWith('/api/')) {
      // URL already has /api/, so just prepend the base domain
      fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000'}${url}`;
    } else {
      // URL doesn't have /api/, so use the full base URL
      fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'}${url}`;
    }
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      credentials: 'include', // Include cookies for session authentication
      headers: {
        'Accept': '*/*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    
    // Get the content as a blob
    const blob = await response.blob();
    
    // Get filename from response headers or use default
    let filename = options.filename;
    
    if (!filename) {
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Fallback to default filename
      if (!filename) {
        const extension = options.defaultExtension || 'csv';
        filename = `export-${new Date().toISOString().split('T')[0]}.${extension}`;
      }
    }
    
    // Create download link
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error; // Re-throw to let caller handle it
  }
};

/**
 * Download a file directly from a blob URL (for immediate downloads)
 * @param url The blob URL or direct download URL
 * @param filename The filename to use for the download
 */
export const downloadFromUrl = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Create a filename for exports based on the current date and format
 * @param prefix The filename prefix (e.g., 'audit-export', 'inventory-export')
 * @param format The file format extension
 * @returns A formatted filename
 */
export const createExportFilename = (prefix: string, format: string): string => {
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}-${date}.${format}`;
};
