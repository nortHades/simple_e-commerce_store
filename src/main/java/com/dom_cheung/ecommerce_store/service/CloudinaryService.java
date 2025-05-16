package com.dom_cheung.ecommerce_store.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class CloudinaryService {

    private static final Logger LOGGER = Logger.getLogger(CloudinaryService.class.getName());

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Upload a file to Cloudinary with optimization options
     * @param file The file to upload
     * @param folderName The folder to upload to
     * @param imageType The type of image (THUMBNAIL, DETAIL, or ORIGINAL)
     * @return Map containing secure_url and public_id
     * @throws IOException If upload fails
     */
    public Map<String, String> uploadFile(MultipartFile file, String folderName, ImageType imageType) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File to upload is empty or null.");
        }

        Map<String, Object> options = new HashMap<>();
        options.put("resource_type", "auto");

        if (folderName != null && !folderName.trim().isEmpty()) {
            options.put("folder", folderName.trim());
        }

        // Apply image optimization based on type
        if (imageType != ImageType.ORIGINAL) {
            Map<String, Object> transformation = new HashMap<>();

            if (imageType == ImageType.THUMBNAIL) {
                // Thumbnail settings: 400x400, 80% quality
                transformation.put("width", 400);
                transformation.put("height", 400);
                transformation.put("crop", "fill");
                transformation.put("quality", 80);
            } else if (imageType == ImageType.DETAIL) {
                // Detail settings: 800x800, 85% quality
                transformation.put("width", 800);
                transformation.put("height", 800);
                transformation.put("crop", "fill");
                transformation.put("quality", 85);
            }

            options.put("transformation", transformation);
        }

        LOGGER.info("Attempting to upload file: " + file.getOriginalFilename() + " with options: " + options);

        Map uploadResult;
        try {
            uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Cloudinary upload failed for file: " + file.getOriginalFilename(), e);
            throw new IOException("Cloudinary upload failed: " + e.getMessage(), e);
        }

        String secureUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        if (secureUrl == null || publicId == null) {
            LOGGER.severe("Cloudinary upload succeeded but secure_url or public_id is missing. Result: " + uploadResult);
            throw new IOException("Cloudinary upload succeeded but secure_url or public_id is missing.");
        }

        LOGGER.info("File uploaded successfully to Cloudinary. Secure URL: " + secureUrl + ", Public ID: " + publicId);

        Map<String, String> result = new HashMap<>();
        result.put("secure_url", secureUrl);
        result.put("public_id", publicId);
        return result;
    }

    /**
     * Upload a file using default optimization (DETAIL image type)
     */
    public Map<String, String> uploadFile(MultipartFile file, String folderName) throws IOException {
        return uploadFile(file, folderName, ImageType.DETAIL);
    }

    /**
     * Delete a file from Cloudinary
     */
    public void deleteFile(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            LOGGER.warning("Request to delete file from Cloudinary with null or blank public_id.");
            return;
        }

        try {
            Map deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            LOGGER.info("Cloudinary deletion result for public_id '" + publicId + "': " + deleteResult.get("result"));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error during deleteFile for public_id '" + publicId + "': " + e.getMessage(), e);
        }
    }

    /**
     * Image type enum for optimization options
     */
    public enum ImageType {
        THUMBNAIL,  // 400x400, 80% quality
        DETAIL,     // 800x800, 85% quality
        ORIGINAL    // No transformation
    }
}