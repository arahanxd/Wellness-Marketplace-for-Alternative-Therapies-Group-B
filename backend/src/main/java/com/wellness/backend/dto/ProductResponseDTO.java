package com.wellness.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProductResponseDTO {
    private Long productId;
    private String name;
    private String description;
    private BigDecimal price;
    private Long providerId;
    private String providerName;
    private String imageUrl;
    private LocalDateTime createdAt;
    private List<ProductImageResponseDTO> additionalImages;
    private Integer discountPercentage;
    private Double averageRating;
    private Long reviewCount;
    private Long questionCount;
}
