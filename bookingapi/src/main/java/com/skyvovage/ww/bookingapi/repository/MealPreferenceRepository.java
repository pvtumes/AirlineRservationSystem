package com.skyvovage.ww.bookingapi.repository;

import com.skyvovage.ww.bookingapi.entity.MealPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for the meal_preference table.
 */
@Repository
public interface MealPreferenceRepository extends JpaRepository<MealPreference, String> {
}
