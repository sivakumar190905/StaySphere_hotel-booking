package com.staysphere.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    private String id; // custom ID, e.g. "h_mumbai_0-rev1"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "guest_name", nullable = false)
    private String guestName;

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(name = "positive_points", columnDefinition = "TEXT")
    private String positivePoints;

    @Column(name = "negative_points", columnDefinition = "TEXT")
    private String negativePoints;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
