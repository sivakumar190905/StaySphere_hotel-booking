package com.staysphere.backend.repository;

import com.staysphere.backend.model.GuestRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GuestRequestRepository extends JpaRepository<GuestRequest, Long> {
    List<GuestRequest> findByBookingId(String bookingId);
    List<GuestRequest> findByBookingHotelOwnerId(Long ownerId);
    List<GuestRequest> findByBookingHotelId(String hotelId);
}
