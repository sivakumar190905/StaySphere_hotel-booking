package com.staysphere.backend.controller;

import com.staysphere.backend.repository.HotelRepository;
import com.staysphere.backend.repository.RoomNumberRepository;
import com.staysphere.backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/public/stats")
public class StatsController {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomNumberRepository roomNumberRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public ResponseEntity<?> getStats() {
        long hotelsCount = hotelRepository.count();
        long citiesCount = hotelRepository.countDistinctCities();
        long roomsCount = roomNumberRepository.count();
        long bookingsCount = bookingRepository.count();

        return ResponseEntity.ok(Map.of(
                "hotelsCount", hotelsCount,
                "citiesCount", citiesCount,
                "roomsCount", roomsCount,
                "bookingsCount", bookingsCount
        ));
    }
}
