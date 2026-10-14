package com.example.Biblioteca.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final Map<String, String> IMAGE_EXTENSIONS = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif"
    );

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${supabase.storage.url}")
    private String supabaseUrl;

    @Value("${supabase.storage.bucket:avatars}")
    private String bucket;

    @Value("${supabase.storage.service-key:}")
    private String serviceKey;

    public String uploadAvatar(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo de imagen está vacío.");
        }

        String contentType = file.getContentType();
        String extension = IMAGE_EXTENSIONS.get(contentType);
        if (extension == null) {
            throw new IllegalArgumentException("Formato no permitido. Usa JPG, PNG, WEBP o GIF.");
        }
        if (serviceKey == null || serviceKey.isBlank()) {
            throw new IllegalStateException(
                    "Configura SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del backend.");
        }

        String objectName = UUID.randomUUID() + "." + extension;
        URI uploadUri = UriComponentsBuilder.fromUriString(supabaseUrl)
                .pathSegment("storage", "v1", "object", bucket, objectName)
                .build()
                .encode()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(serviceKey);
        headers.set("apikey", serviceKey);
        headers.setContentType(MediaType.parseMediaType(contentType));

        restTemplate.exchange(
                uploadUri,
                HttpMethod.POST,
                new HttpEntity<>(file.getBytes(), headers),
                String.class);
        return UriComponentsBuilder.fromUriString(supabaseUrl)
                .pathSegment("storage", "v1", "object", "public", bucket, objectName)
                .build()
                .encode()
                .toUriString();
    }
}
