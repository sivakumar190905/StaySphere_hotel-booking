package com.staysphere.backend.repository;

import com.staysphere.backend.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, String> {
    
    List<Hotel> findByFeaturedTrue();
    
    List<Hotel> findByOwnerId(Long ownerId);

    @Query("SELECT h FROM Hotel h WHERE " +
           "(:city IS NULL OR :city = '' OR LOWER(h.city) = LOWER(:city)) AND " +
           "(:stars IS NULL OR h.stars = :stars) AND " +
           "(:minPrice IS NULL OR h.basePrice >= :minPrice) AND " +
           "(:maxPrice IS NULL OR h.basePrice <= :maxPrice) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(h.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Hotel> searchHotels(
            @Param("city") String city,
            @Param("stars") Integer stars,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("search") String search
    );

    @Query("SELECT COUNT(DISTINCT h.city) FROM Hotel h")
    long countDistinctCities();
}
