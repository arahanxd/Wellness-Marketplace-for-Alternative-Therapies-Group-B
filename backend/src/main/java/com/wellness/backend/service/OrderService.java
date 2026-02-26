package com.wellness.backend.service;

import com.wellness.backend.dto.OrderRequestDTO;
import com.wellness.backend.dto.OrderResponseDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.OrderEntity;
import com.wellness.backend.model.ProductEntity;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.OrderRepository;
import com.wellness.backend.repository.ProductRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<OrderResponseDTO> getOrdersByUserId(Long userId) {
        return orderRepository.findByUser_Id(userId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<OrderResponseDTO> getOrdersByProviderId(Long providerId) {
        return orderRepository.findByProductProviderId(providerId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public OrderResponseDTO createOrder(String userEmail, OrderRequestDTO request) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        ProductEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));

        BigDecimal totalPrice = product.getPrice().multiply(new BigDecimal(request.getQuantity()));

        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setProduct(product);
        order.setQuantity(request.getQuantity());
        order.setTotalPrice(totalPrice);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setDeliveryStatus("PROCESSING");
        order.setPatient(user);

        OrderEntity savedOrder = orderRepository.save(order);

        return toResponseDto(savedOrder);
    }

    private OrderResponseDTO toResponseDto(OrderEntity order) {
        return OrderResponseDTO.builder()
                .orderId(order.getOrderId())
                .userEmail(order.getUser().getEmail())
                .productName(order.getProduct().getName())
                .quantity(order.getQuantity())
                .totalPrice(order.getTotalPrice())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .deliveryStatus(order.getDeliveryStatus())
                .build();
    }
}
