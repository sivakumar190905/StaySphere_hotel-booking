package com.staysphere.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private String id; // custom ID, e.g. "STS-2026-00125"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel hotel;

    @Column(name = "hotel_name", nullable = false)
    private String hotelName;

    @Column(name = "hotel_image", nullable = false, columnDefinition = "TEXT")
    private String hotelImage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @Column(nullable = false)
    private Integer guests;

    @Column(name = "rooms_count", nullable = false)
    private Integer roomsCount;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Column(name = "guest_full_name", nullable = false)
    private String guestFullName;

    @Column(name = "guest_email", nullable = false)
    private String guestEmail;

    @Column(name = "guest_phone", nullable = false)
    private String guestPhone;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    @Builder.Default
    private String status = "Pending Approval"; // 'Pending Approval', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled', 'Refunded'

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "discount_amount")
    @Builder.Default
    private Double discountAmount = 0.0;

    @Builder.Default
    private Double cgst = 0.0;

    @Builder.Default
    private Double sgst = 0.0;

    @Column(name = "gst_company")
    private String gstCompany;

    private String gstin;

    @Column(name = "assigned_room_number")
    private String assignedRoomNumber;

    @Column(name = "qr_code_token")
    private String qrCodeToken;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
