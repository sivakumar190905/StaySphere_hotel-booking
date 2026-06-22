package com.staysphere.backend.repository;

import com.staysphere.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findByHotelOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<Booking> findAllByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Booking b WHERE b.room.id = :roomId AND b.status NOT IN ('Cancelled', 'CANCELLED', 'Refunded', 'REFUNDED') AND b.checkIn < :checkout AND b.checkOut > :checkin")
    long countOverlappingBookings(
            @org.springframework.data.repository.query.Param("roomId") String roomId,
            @org.springframework.data.repository.query.Param("checkin") java.time.LocalDate checkin,
            @org.springframework.data.repository.query.Param("checkout") java.time.LocalDate checkout
    );
}
