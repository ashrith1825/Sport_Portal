package com.sportportal.controller;

import com.sportportal.dto.ApiResponse;
import com.sportportal.dto.ClubDto;
import com.sportportal.service.ClubService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*") 
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;

    @GetMapping
    public ResponseEntity<List<ClubDto>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubDto> getClubById(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.getClubById(id));
    }

    @GetMapping("/sport/{sportType}")
    public ResponseEntity<List<ClubDto>> getClubsBySport(@PathVariable String sportType) {
        return ResponseEntity.ok(clubService.getClubsBySport(sportType));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClubDto>> searchClubs(@RequestParam String keyword) {
        return ResponseEntity.ok(clubService.searchClubs(keyword));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ClubDto>> getMyClubs() {
        return ResponseEntity.ok(clubService.getMyClubs());
    }

    @PostMapping
    public ResponseEntity<ClubDto> createClub(@Valid @RequestBody ClubDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clubService.createClub(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClubDto> updateClub(@PathVariable Long id, @Valid @RequestBody ClubDto dto) {
        return ResponseEntity.ok(clubService.updateClub(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteClub(@PathVariable Long id) {
        clubService.deleteClub(id);
        return ResponseEntity.ok(new ApiResponse(true, "Club deleted successfully"));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ClubDto> joinClub(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.joinClub(id));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<ClubDto> leaveClub(@PathVariable Long id) {
        return ResponseEntity.ok(clubService.leaveClub(id));
    }
}
