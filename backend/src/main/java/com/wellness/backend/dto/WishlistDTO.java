package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistDTO {
    private Long wishlistId;
    private String name;
    private Long userId;
    private LocalDateTime createdAt;
    private List<WishlistItemDTO> items;
}
