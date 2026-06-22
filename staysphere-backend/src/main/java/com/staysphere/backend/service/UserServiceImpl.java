package com.staysphere.backend.service;

import com.staysphere.backend.dto.*;
import com.staysphere.backend.exception.BadRequestException;
import com.staysphere.backend.exception.ResourceNotFoundException;
import com.staysphere.backend.model.*;
import com.staysphere.backend.repository.PartnerRequestRepository;
import com.staysphere.backend.repository.RefreshTokenRepository;
import com.staysphere.backend.repository.UserRepository;
import com.staysphere.backend.security.JwtTokenProvider;
import com.staysphere.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.staysphere.backend.repository.PasswordResetTokenRepository;
import java.time.LocalDateTime;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private PartnerRequestRepository partnerRequestRepository;

    @Value("${app.jwt.refreshTokenExpirationMs}")
    private Long refreshTokenDurationMs;

    @Override
    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Remove existing refresh tokens first to prevent session bloat
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        refreshTokenRepository.deleteByUser(user);

        // Generate new refresh token
        RefreshToken refreshToken = createRefreshToken(user);

        return new JwtResponse(
                jwt,
                refreshToken.getToken(),
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                userDetails.getPhone()
        );
    }

    @Override
    @Transactional
    public UserProfileDto registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        Role userRole = Role.CUSTOMER;

        User user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .phone(registerRequest.getPhone())
                .passwordHash(encoder.encode(registerRequest.getPassword()))
                .role(userRole)
                .build();

        User savedUser = userRepository.save(user);

        return UserProfileDto.builder()
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole().name())
                .emailVerified(savedUser.isEmailVerified())
                .build();
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenRepository.findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtTokenProvider.generateTokenFromUsername(user.getEmail());
                    return new TokenRefreshResponse(token, requestRefreshToken);
                })
                .orElseThrow(() -> new BadRequestException("Refresh token is not in database!"));
    }

    @Override
    @Transactional
    public void logoutUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        refreshTokenRepository.deleteByUser(user);
    }

    @Override
    public UserProfileDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserProfileDto.builder()
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .build();
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .token(UUID.randomUUID().toString())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new BadRequestException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Delete existing tokens
        passwordResetTokenRepository.deleteByUser(user);

        // Generate 6 digit code
        String token = String.format("%06d", (int) (Math.random() * 1000000));
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetCode(email, token);
        activityLogService.logActivity(user, "Password Reset Code Sent", "Simulated password reset verification code dispatched to user email", null);
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid reset token!"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Reset token has expired!");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(encoder.encode(newPassword));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
        activityLogService.logActivity(user, "Password Reset Successfully", "User reset password successfully using verification code", null);
    }

    @Override
    @Transactional
    public void verifyEmail(String email, String token) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        PasswordResetToken verifyToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token!"));

        if (!verifyToken.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Verification token does not match user!");
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        passwordResetTokenRepository.delete(verifyToken);
        activityLogService.logActivity(user, "Email Verified", "User account email verification flag set to true", null);
    }

    @Override
    @Transactional
    public void sendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Delete existing verification tokens
        passwordResetTokenRepository.deleteByUser(user);

        String token = String.format("%06d", (int) (Math.random() * 1000000));
        PasswordResetToken verifyToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();
        passwordResetTokenRepository.save(verifyToken);

        emailService.sendEmailVerificationCode(email, token);
        activityLogService.logActivity(user, "Verification Email Sent", "Simulated email verification code dispatched", null);
    }

    @Override
    @Transactional
    public void registerPartnerRequest(PartnerRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }
        if (partnerRequestRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Partnership request already pending/approved!");
        }

        PartnerRequest partnerReq = PartnerRequest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(encoder.encode(request.getPassword()))
                .hotelName(request.getHotelName())
                .hotelAddress(request.getHotelAddress())
                .status("PENDING")
                .build();

        partnerRequestRepository.save(partnerReq);
    }

    @Override
    public java.util.List<AdminUserDto> getAllUsersExceptAdmin() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != Role.ADMIN)
                .map(u -> AdminUserDto.builder()
                        .id(u.getId())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .role(u.getRole().name())
                        .emailVerified(u.isEmailVerified())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public void createStaff(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }

        User user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .phone(registerRequest.getPhone())
                .passwordHash(encoder.encode(registerRequest.getPassword()))
                .role(Role.STAFF)
                .emailVerified(true)
                .build();

        userRepository.save(user);
        activityLogService.logActivity(user, "Staff Account Created", "Admin created staff account for email: " + user.getEmail(), null, "User", String.valueOf(user.getId()));
    }

    @Override
    @Transactional
    public void suspendUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be suspended/deleted!");
        }
        userRepository.delete(user);
        activityLogService.logActivity(null, "User Account Suspended", "Admin suspended user account: " + user.getEmail(), null, "User", String.valueOf(id));
    }

    @Override
    public java.util.List<PartnerRequest> getPartnerRequests() {
        return partnerRequestRepository.findAll();
    }

    @Override
    @Transactional
    public void approvePartnerRequest(Long id) {
        PartnerRequest req = partnerRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner request not found with id: " + id));

        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            throw new BadRequestException("Request is already processed!");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            req.setStatus("REJECTED");
            partnerRequestRepository.save(req);
            throw new BadRequestException("User with this email is already registered!");
        }

        req.setStatus("APPROVED");
        partnerRequestRepository.save(req);

        User partnerUser = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .passwordHash(req.getPasswordHash())
                .role(Role.PARTNER)
                .emailVerified(true)
                .build();

        userRepository.save(partnerUser);
        activityLogService.logActivity(partnerUser, "Partner Approved", "Admin approved partner request and created account: " + partnerUser.getEmail(), null, "User", String.valueOf(partnerUser.getId()));
    }

    @Override
    @Transactional
    public void rejectPartnerRequest(Long id) {
        PartnerRequest req = partnerRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner request not found with id: " + id));

        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            throw new BadRequestException("Request is already processed!");
        }

        req.setStatus("REJECTED");
        partnerRequestRepository.save(req);
        activityLogService.logActivity(null, "Partner Request Rejected", "Admin rejected partner request for email: " + req.getEmail(), null, "PartnerRequest", String.valueOf(id));
    }
}
