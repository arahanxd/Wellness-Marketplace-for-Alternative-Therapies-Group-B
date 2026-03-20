package com.wellness.backend.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.wellness.backend.dto.ProductImageResponseDTO;
import com.wellness.backend.dto.ProductRequestDTO;
import com.wellness.backend.dto.ProductResponseDTO;
import com.wellness.backend.exception.ForbiddenActionException;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.ProductEntity;
import com.wellness.backend.model.ProductImageEntity;
import com.wellness.backend.model.ProductReviewEntity;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.ForumQuestionRepository;
import com.wellness.backend.repository.OrderRepository;
import com.wellness.backend.repository.ProductImageRepository;
import com.wellness.backend.repository.ProductRepository;
import com.wellness.backend.repository.ProductReviewRepository;
import com.wellness.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductReviewRepository reviewRepository;
    private final ForumQuestionRepository forumQuestionRepository;
    private final OrderRepository orderRepository;

    private final String UPLOAD_DIR = "uploads/products";

    public ProductResponseDTO createProduct(ProductRequestDTO request) throws IOException {

        if (request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero");
        }

        // Get logged-in user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        UserEntity provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found for email: " + email));

        ProductEntity product = new ProductEntity();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setProvider(provider);
        product.setIsDeleted(false);

        product.setDiscountPercentage(
                request.getDiscountPercentage() != null ? request.getDiscountPercentage() : 0);

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            product.setImageUrl(saveImage(request.getImage()));
        }

        ProductEntity saved = productRepository.save(product);

        if (request.getAdditionalImages() != null && !request.getAdditionalImages().isEmpty()) {
            for (MultipartFile file : request.getAdditionalImages()) {
                ProductImageEntity image = new ProductImageEntity();
                image.setImageUrl(saveImage(file));
                image.setProduct(saved);
                productImageRepository.save(image);
            }
        }

        return mapToResponseDTO(saved);
    }

    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) throws IOException {

        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        UserEntity provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (!product.getProvider().getId().equals(provider.getId())) {
            throw new ForbiddenActionException("Forbidden: You do not own this product");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());

        if (request.getDiscountPercentage() != null) {
            product.setDiscountPercentage(request.getDiscountPercentage());
        }

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            product.setImageUrl(saveImage(request.getImage()));
        }

        ProductEntity updated = productRepository.save(product);

        if (request.getAdditionalImages() != null && !request.getAdditionalImages().isEmpty()) {
            for (MultipartFile file : request.getAdditionalImages()) {
                ProductImageEntity image = new ProductImageEntity();
                image.setImageUrl(saveImage(file));
                image.setProduct(updated);
                productImageRepository.save(image);
            }
        }

        return mapToResponseDTO(updated);
    }

    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public ProductResponseDTO getProductById(Long id) {

        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        return mapToResponseDTO(product);
    }

    public List<ProductResponseDTO> getProviderProducts(Long providerId) {

        return productRepository.findByProvider_Id(providerId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public void deleteProduct(Long id) {

        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        UserEntity provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (!product.getProvider().getId().equals(provider.getId())) {
            throw new ForbiddenActionException("Forbidden: You do not own this product");
        }

        productRepository.delete(product);
    }

    public void deleteProductImage(Long imageId) {

        ProductImageEntity image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + imageId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        UserEntity provider = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (!image.getProduct().getProvider().getId().equals(provider.getId())) {
            throw new ForbiddenActionException("Forbidden: You do not own this product's images");
        }

        productImageRepository.delete(image);
    }

    public ProductResponseDTO uploadAdditionalImages(Long id, List<MultipartFile> images) {

        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        if (images != null && !images.isEmpty()) {

            for (MultipartFile file : images) {
                try {

                    ProductImageEntity image = new ProductImageEntity();
                    image.setImageUrl(saveImage(file));
                    image.setProduct(product);

                    productImageRepository.save(image);

                } catch (IOException e) {
                    throw new RuntimeException("Failed to save additional image", e);
                }
            }
        }

        return mapToResponseDTO(product);
    }

    public Map<String, Object> getProductStats(Long productId) {

        List<ProductReviewEntity> reviews = reviewRepository.findByProduct_ProductIdAndStatusNotIn(
                productId,
                Arrays.asList("REMOVED", "BLOCKED"));

        double avgRating = reviews.stream()
                .mapToInt(ProductReviewEntity::getRating)
                .average()
                .orElse(0.0);

        long reviewCount = reviews.size();

        long purchasedCount = orderRepository.findAll()
                .stream()
                .filter(o -> o.getProduct() != null &&
                        productId.equals(o.getProduct().getProductId()))
                .count();

        return Map.of(
                "averageRating", Math.round(avgRating * 10.0) / 10.0,
                "reviewCount", reviewCount,
                "purchasedCount", purchasedCount);
    }

    private String saveImage(MultipartFile file) throws IOException {

        Path uploadPath = Paths.get(UPLOAD_DIR);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "uploads/products/" + fileName;
    }

    private ProductResponseDTO mapToResponseDTO(ProductEntity entity) {

        ProductResponseDTO dto = new ProductResponseDTO();

        dto.setProductId(entity.getProductId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        dto.setProviderId(entity.getProvider().getId());
        dto.setProviderName(entity.getProvider().getName());

        dto.setDiscountPercentage(
                entity.getDiscountPercentage() != null ? entity.getDiscountPercentage() : 0);

        String imgUrl = entity.getImageUrl();

        if (imgUrl != null && !imgUrl.startsWith("http")) {
            imgUrl = "http://localhost:8080/" + imgUrl;
        }

        dto.setImageUrl(imgUrl);
        dto.setCreatedAt(entity.getCreatedAt());

        List<ProductImageResponseDTO> additionalImages = productImageRepository
                .findByProduct_ProductId(entity.getProductId())
                .stream()
                .map(img -> {

                    String url = img.getImageUrl();

                    if (url != null && !url.startsWith("http")) {
                        url = "http://localhost:8080/" + url;
                    }

                    return new ProductImageResponseDTO(img.getImageId(), url);

                })
                .collect(Collectors.toList());

        dto.setAdditionalImages(additionalImages);

        List<ProductReviewEntity> reviews = reviewRepository.findByProduct_ProductIdAndStatusNotIn(
                entity.getProductId(),
                Arrays.asList("REMOVED", "BLOCKED"));

        dto.setReviewCount(reviewRepository.countByProduct_ProductIdAndStatusNotIn(entity.getProductId(), Arrays.asList("REMOVED", "BLOCKED")));
        dto.setQuestionCount(forumQuestionRepository.countByProduct_ProductId(entity.getProductId()));

        double avgRating = reviews.stream()
                .mapToInt(ProductReviewEntity::getRating)
                .average()
                .orElse(0.0);

        dto.setAverageRating(Math.round(avgRating * 10.0) / 10.0);
        dto.setReviewCount((long) reviews.size());

        return dto;
    }
}