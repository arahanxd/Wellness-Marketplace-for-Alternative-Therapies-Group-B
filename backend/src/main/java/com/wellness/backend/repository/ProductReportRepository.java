package com.wellness.backend.repository;

import com.wellness.backend.model.ProductReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReportRepository extends JpaRepository<ProductReportEntity, Long> {
    List<ProductReportEntity> findByStatus(String status);
}
