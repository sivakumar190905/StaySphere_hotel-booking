package com.staysphere.backend.repository;

import com.staysphere.backend.model.RoomNumber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomNumberRepository extends JpaRepository<RoomNumber, Long> {
    List<RoomNumber> findByRoomId(String roomId);
    Optional<RoomNumber> findByRoomIdAndNumber(String roomId, String number);
}
