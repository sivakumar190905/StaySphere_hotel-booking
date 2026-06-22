package com.staysphere.backend.repository;

import com.staysphere.backend.model.PartnerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PartnerRequestRepository extends JpaRepository<PartnerRequest, Long> {
    Optional<PartnerRequest> findByEmail(String email);
    Boolean existsByEmail(String email);
}
