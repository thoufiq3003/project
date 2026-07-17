package com.example.Turf.controller;

import com.example.Turf.model.Player;
import com.example.Turf.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "*")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    // Get all players for a specific user
    @GetMapping("/user/{userId}")
    public List<Player> getUserPlayers(@PathVariable Long userId) {
        return playerRepository.findByUserId(userId);
    }

    // Save a new player
    @PostMapping
    public Player savePlayer(@RequestBody Player player) {
        return playerRepository.save(player);
    }

    // Update an existing player
    @PutMapping("/{id}")
    public Player updatePlayer(@PathVariable Long id, @RequestBody Player playerDetails) {
        Optional<Player> player = playerRepository.findById(id);
        if (player.isPresent()) {
            Player existingPlayer = player.get();
            existingPlayer.setName(playerDetails.getName());
            existingPlayer.setPhone(playerDetails.getPhone());
            existingPlayer.setRole(playerDetails.getRole());
            existingPlayer.setMatchesPlayed(playerDetails.getMatchesPlayed());
            return playerRepository.save(existingPlayer);
        }
        return null;
    }

    // Delete a player
    @DeleteMapping("/{id}")
    public String deletePlayer(@PathVariable Long id) {
        playerRepository.deleteById(id);
        return "Player deleted successfully!";
    }

    // Get a single player by ID
    @GetMapping("/{id}")
    public Optional<Player> getPlayerById(@PathVariable Long id) {
        return playerRepository.findById(id);
    }
}
