package com.staysphere.backend.repository;

import com.staysphere.backend.model.RewardPoints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RewardPointsRepository extends JpaRepository<RewardPoints, Long> {
    List<RewardPoints> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(CASE WHEN rp.transactionType = 'EARNED' THEN rp.points ELSE -rp.points END), 0) FROM RewardPoints rp WHERE rp.user.id = :userId")
    int getBalanceByUserId(@Param("userId") Long userId);
}
