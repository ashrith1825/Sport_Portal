package com.sportportal.controller;

import com.sportportal.dto.ApiResponse;
import com.sportportal.dto.JournalDto;
import com.sportportal.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*") 
@RequestMapping("/api/journals")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @GetMapping
    public ResponseEntity<List<JournalDto>> getAllJournals() {
        return ResponseEntity.ok(journalService.getAllJournals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalDto> getJournalById(@PathVariable Long id) {
        return ResponseEntity.ok(journalService.getJournalById(id));
    }

    @GetMapping("/sport/{sportType}")
    public ResponseEntity<List<JournalDto>> getJournalsBySport(@PathVariable String sportType) {
        return ResponseEntity.ok(journalService.getJournalsBySport(sportType));
    }

    @GetMapping("/search")
    public ResponseEntity<List<JournalDto>> searchJournals(@RequestParam String keyword) {
        return ResponseEntity.ok(journalService.searchJournals(keyword));
    }

    @GetMapping("/my")
    public ResponseEntity<List<JournalDto>> getMyJournals() {
        return ResponseEntity.ok(journalService.getMyJournals());
    }

    @PostMapping
    public ResponseEntity<JournalDto> createJournal(@Valid @RequestBody JournalDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(journalService.createJournal(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JournalDto> updateJournal(@PathVariable Long id, @Valid @RequestBody JournalDto dto) {
        return ResponseEntity.ok(journalService.updateJournal(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteJournal(@PathVariable Long id) {
        journalService.deleteJournal(id);
        return ResponseEntity.ok(new ApiResponse(true, "Journal deleted successfully"));
    }
}
