package com.skyvovage.ww.bookingapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A slim result entry in the bulk-save response.
 * Shape: { "id": 1, "name": "Neha Sharma" }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SavedPassengerResultDto {

    /** The auto-generated saved_pax_id from the DB. */
    private Integer id;

    private String name;
}
