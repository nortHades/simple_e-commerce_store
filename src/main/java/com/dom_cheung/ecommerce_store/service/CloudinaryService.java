package com.dom_cheung.ecommerce_store.service;

import com.cloudinary.Cloudinary;
// It's good practice to keep ObjectUtils if you plan to use it for upload parameters
// as shown in Cloudinary's official examples.
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


    public Map<String, String> uploadFile(MultipartFile file, String folderName) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File to upload is empty or null.");
        }

        Map<String, Object> uploadParams = new HashMap<>();
        uploadParams.put("resource_type", "auto");

        if (folderName != null && !folderName.trim().isEmpty()) {
            uploadParams.put("folder", folderName.trim());
        }

        LOGGER.info("Attempting to upload file: " + file.getOriginalFilename() + " with params: " + uploadParams);

        Map uploadResult;
        try {
            uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "auto",
                            "folder", (folderName != null && !folderName.trim().isEmpty()) ? folderName.trim() : null
                    )
            );
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

    public void deleteFile(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            LOGGER.warning("Request to delete file from Cloudinary with null or blank public_id.");
            return;
        }
        LOGGER.info("Placeholder: Request to delete file from Cloudinary with public_id: " + publicId + ". Actual deletion not implemented in this phase.");
        // try {
        //     Map deleteResult = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        //     LOGGER.info("Cloudinary deletion result for public_id '" + publicId + "': " + deleteResult.get("result"));
        // } catch (Exception e) {
        //     LOGGER.log(Level.SEVERE, "Error during placeholder deleteFile for public_id '" + publicId + "': " + e.getMessage(), e);
        // }
    }
}