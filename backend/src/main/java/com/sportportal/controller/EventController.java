package com.sportportal.controller;

import com.sportportal.dto.ApiResponse;
import com.sportportal.dto.EventDto;
import com.sportportal.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventDto>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDto>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/sport/{sportType}")
    public ResponseEntity<List<EventDto>> getEventsBySport(@PathVariable String sportType) {
        return ResponseEntity.ok(eventService.getEventsBySport(sportType));
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventDto>> searchEvents(@RequestParam String keyword) {
        return ResponseEntity.ok(eventService.searchEvents(keyword));
    }

    @GetMapping("/my")
    public ResponseEntity<List<EventDto>> getMyEvents() {
        return ResponseEntity.ok(eventService.getMyEvents());
    }

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@Valid @RequestBody EventDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDto dto) {
        return ResponseEntity.ok(eventService.updateEvent(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(new ApiResponse(true, "Event deleted successfully"));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<EventDto> joinEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.joinEvent(id));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<EventDto> leaveEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.leaveEvent(id));
    }
}
