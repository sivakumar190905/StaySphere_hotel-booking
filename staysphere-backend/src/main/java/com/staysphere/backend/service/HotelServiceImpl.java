package com.staysphere.backend.service;

import com.staysphere.backend.dto.HotelDto;
import com.staysphere.backend.dto.RoomDto;
import com.staysphere.backend.dto.ReviewDto;
import com.staysphere.backend.exception.ResourceNotFoundException;
import com.staysphere.backend.mapper.DtoMapper;
import com.staysphere.backend.model.Hotel;
import com.staysphere.backend.model.Room;
import com.staysphere.backend.model.RoomNumber;
import com.staysphere.backend.model.User;
import com.staysphere.backend.repository.HotelRepository;
import com.staysphere.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HotelServiceImpl implements HotelService {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.staysphere.backend.repository.BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HotelDto> searchHotels(String city, Integer stars, Double minPrice, Double maxPrice, String search) {
        // Handle empty strings as null for SQL parameter mapping
        String cityParam = (city != null && !city.trim().isEmpty()) ? city.trim() : null;
        String searchParam = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        List<Hotel> hotels = hotelRepository.searchHotels(cityParam, stars, minPrice, maxPrice, searchParam);
        return hotels.stream()
                .map(DtoMapper::toHotelDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HotelDto getHotelById(String id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        return DtoMapper.toHotelDto(hotel);
    }

    @Override
    @Transactional
    public HotelDto createHotel(HotelDto hotelDto, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + ownerId));

        Hotel hotel = Hotel.builder()
                .id(hotelDto.getId() != null ? hotelDto.getId() : "h-" + java.util.UUID.randomUUID().toString().substring(0, 8))
                .name(hotelDto.getName())
                .city(hotelDto.getCity())
                .country(hotelDto.getCountry())
                .address(hotelDto.getAddress())
                .stars(hotelDto.getStars() != null ? hotelDto.getStars() : 5)
                .rating(5.0)
                .reviewCount(0)
                .description(hotelDto.getDescription())
                .basePrice(hotelDto.getBasePrice())
                .tag(hotelDto.getTag())
                .featured(hotelDto.getFeatured() != null ? hotelDto.getFeatured() : false)
                .owner(owner)
                .images(hotelDto.getImages())
                .amenities(hotelDto.getAmenities())
                .build();

        // Map rooms if provided
        if (hotelDto.getRooms() != null) {
            List<Room> rooms = hotelDto.getRooms().stream().map(roomDto -> {
                Room room = Room.builder()
                        .id(roomDto.getId() != null ? roomDto.getId() : hotel.getId() + "-r-" + java.util.UUID.randomUUID().toString().substring(0, 4))
                        .name(roomDto.getName())
                        .type(roomDto.getType())
                        .price(roomDto.getPrice())
                        .guestsCapacity(roomDto.getCapacity() != null ? roomDto.getCapacity().getGuests() : 2)
                        .bedsCapacity(roomDto.getCapacity() != null ? roomDto.getCapacity().getBeds() : 1)
                        .sizeSqFt(roomDto.getSizeSqFt() != null ? roomDto.getSizeSqFt() : 400)
                        .status(roomDto.getStatus() != null ? roomDto.getStatus() : "Available")
                        .images(roomDto.getImages())
                        .amenities(roomDto.getAmenities())
                        .hotel(hotel)
                        .build();

                if (roomDto.getRoomNumbers() != null) {
                    List<RoomNumber> rns = roomDto.getRoomNumbers().stream().map(rnDto -> 
                        RoomNumber.builder()
                                .room(room)
                                .number(rnDto.getNumber())
                                .status(rnDto.getStatus() != null ? rnDto.getStatus() : "Available")
                                .build()
                    ).collect(Collectors.toList());
                    room.setRoomNumbers(rns);
                }
                return room;
            }).collect(Collectors.toList());
            hotel.setRooms(rooms);
        }

        Hotel savedHotel = hotelRepository.save(hotel);
        return DtoMapper.toHotelDto(savedHotel);
    }

    @Override
    @Transactional
    public HotelDto updateHotel(String id, HotelDto hotelDto) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        hotel.setName(hotelDto.getName());
        hotel.setCity(hotelDto.getCity());
        hotel.setCountry(hotelDto.getCountry());
        hotel.setAddress(hotelDto.getAddress());
        if (hotelDto.getStars() != null) hotel.setStars(hotelDto.getStars());
        hotel.setDescription(hotelDto.getDescription());
        hotel.setBasePrice(hotelDto.getBasePrice());
        hotel.setTag(hotelDto.getTag());
        if (hotelDto.getFeatured() != null) hotel.setFeatured(hotelDto.getFeatured());
        if (hotelDto.getImages() != null) hotel.setImages(hotelDto.getImages());
        if (hotelDto.getAmenities() != null) hotel.setAmenities(hotelDto.getAmenities());

        Hotel savedHotel = hotelRepository.save(hotel);
        return DtoMapper.toHotelDto(savedHotel);
    }

    @Override
    @Transactional
    public void deleteHotel(String id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        hotelRepository.delete(hotel);
    }

    @Override
    @Transactional
    public void approveHotel(String id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        if ("Pending Approval".equalsIgnoreCase(hotel.getTag())) {
            hotel.setTag(null); // approval clears the pending tag
            hotelRepository.save(hotel);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDto> getFeaturedHotels() {
        return hotelRepository.findByFeaturedTrue().stream()
                .map(DtoMapper::toHotelDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDto> getPartnerHotels(Long ownerId) {
        return hotelRepository.findByOwnerId(ownerId).stream()
                .map(DtoMapper::toHotelDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDto> getFavorites(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getFavoriteHotels().stream()
                .map(DtoMapper::toHotelDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleFavorite(Long userId, String hotelId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));

        if (user.getFavoriteHotels().contains(hotel)) {
            user.getFavoriteHotels().remove(hotel);
        } else {
            user.getFavoriteHotels().add(hotel);
        }
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDto> searchAvailableHotels(String city, java.time.LocalDate checkin, java.time.LocalDate checkout, Integer guests, Double price, Double rating, List<String> amenities) {
        List<Hotel> allHotels = hotelRepository.findAll();

        return allHotels.stream()
                .filter(hotel -> {
                    if (city != null && !city.trim().isEmpty()) {
                        if (!hotel.getCity().equalsIgnoreCase(city.trim())) {
                            return false;
                        }
                    }
                    if (price != null && price > 0) {
                        if (hotel.getBasePrice() > price) {
                            return false;
                        }
                    }
                    if (rating != null && rating > 0) {
                        if (hotel.getRating() < rating) {
                            return false;
                        }
                    }
                    if (amenities != null && !amenities.isEmpty()) {
                        boolean hasAll = hotel.getAmenities().stream()
                                .map(String::toLowerCase)
                                .collect(Collectors.toSet())
                                .containsAll(amenities.stream().map(String::toLowerCase).collect(Collectors.toList()));
                        if (!hasAll) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(hotel -> {
                    HotelDto dto = DtoMapper.toHotelDto(hotel);
                    if (dto.getRooms() == null) return dto;

                    List<RoomDto> availableRooms = dto.getRooms().stream()
                            .filter(roomDto -> {
                                if (guests != null && guests > 0) {
                                    if (roomDto.getCapacity() != null && roomDto.getCapacity().getGuests() < guests) {
                                        return false;
                                    }
                                }
                                if (price != null && price > 0) {
                                    if (roomDto.getPrice() > price) {
                                        return false;
                                    }
                                }
                                if (checkin != null && checkout != null) {
                                    long bookedCount = bookingRepository.countOverlappingBookings(roomDto.getId(), checkin, checkout);
                                    long totalRooms = roomDto.getRoomNumbers() != null ? roomDto.getRoomNumbers().size() : 0;
                                    long available = totalRooms - bookedCount;
                                    roomDto.setAvailableCount((int) Math.max(0, available));
                                    return bookedCount < totalRooms;
                                }
                                return true;
                            })
                            .collect(Collectors.toList());

                    dto.setRooms(availableRooms);
                    if (!availableRooms.isEmpty()) {
                        dto.setBasePrice(availableRooms.stream().mapToDouble(RoomDto::getPrice).min().orElse(dto.getBasePrice()));
                    }
                    return dto;
                })
                .filter(hotelDto -> hotelDto.getRooms() != null && !hotelDto.getRooms().isEmpty())
                .collect(Collectors.toList());
    }
}
