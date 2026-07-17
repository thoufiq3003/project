package com.example.Turf.model;

import jakarta.persistence.*;

@Entity
@Table(name = "saved_teams")
public class SavedTeam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // Links this team to the logged-in user's profile
    
    private String teamName;
    
    @Column(length = 2000)
    private String playerNames; // Comma-separated list of players

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public String getPlayerNames() { return playerNames; }
    public void setPlayerNames(String playerNames) { this.playerNames = playerNames; }
}