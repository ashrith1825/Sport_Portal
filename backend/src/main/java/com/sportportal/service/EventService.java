package com.sportportal.service;

import com.sportportal.dto.EventDto;
import com.sportportal.entity.Event;
import com.sportportal.entity.EventStatus;
import com.sportportal.entity.User;
import com.sportportal.exception.BadRequestException;
import com.sportportal.exception.ResourceNotFoundException;
import com.sportportal.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserService userService;

    public List<EventDto> getAllEvents() {
        return eventRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<EventDto> getUpcomingEvents() {
        return eventRepository.findByEventDateAfterOrderByEventDateAsc(LocalDateTime.now())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public EventDto getEventById(Long id) {
        Event event = findById(id);
        return toDto(event);
    }

    public List<EventDto> getEventsBySport(String sportType) {
        return eventRepository.findBySportTypeIgnoreCase(sportType)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<EventDto> searchEvents(String keyword) {
        return eventRepository.findByTitleContainingIgnoreCase(keyword)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<EventDto> getMyEvents() {
        User user = userService.getCurrentUser();
        return eventRepository.findByOrganizerId(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public EventDto createEvent(EventDto dto) {
        User organizer = userService.getCurrentUser();
        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .sportType(dto.getSportType())
                .location(dto.getLocation())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .eventDate(dto.getEventDate())
                .endDate(dto.getEndDate())
                .maxParticipants(dto.getMaxParticipants())
                .status(EventStatus.UPCOMING)
                .organizer(organizer)
                .build();
        eventRepository.save(event);
        return toDto(event);
    }

    @Transactional
    public EventDto updateEvent(Long id, EventDto dto) {
        Event event = findById(id);
        User user = userService.getCurrentUser();
        if (!event.getOrganizer().getId().equals(user.getId())) {
            throw new BadRequestException("You can only update your own events");
        }
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setSportType(dto.getSportType());
        event.setLocation(dto.getLocation());
        event.setLatitude(dto.getLatitude());
        event.setLongitude(dto.getLongitude());
        event.setEventDate(dto.getEventDate());
        event.setEndDate(dto.getEndDate());
        event.setMaxParticipants(dto.getMaxParticipants());
        if (dto.getStatus() != null) {
            event.setStatus(EventStatus.valueOf(dto.getStatus()));
        }
        eventRepository.save(event);
        return toDto(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = findById(id);
        User user = userService.getCurrentUser();
        if (!event.getOrganizer().getId().equals(user.getId())) {
            throw new BadRequestException("You can only delete your own events");
        }
        eventRepository.delete(event);
    }

    @Transactional
    public EventDto joinEvent(Long eventId) {
        Event event = findById(eventId);
        User user = userService.getCurrentUser();

        if (event.getParticipants().contains(user)) {
            throw new BadRequestException("You have already joined this event");
        }
        if (event.getMaxParticipants() != null && event.getParticipants().size() >= event.getMaxParticipants()) {
            throw new BadRequestException("Event is full");
        }

        event.getParticipants().add(user);
        eventRepository.save(event);
        return toDto(event);
    }

    @Transactional
    public EventDto leaveEvent(Long eventId) {
        Event event = findById(eventId);
        User user = userService.getCurrentUser();

        if (!event.getParticipants().contains(user)) {
            throw new BadRequestException("You haven't joined this event");
        }

        event.getParticipants().remove(user);
        eventRepository.save(event);
        return toDto(event);
    }

    private Event findById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", id));
    }

    private EventDto toDto(Event event) {
        return EventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .sportType(event.getSportType())
                .location(event.getLocation())
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .eventDate(event.getEventDate())
                .endDate(event.getEndDate())
                .maxParticipants(event.getMaxParticipants())
                .status(event.getStatus().name())
                .organizerId(event.getOrganizer().getId())
                .organizerUsername(event.getOrganizer().getUsername())
                .participantCount(event.getParticipants().size())
                .participantIds(event.getParticipants().stream().map(User::getId).collect(Collectors.toList()))
                .createdAt(event.getCreatedAt())
                .build();
    }
}
