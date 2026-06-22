package com.staysphere.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_numbers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomNumber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private String number;

    @Column(nullable = false)
    @Builder.Default
    private String status = "Available"; // 'Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance', 'Blocked'
}
