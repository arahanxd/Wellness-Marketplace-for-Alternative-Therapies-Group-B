package com.wellness.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class ProductRequestDTO {

    // Product basic details
    private String name;

    private String description;

    private BigDecimal price;

    private Integer discountPercentage;

    // Main product image
    private MultipartFile image;

    // Additional product images
    private List<MultipartFile> additionalImages;
}