package com.sportportal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JournalDto {
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private String sportType;
    private String imageUrl;

    // Read-only
    private Long authorId;
    private String authorUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
