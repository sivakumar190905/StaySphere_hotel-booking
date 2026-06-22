package com.staysphere.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    private String id;

    @Column(name = "invoice_number", unique = true, nullable = false)
    private String invoiceNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", unique = true, nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private Double subtotal;

    @Column(nullable = false)
    @Builder.Default
    private Double discount = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double cgst = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double sgst = 0.0;

    @Column(nullable = false)
    private Double total;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
