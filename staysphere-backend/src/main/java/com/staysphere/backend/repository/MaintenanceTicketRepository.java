package com.staysphere.backend.repository;

import com.staysphere.backend.model.MaintenanceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, Long> {
    List<MaintenanceTicket> findByStatus(String status);
    List<MaintenanceTicket> findByRoomNumberId(Long roomNumberId);
}
