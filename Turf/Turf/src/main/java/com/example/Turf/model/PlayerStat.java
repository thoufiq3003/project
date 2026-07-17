package com.example.Turf.model;

import jakarta.persistence.*;

@Entity
@Table(name = "player_stats")
public class PlayerStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long matchId;
    private String playerName;
    private String teamName;

    private int runsScored = 0;
    private int ballsFaced = 0;
    private int ballsBowled = 0;
    private int wicketsTaken = 0;
    
    // NEW: Track if the player is Out
    private boolean isOut = false; 

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public int getRunsScored() { return runsScored; }
    public void setRunsScored(int runsScored) { this.runsScored = runsScored; }
    public int getBallsFaced() { return ballsFaced; }
    public void setBallsFaced(int ballsFaced) { this.ballsFaced = ballsFaced; }
    public int getBallsBowled() { return ballsBowled; }
    public void setBallsBowled(int ballsBowled) { this.ballsBowled = ballsBowled; }
    public int getWicketsTaken() { return wicketsTaken; }
    public void setWicketsTaken(int wicketsTaken) { this.wicketsTaken = wicketsTaken; }
    
    // NEW Getters and Setters
    public boolean isOut() { return isOut; }
    public void setOut(boolean isOut) { this.isOut = isOut; }
}