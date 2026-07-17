package com.example.Turf.controller;

import com.example.Turf.model.SavedTeam;
import com.example.Turf.repository.SavedTeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    @Autowired
    private SavedTeamRepository teamRepository;

    @GetMapping("/{userId}")
    public List<SavedTeam> getUserTeams(@PathVariable Long userId) {
        return teamRepository.findByUserId(userId);
    }

    @PostMapping
    public SavedTeam saveTeamToProfile(@RequestBody SavedTeam team) {
        return teamRepository.save(team);
    }
}