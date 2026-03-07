package com.sportportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class EventDto {
    private Long id;

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String sportType;

    private String location;

    private Double latitude;
    private Double longitude;

    @NotNull
    private LocalDateTime eventDate;

    private LocalDateTime endDate;
    private Integer maxParticipants;
    private String status;

    // Read-only fields
    private Long organizerId;
    private String organizerUsername;
    private int participantCount;
    private List<Long> participantIds;
    private LocalDateTime createdAt;
}
