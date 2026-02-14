package com.wellnesshub.backend.practitioner;

import org.springframework.data.jpa.repository.JpaRepository;
import com.wellnesshub.backend.user.UserEntity;
import java.util.Optional;

public interface PractitionerProfileRepository extends JpaRepository<PractitionerProfileEntity, Long> {
    Optional<PractitionerProfileEntity> findByUser(UserEntity user);
}
