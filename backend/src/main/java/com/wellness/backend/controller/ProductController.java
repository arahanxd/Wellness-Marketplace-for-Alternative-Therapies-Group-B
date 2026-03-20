package com.wellness.backend.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.wellness.backend.dto.ProductRequestDTO;
import com.wellness.backend.dto.ProductResponseDTO;
import com.wellness.backend.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    /**
     * Create Product
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ProductResponseDTO> createProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") java.math.BigDecimal price,
            @RequestParam("discountPercentage") Integer discountPercentage,
            @RequestParam("providerId") Long providerId,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "additionalImages", required = false) List<MultipartFile> additionalImages) throws IOException {

        System.out.println("DEBUG: Creating product with name: " + name);

        ProductRequestDTO request = new ProductRequestDTO();
        request.setName(name);
        request.setDescription(description);
        request.setPrice(price);
        request.setDiscountPercentage(discountPercentage);
        request.setImage(image);
        request.setAdditionalImages(additionalImages);

        ProductResponseDTO response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update Product
     */
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id,
            @ModelAttribute ProductRequestDTO request) throws IOException {

        ProductResponseDTO response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all products
     */
    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    /**
     * Get product by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /**
     * Get products of a provider
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ProductResponseDTO>> getProviderProducts(
            @PathVariable Long providerId) {

        return ResponseEntity.ok(productService.getProviderProducts(providerId));
    }

    /**
     * Delete product
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {

        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    /**
     * Delete product image
     */
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<?> deleteProductImage(@PathVariable Long imageId) {

        productService.deleteProductImage(imageId);
        return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
    }

    /**
     * Upload additional images
     */
    @PostMapping("/{id}/images")
    public ResponseEntity<ProductResponseDTO> uploadAdditionalImages(
            @PathVariable Long id,
            @RequestParam("images") List<MultipartFile> images) {

        return ResponseEntity.ok(productService.uploadAdditionalImages(id, images));
    }

    /**
     * Product stats for dashboard
     */
    @GetMapping("/stats/{productId}")
    public ResponseEntity<Map<String, Object>> getProductStats(
            @PathVariable Long productId) {

        return ResponseEntity.ok(productService.getProductStats(productId));
    }
}